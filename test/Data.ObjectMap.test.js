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
    }
  };
})();
