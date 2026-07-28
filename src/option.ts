import * as core from '@actions/core';

export const INPUT = getInput('INPUT');
export const OUTPUT = getInput('OUTPUT');
export const COLUMNS = getColumns(getInput('COLUMNS'));
export const SOURCE = Number.parseInt(getInput('SOURCE', '-1'))
export const HEADER = getInput('HEADER', 'true') == 'true';
export const ENCODING = getInput('ENCODING', 'utf8');
export const LINEFEED = getLinefeed(getInput('LINEFEED', 'CRLF'));
export const SEPARATOR = getInput('SEPARATOR', ',');
export const ESCAPE = getInput('ESCAPE', '"');
export const IS_QUOTE = getInput('QUOTE_ALWAYS', 'false') == 'true';

function getColumns(columns: string) : Array<number> {
    const ret = new Array<number>();
    columns.split(',').forEach((value) => {
        ret.push(Number(value));
    });
    if (columns.length == 0) {
        throw new Error('columns are not specified.');
    }
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

function getInput(key: string, defaultValue: string|undefined = undefined) : string {
    return core.getInput(key);
}
