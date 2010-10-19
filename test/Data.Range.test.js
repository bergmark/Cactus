var Joose = require('Joose');
require('../CactusJuice.js');

module.exports = (function () {
  var Range = CactusJuice.Data.Range;
  return {
    "main" : function (assert) {
      var start = 3;
      var end = 8;
      var r = new Range({
        start : 3,
        end : 8
      });

      assert.eql("3..8", r.toString());
      assert.eql(3, r.getStart());
      assert.eql(8, r.getEnd());

      assert.ok(r.includes(3));
      assert.ok(r.includes(8));
      assert.ok(r.includes(5));
      assert.ok(!r.includes(2));
      assert.ok(!r.includes(9));

      r = new Range ({
        start : -5,
        end : 3
      });
      assert.eql("-5..3", r.toString());
      assert.ok(r.includes(-5));
      assert.ok(r.includes(0));
      assert.ok(r.includes(3));
      assert.ok(!r.includes(5));
    }
  };
})();
