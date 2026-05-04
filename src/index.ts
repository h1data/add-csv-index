import * as core from "@actions/core";
import * as fs from 'fs';
import csvParser from 'csv-parser';
const csvWriterCreator = require('csv-writer').createArrayCsvWriter;

async function run(): Promise<void> {
    try {
        const INPUT = core.getInput('input');
        const OUTPUT = core.getInput('output');
        const COLUMNS = Array.from<string>(core.getInput('columns'));
        const HEADER = core.getInput('header');
        const ENCODING = core.getInput('encoding');
        const LINEFEED = getLinefeed(core.getInput('linefeed'));
        const DELIMITER = core.getInput('delimiter');
        const IS_QUOTE = Boolean(core.getInput('quoting'));
        core.info(`Creating ${OUTPUT} from ${INPUT}`);

        let n = 1;
        const records = new Array<Array<String>>();

        let parserOptions : csvParser.Options = { separator: DELIMITER };
        if (HEADER == 'false') parserOptions = { separator: DELIMITER, headers: false };

        fs.createReadStream(INPUT)
          .pipe(csvParser(parserOptions))
          .on('data', (data: String[]) => {
              for (const col of COLUMNS) {
                  core.info(col);
                  const num_col = Number(col);
                  data[num_col] = data[num_col] + String(n++);
              }
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
            fieldDelimiter: DELIMITER,
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
        core.setOutput('lines', n - 1);
        core.setOutput('output', OUTPUT);
    } catch (error: any) {
        core.setFailed('Failed: ' + error.message);
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
