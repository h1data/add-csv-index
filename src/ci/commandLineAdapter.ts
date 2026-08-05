import CIAdapter from './CIAdapter';
import commandLineArgs from 'command-line-args';
import { optionDefinitions } from '../option';

const options = commandLineArgs(Object.values(optionDefinitions));

const self : CIAdapter = {
    getInput: function (key, defaultValue:string|undefined=undefined): string {
        const option = optionDefinitions[key];
        let value : any = undefined;
        if (option.type == Boolean) {
            if (option.inverse) {
                value = options[option.name] ? 'false' : 'true';
            } else {
                value = options[option.name] ? 'true' : 'false';
            }
            console.log(option.name, options[option.name], option.defaultValue, value);
        } else {
            value = options[option.name];
        }
        if (defaultValue == undefined && value === undefined) {
            console.error(`option ${option.name} is not specified!`);
            process.exit(1);
        }
        return (value ?? defaultValue) as string;
    },
    info: (message) => { console.log(message); },
    warn: (message) => { console.warn(message); },
    error: (message) => { console.error(message); }
};

export default self;
