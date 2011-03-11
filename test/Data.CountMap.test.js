module.exports = (function () {
  var CountMap = CactusJuice.Data.CountMap;
  var object = CactusJuice.Addon.Object;
  var Assertion = CactusJuice.Dev.Assertion;
  return {
    CountMap : function (assert) {
      var cm = new CountMap();

      assert.eql(0, cm.get("undefined key"));

      cm.inc("key1");
      assert.eql(1, cm.get("key1"));
      cm.inc("key2");
      cm.inc("key2");
      assert.eql(1, cm.get("key1"));
      assert.eql(2, cm.get("key2"));

      // Check which keys are set.
      assert.ok(cm.has("key1"));
      assert.ok(!cm.has("undefined key"));

      cm.dec("key1");
      assert.eql(0, cm.get("key1"));

      // Cannot dec if value is 0.
      Assertion.exception(assert, /:dec:.+value is 0/i, object.bound(cm, "dec", "key1"));

      // Cannot dec if key is undefined.
      Assertion.exception(assert, /:dec:.+undefined key/i, object.bound(cm, "dec", "undefined key"));
    },
    toHash : function (assert) {
      var cm = new CountMap();
      cm.inc("a");
      cm.inc("b");
      cm.inc("b");
      var h = cm.toHash();
      assert.eql(h.a, 1);
      assert.eql(h.b, 2);
    }
  };
})();
