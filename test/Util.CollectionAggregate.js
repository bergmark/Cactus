require("../Cactus");
var assert = require("assert");
var CollectionAggregate = Cactus.Util.CollectionAggregate;
module.exports = {
  a : function () {
    Class("C2", {
    });
    CollectionAggregate.add(C2, "x");
    var c = new C2();
    assert.ok("addX" in c);
    assert.ok("removeX" in c);
    assert.ok("hasX" in c);
    assert.ok("xCount" in c);

    c.addX(1);
    assert.ok(c.hasX(1));
    assert.ok(!c.hasX(2));
    assert.strictEqual(1, c.xCount());
    c.removeX(1);
    assert.ok(!c.hasX(1));

    assert.ok("getX" in c);
    c.addX(1);
    c.addX(2);
    assert.ok(c.getX() instanceof Array);
    assert.ok(c.x !== c.getX());
  }
};
