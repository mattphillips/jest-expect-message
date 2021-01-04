const { jsWithBabel: tsjPreset } = require('ts-jest/presets');
/**
 * @typedef {import("ts-jest/dist/index")}
 * @type {import("@jest/types").Config}
 */
module.exports = {
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: 'jest-extended',
  transform: {
    ...tsjPreset.transform
  }
};
