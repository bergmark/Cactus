var Joose = require('Joose');
require('../CactusJuice.js');

module.exports = (function () {
  var ObjectMap = CactusJuice.Data.ObjectMap;
  var Assertion = CactusJuice.Dev.Assertion;
  return {
    "test" : function (assert) {
      var assertException = Assertion.exception.bind(Assertion, assert);

      var om = new ObjectMap();

      var o = {};
      var p = {};
      assert.ok(!om.has(o));
      assert.ok(!om.has(p));
      om.set(o, 1);
      om.set(p, 2);
      assert.eql(1, om.get(o));
      assert.eql(2, om.get(p));

      om.set(o, 3);
      assert.eql(3, om.get(o));
      assert.eql(2, om.get(p));

      om.remove(o);
      assert.ok(!om.has(o));

      // Errors.
      assertException(/ObjectMap:get:.+undefined key/i, om.get.bind(om, o));
      assertException(/ObjectMap:remove:.+undefined key/i, om.remove.bind(om, o));
    },
    map : function (assert) {
      var om = new ObjectMap();
      om.set(1, 10);
      om.set(2, 20);
      var om2 = om.map(function (v) {
        return v * 10;
      });
      assert.ok(om !== om2);
      assert.eql(100, om2.get(1));
      assert.eql(200, om2.get(2));
    },
    toJson : function (assert) {
      var om = new ObjectMap();
      om.set("a", 1);
      om.set("b", 2);
      var h = om.toHash();
      var aIndex = h[0][0] === "a" ? 0 : 1;
      var bIndex = aIndex === 0 ? 1 : 0;
      assert.eql("a", h[aIndex][0]);
      assert.eql(1, h[aIndex][1]);
      assert.eql("b", h[bIndex][0]);
      assert.eql(2, h[bIndex][1]);
    }
  };
})();
