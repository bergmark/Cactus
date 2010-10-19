require('../CactusJuice.js');

module.exports = (function () {
  var StrictHash = CactusJuice.Data.StrictHash;
  var assertException = CactusJuice.Dev.Assertion.exception;
  return {
    StrictHash : function (assert) {
      var sh = new StrictHash({ keys : ["x", "y"] });
      assert.ok(!("define" in sh));
      sh.set("x", 1);
      assert.eql(1, sh.get("x"));
      sh.set("y", 2);
      assertException(assert, /StrictHash:.+?undefined/i, sh.set.bind(sh, "z"));
    }
  };
})();
