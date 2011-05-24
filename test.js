require("./Cactus");
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
