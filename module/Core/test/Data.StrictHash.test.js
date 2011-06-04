module.exports = (function () {
  var StrictHash = Cactus.Data.StrictHash;
  return {
    StrictHash : function () {
      var sh = new StrictHash(["x", "y"]);
      assert.ok(!("define" in sh));
      sh.set("x", 1);
      assert.eql(1, sh.get("x"));
      sh.set("y", 2);
      exception(/StrictHash:.+?undefined/i, sh.set.bind(sh, "z"));
    },
    map : function () {
      var sh = new StrictHash(["x", "y"]);
      sh.set("x", 1);
      sh.set("y", 2);
      sh = sh.map(function (v) {
        return v * 10;
      });
      assert.ok(sh instanceof StrictHash, "Did not get StrictHash instance.");
      assert.eql(10, sh.get("x"));
      assert.eql(20, sh.get("y"));
    }
  };
})();
