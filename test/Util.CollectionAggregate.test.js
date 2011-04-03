require("../Cactus");
var assert = require("assert");
var CollectionAggregate = Cactus.Util.CollectionAggregate;
var Set = Cactus.Data.Set;
module.exports = {
  array : function () {
    Class("C2", {});
    CollectionAggregate.array(C2, "x");
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
  },
  set : function () {
    Class("C3", {});
    CollectionAggregate.set(C3, "y");
    var c = new C3();
    assert.ok("addY" in c);
    assert.ok("removeY" in c);
    assert.ok("hasY" in c);
    assert.ok("yCount" in c);

    c.addY(1);
    assert.ok(c.hasY(1));
    assert.ok(!c.hasY(2));
    assert.strictEqual(1, c.yCount());
    c.removeY(1);
    assert.ok(!c.hasY(1));

    assert.ok("getY" in c);
    c.addY(1);
    c.addY(2);
    assert.ok(c.getY() instanceof Set);
    assert.ok(c.y !== c.getY());
  }
};
