var Joose = require('Joose');
require('Addon/Math');

module.exports = (function () {
  var math = new CactusJuice.Addon.Math({});
  return {
    "rand" : function (assert) {
      var a = [0, 0, 0, 0, 0];
      for (var i = 0; i < 5000; i++) {
        a[math.rand(0, 4)]++;
      }
      assert.ok(!("-1" in a), "lower boundary breached");
      assert.ok(!("5" in a), "upper boundary breached");
      for (i = 0; i < 5; i++) {
        assert.ok(a[i] > 900, i + " occured " + a[i] +" times");
      }
    },

    "middle" : function (assert) {
      var a = [1, 2, 3];
      var middle = math.middle.apply.bind(math.middle).bind(null, null);

      var eq = assert.eql.bind(assert);
      function eq2() {
        var m = middle(a);
        assert.eql(2, m, "middle(" + a.join(",") + ")=" + m);
      }

      eq2();
      a = [1, 3, 2];
      eq2();
      a = [2, 1, 3];
      eq2();
      a = [2, 3, 1];
      eq2();
      a = [3, 1, 2];
      eq2();
      a = [3, 2, 1];
      eq2();

      a = [1, 2, 2];
      eq2();
      a = [2, 1, 2];
      eq2();
      a = [2, 2, 1];
      eq2();
    }
  };
})();
