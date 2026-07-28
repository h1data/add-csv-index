import CIAdapter from "./CIAdapter"

const self : CIAdapter = {
    getInput: function (key, defaultValue:string|undefined=undefined): string {
        const envKey = 'INPUT_' + key
        const value = process.env[envKey];
        if (defaultValue == undefined && value === undefined) {
            throw new Error(`environment ${envKey} is not defined!`);
        }
        return value ?? defaultValue as string;
    },
    info: console.log,
    warn: console.warn,
    error: console.error

};

export default self;