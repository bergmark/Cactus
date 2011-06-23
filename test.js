require('./Cactus');
global.assert = require('assert');
global.ok = assert.ok.bind(assert);
global.equal = assert.strictEqual.bind(assert);
global.notequal = assert.notStrictEqual.bind(assert);
