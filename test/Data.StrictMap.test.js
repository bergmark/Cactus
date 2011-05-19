var regs = {
  getX : /get.+undefined key x/i,
  getY : /get.+undefined key y/i,
  setX : /set.+undefined key x/i,
  setY : /set.+undefined key y/i,
  define : /define.+x is already defined/i,
  badMap : /expected map argument/i
};


module.exports = (function () {
  var StrictMap = Cactus.Data.StrictMap;
  var assertException = Cactus.Dev.Assertion.exception;
  return {
    StrictMap : function () {
      var sh = new StrictMap();

      assertException(assert, regs.getX, sh.get.bind(sh, "x"));
      assertException(assert, regs.setX, sh.set.bind(sh, "x", 1));
      sh.define("x", 2);
      assertException(assert, regs.define, sh.define.bind(sh, "x", 3));
      assert.eql(2, sh.get("x"));
      sh.set("x", 4);
      assert.eql(4, sh.get("x"));

      assertException(assert, regs.badMap, function () { new StrictMap(null); });
      assertException(assert, regs.badMap, function () { new StrictMap(1); });
    },
    map : function () {
      var sm = new StrictMap();
      sm.define("x", 1);
      sm.define("y", 2);
      var sm2 = sm.map(function (v) {
        return v * 10;
      });
      assert.ok(sm !== sm2);
      assert.eql(10, sm2.get("x"));
      assert.eql(20, sm2.get("y"));
    },
    defineSeveral : function () {
      var sh = new StrictMap({ x : 1 });
      assertException(assert, regs.getY, sh.get.bind(sh, "y"));
      assertException(assert, regs.setY, sh.set.bind(sh, "y", 2));
      assertException(assert, regs.define, sh.define.bind(sh, "x", 2));
      assert.eql(1, sh.get("x"));
      sh.set("x", 2);
      sh.define("y",3);
      assert.eql(2, sh.get("x"));
      assert.eql(3, sh.get("y"));

      sh = new StrictMap({ x : 1 });
      sh.defineSeveral({
        y : 2,
        z : 3
      });
      sh.get("x");
      sh.get("y");
      sh.get("z");
    }
  };
})();
