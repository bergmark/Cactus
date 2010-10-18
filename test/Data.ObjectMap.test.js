var Joose = require('Joose');
require('Data/ObjectMap');
var assertException = require('Dev/Assertion').assertException;

module.exports = (function () {
  var ObjectMap = CactusJuice.Data.ObjectMap;
  return {
    "test" : function (assert) {
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
    }
  };
})();
