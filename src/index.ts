import * as core from '@actions/core';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import csvWriter from 'csvwriter';

async function run(): Promise<void> {
    try {
        const INPUT = core.getInput('input');
        const OUTPUT = core.getInput('output');
        const COLUMNS = getColumns(core.getInput('columns'));
        const HEADER = core.getInput('header') == 'true';
        const ENCODING = core.getInput('encoding');
        const LINEFEED = getLinefeed(core.getInput('linefeed'));
        const SEPARATOR = core.getInput('separator');
        const ESCAPE = core.getInput('escape');
        const IS_QUOTE = core.getInput('quote-always') == 'true';

        let n = 0;
        const records = new Array<Object>();
        let headers: string[] = [];
        let parserOptions : csvParser.Options = {
            separator: SEPARATOR,
            headers: HEADER ? undefined : false,
            escape: ESCAPE,
            quote: ESCAPE,
            newline: LINEFEED,
        };

        const writerOptions = {
            path: OUTPUT,
            header: HEADER ? headers : undefined, 
            fieldDelimiter: SEPARATOR,
            recordDelimiter: LINEFEED,
            alwaysQuote: IS_QUOTE,
            encoding: ENCODING,
            escape: ESCAPE,
            append: false
        };

        core.info(`Creating from ${INPUT} to ${OUTPUT} ...`);

        fs.createReadStream(INPUT)
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
                    if ( COLUMNS.includes(i) ) {
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
                    fs.writeFileSync(OUTPUT, csv, ENCODING as fs.WriteFileOptions);
                    // output for GITHUB_OUTPUT
                    core.setOutput('lines', n);
                    core.setOutput('output', OUTPUT);
                    core.info("Done.");
                });
            });

    } catch (error: any) {
        core.setFailed('Failed: ' + error.message);
    }

    function getColumns(columns: string) {
        const ret = new Array<number>();
        columns.split(',').forEach((value) => {
            ret.push(Number(value));
        });
        if (columns.length == 0) {
            core.error('columns are not specified.');
            process.exit(1);
        }
        return ret;
    }

    function getLinefeed(linefeed: string) {
        if (linefeed.toUpperCase() == 'CRLF' ) {
            return '\r\n';
        } else if (linefeed.toUpperCase() == 'LF') {
            return '\n';
        } else {
            core.error(`Invalid linefeed value: ${linefeed}`);
            process.exit(1);
        }
    }
}

run();
