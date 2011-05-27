require("./CactusNode");
Joose.C.debug = true;
global.assert = require("assert");
global.should = require("should");
global.log = console.log.bind(console);
global.contEx = function (cont, reg) {
  var e;
  return cont.except(function (_e) {
    e = _e;
    this.CONTINUE();
  }).ensure(function () {
    if (!e) {
      throw new Error("assertContEx: No error was thrown.");
    }
    console.log(e);
    assert.ok(reg.test(e.message), "assertContEx: Caught unexpected: " + e.message);
    this.CONTINUE();
  });
};
global.ok = function (v, msg) { assert.ok(v, msg); };
global.not = function (v, msg) { assert.ok(v === false, msg); };
global.equal = function (a, b, msg) { assert.strictEqual(a, b, msg); };
global.notequal = function (a, b, msg) { assert.notStrictEqual(a, b, msg); };
global.eql = function (a, b, msg) { assert.eql(a, b, msg); };
var Assertion = Cactus.Dev.Assertion;
global.exception = Assertion.exception.bind(Assertion, assert);
global.instance = function (a, b, msg) { a.should.instanceof(b, msg); };

// Short hands for imports.
global.C = Cactus.Data.Collection;
