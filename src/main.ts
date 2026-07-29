import fs from 'fs';
import csvParser from 'csv-parser';
import csvWriter from 'csvwriter';
import Adapter from './ci/CIAdapter';
import * as option from './option';

export async function run(adapter: Adapter): Promise<void> {
    try {

        const options = option.getOptions(adapter);

        const INPUT_REGEXP = RegExp(options.INPUT.replace('.', '\\.').replace('\*', '(?<langCode>.+)'));

        let parserOptions : csvParser.Options = {
            separator: options.SEPARATOR,
            headers: options.HEADER ? undefined : false,
            escape: options.ESCAPE,
            quote: options.ESCAPE
        };

        for (const input of fs.globSync(options.INPUT)) {
            let n = 0;
            const records : Array<Object> = [];
            let headers: string[] = [];

            let output = options.OUTPUT;
            if (output.includes('*')) {
                const langMatch = input.match(INPUT_REGEXP);
                if (langMatch?.groups == undefined) {
                    console.warn(`language code not found, skipped ${input}`);
                    continue;
                }
                output = options.OUTPUT.replace('*', langMatch.groups.langCode);
            }
            adapter.info(`Creating from ${options.INPUT} to ${options.OUTPUT} ...`);

            let sourceKey = '';
            if (!options.HEADER && options.SOURCE >= 0) sourceKey = options.SOURCE.toString();

            fs.createReadStream(options.INPUT)
                .pipe(csvParser(parserOptions))
                .on('headers', (head) => {
                    headers = head;
                })
                .on('data', (data) => {
                    n++;
                    const row: Object = {};
                    let i = 0;
                    for (const key in data) {
                        const col = data[key];
                        if ( options.COLUMNS.includes(i) ) {
                            row[key] = col + String(n);
                        } else {
                            row[key] = col;
                        }
                        i++;
                    }
                    records.push(row);
                })
                .on('end', () => {
                    // start writing output CSV
                    const writerOptions = {
                        header: options.HEADER, 
                        delimiter: options.SEPARATOR,
                        fields: headers.join(','),
                        crlf: options.LINEFEED == '\r\n',
                        quote: options.ESCAPE,
                        quoteMode: options.IS_QUOTE
                    };
                    csvWriter(records, writerOptions, (error, csv) => {
                        if (error) throw error;
                        fs.writeFileSync(options.OUTPUT, csv, options.ENCODING as fs.WriteFileOptions);
                        // output stats
                        adapter.setOutput?.('lines', n);
                        adapter.setOutput?.('output', options.OUTPUT);
                        adapter.info("Done.");
                    });
                });
        }
    } catch (error: any) {
        adapter.error('Failed: ' + error.message);
        process.exit(-1);
    }
}
