import * as core from "@actions/core";
import * as fs from 'fs';
import csvParser from 'csv-parser';
const csvWriterCreator = require('csv-writer').createArrayCsvWriter;

async function run(): Promise<void> {
    try {
        const INPUT = core.getInput('input');
        const OUTPUT = core.getInput('output');
        const COLUMNS = getColumns(core.getInput('columns'));
        const HEADER = core.getInput('header');
        const ENCODING = core.getInput('encoding');
        const LINEFEED = getLinefeed(core.getInput('linefeed'));
        const SEPARATOR = core.getInput('separator');
        const IS_QUOTE = core.getInput('quoting') == 'true';

        let n = 0;
        const records = new Array<Array<String>>();
        let headers: String[] = [];
        let parserOptions : csvParser.Options = { separator: SEPARATOR };
        if (HEADER == 'false') parserOptions = { separator: SEPARATOR, headers: false };

        const writerOptions: {
            path: string;
            header?: Array<String>,
            fieldDelimiter: string,
            recordDelimiter: string,
            alwaysQuote: boolean,
            encoding: string,
            append: boolean
        } = {
            path: OUTPUT,
            fieldDelimiter: SEPARATOR,
            recordDelimiter: LINEFEED,
            alwaysQuote: IS_QUOTE,
            encoding: ENCODING,
            append: false
        };

        core.info(`Creating from ${INPUT} to ${OUTPUT} ...`);

        fs.createReadStream(INPUT)
            .pipe(csvParser(parserOptions))
            .on('headers', (head) => {
                headers = head;
            })
            .on('data', (data) => {
                n++;
                const row: Array<String> = [];
                let i = 0;
                for (const key in data) {
                    const col = data[key];
                    if ( COLUMNS.includes(i) ) {
                        row.push(col + String(n));
                    } else {
                        row.push(col);
                    }
                    i++;
                }
                records.push(row);
            })
            .on('end', () => {
                // start writing output CSV
                if (HEADER == 'true') writerOptions["header"] = headers;
                const csvWriter = csvWriterCreator(writerOptions);
                csvWriter.writeRecords(records)
                    .then(() => {
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
        return ret;
    }

    function getLinefeed(linefeed: string) {
        if (linefeed.toUpperCase() == 'CRLF' ) {
            return '\r\n';
        } else if (linefeed.toUpperCase() == 'LF') {
            return '\n';
        } else {
            throw new Error(`Invalid linefeed value: ${linefeed}`);
        }
    }
}

run();
