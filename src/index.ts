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
        const IS_QUOTE = Boolean(core.getInput('quoting'));
        core.info(`Creating from ${INPUT} to ${OUTPUT}`);
        core.info(`input: ${INPUT}`);
        core.info(`output: ${OUTPUT}`);
        core.info(`columns: ${COLUMNS.join(',')}`);
        core.info(`header: ${HEADER}`);
        core.info(`encoding: ${ENCODING}`);
        core.info(`linefeed: ${LINEFEED}`);
        core.info(`separator: ${SEPARATOR}`);
        core.info(`quoting: ${IS_QUOTE}`);

        let n = 0;
        const records = new Array<Array<String>>();

        let parserOptions : csvParser.Options = { separator: SEPARATOR };
        if (HEADER == 'false') parserOptions = { separator: SEPARATOR, headers: false };

        fs.createReadStream(INPUT)
          .pipe(csvParser(parserOptions))
          .on('data', (data: String[]) => {
              n++;
              for (const col of COLUMNS) {
                data[col] = data[col] + String(n);
              }
              core.info('data: ' + data.join(','));
              records.push(data);
          });

        let msg = "";
        for (const key of records.keys()) {
            msg += key + " ";
        };
        core.info(msg);
        
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
        if (HEADER == 'true') writerOptions["header"] = records[0];

        const csvWriter = csvWriterCreator(writerOptions);
        csvWriter.writeRecords(records)
                 .then(() => {
                     core.info("Done.");
                 });

        // output for GITHUB_OUTPUT
        core.setOutput('lines', n);
        core.setOutput('output', OUTPUT);
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
