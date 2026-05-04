"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const csvWriterCreator = require('csv-writer').createArrayCsvWriter;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const INPUT = core.getInput('input');
            const OUTPUT = core.getInput('output');
            const COLUMNS = Array.from(core.getInput('columns'));
            const HEADER = core.getInput('header');
            const ENCODING = core.getInput('encoding');
            const LINEFEED = core.getInput('linefeed');
            const DELIMITER = core.getInput('delimiter');
            const IS_QUOTE = Boolean(core.getInput('quoting'));
            core.info(`Creating {OUTPUT} from {INPUT}`);
            let n = 1;
            const records = new Array();
            let parserOptions = { separator: DELIMITER };
            if (HEADER == 'false')
                parserOptions = { separator: DELIMITER, headers: false };
            fs.createReadStream(INPUT)
                .pipe((0, csv_parser_1.default)(parserOptions))
                .on('data', (data) => {
                for (const col of COLUMNS) {
                    const num_col = Number(col);
                    data[num_col] = data[num_col] + String(n++);
                }
                records.push(data);
            });
            let msg = "";
            for (const key of records.keys()) {
                msg += key + " ";
            }
            ;
            core.info(msg);
            const writerOptions = {
                path: OUTPUT,
                fieldDelimiter: DELIMITER,
                recordDelimiter: LINEFEED,
                alwaysQuote: IS_QUOTE,
                encoding: ENCODING,
                append: false
            };
            if (HEADER == 'true')
                writerOptions["header"] = records[0];
            const csvWriter = csvWriterCreator(writerOptions);
            csvWriter.writeRecords(records)
                .then(() => {
                core.info("Done.");
            });
            // output for GITHUB_OUTPUT
            core.setOutput('lines', n - 1);
            core.setOutput('output', OUTPUT);
        }
        catch (error) {
            core.setFailed(`Failed: {error}`);
        }
    });
}
run();
