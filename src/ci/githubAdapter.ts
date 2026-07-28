import core from '@actions/core';
import CIAdapter from './CIAdapter';

const self : CIAdapter = {
    getInput: (key, defaultValue) => { return core.getInput(key) ?? defaultValue; },
    info: core.info,
    warn: core.warning,
    error: core.setFailed,
    setOutput: core.setOutput,
};

export default self;