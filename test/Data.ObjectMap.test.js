var Joose = require('Joose');
require('Data/ObjectMap');
var Assertion = require('Dev/Assertion');

module.exports = (function () {
  var ObjectMap = CactusJuice.Data.ObjectMap;
  return {
    "test" : function (assert) {
      var assertException = Assertion.assertException.bind(Assertion, assert);

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
    }
  };
})();
