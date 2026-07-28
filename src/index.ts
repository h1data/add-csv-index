import * as core from '@actions/core';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import csvWriter from 'csvwriter';
import * as options from './option';

async function run(): Promise<void> {
    try {
        let n = 0;
        const records : Array<Object> = [];
        let headers: string[] = [];
        let parserOptions : csvParser.Options = {
            separator: options.SEPARATOR,
            headers: options.HEADER ? undefined : false,
            escape: options.ESCAPE,
            quote: options.ESCAPE
        };

        const writerOptions = {
            header: options.HEADER, 
            delimiter: options.SEPARATOR,
            fields: headers.join(','),
            crlf: options.LINEFEED == '\r\n',
            quote: options.ESCAPE,
            quoteMode: options.IS_QUOTE
        };

        core.info(`Creating from ${options.INPUT} to ${options.OUTPUT} ...`);

        fs.createReadStream(options.INPUT)
            .pipe(csvParser(parserOptions))
            .on('headers', (head) => {
                headers = head;
            })
            .on('data', (data) => {
                // TODO use value mapping
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
                csvWriter(records, writerOptions, (error, csv) => {
                    if (error) throw error;
                    fs.writeFileSync(options.OUTPUT, csv, options.ENCODING as fs.WriteFileOptions);
                    // output for GITHUB_OUTPUT
                    core.setOutput('lines', n);
                    core.setOutput('output', options.OUTPUT);
                    core.info("Done.");
                });
            });

    } catch (error: any) {
        core.setFailed('Failed: ' + error.message);
    }
}

run();
