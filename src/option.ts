import Adapter from './ci/CIAdapter';

export const optionDefinitions = {
    INPUT: { name: 'input' },
    OUTPUT: { name: 'output' },
    COLUMNS: { name: 'columns' },
    SOURCE: { name: 'source', type: Number, defaultValue: -1 },
    HEADER: { name: 'no-header', type: Boolean, inverse: true},
    ENCODING: { name: 'encoding', defaultValue: 'utf8' },
    UTF_BOM: { name: 'utf-bom', type: Boolean }, 
    LINEFEED: { name: 'linefeed', defaultValue: 'CRLF' },
    SEPARATOR: { name: 'separator', defaultValue: ',' },
    ESCAPE: { name: 'escape', defaultValue: '"'},
    QUOTE_ALWAYS: { name: 'quote-always', type: Boolean }
};

export interface Options {
    INPUT: string,
    OUTPUT: string,
    COLUMNS: Array<number>,
    SOURCE: number,
    HEADER: boolean,
    ENCODING: string,
    UTF_BOM: boolean,
    LINEFEED: string,
    SEPARATOR: string,
    ESCAPE: string,
    IS_QUOTE: boolean
};

export function getOptions(adapter: Adapter) : Options {
    return {
        INPUT: adapter.getInput('INPUT'),
        OUTPUT: adapter.getInput('OUTPUT', undefined),
        COLUMNS: getColumns(adapter.getInput('COLUMNS', undefined)),
        SOURCE: Number.parseInt(adapter.getInput('SOURCE', '-1')),
        HEADER: adapter.getInput('HEADER', 'true') == 'true',
        ENCODING: adapter.getInput('ENCODING', 'utf8'),
        UTF_BOM: adapter.getInput('UTF_BOM', 'false') == 'true',
        LINEFEED: getLinefeed(adapter.getInput('LINEFEED', 'CRLF')),
        SEPARATOR: adapter.getInput('SEPARATOR', ','),
        ESCAPE: adapter.getInput('ESCAPE', '"'),
        IS_QUOTE: adapter.getInput('QUOTE_ALWAYS', 'false') == 'true'
    }
}

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

function getLinefeed(linefeed: string) : string {
    if (linefeed.toUpperCase() == 'CRLF' ) {
        return '\r\n';
    } else if (linefeed.toUpperCase() == 'LF') {
        return '\n';
    } else {
        throw new Error(`Invalid linefeed value: ${linefeed}`);
    }
}
