module.exports = (function () {
  var CountMap = Cactus.Data.CountMap;
  var object = Cactus.Addon.Object;
  var Assertion = Cactus.Dev.Assertion;
  return {
    CountMap : function () {
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
    serialize : function () {
      var cm = new CountMap();
      cm.inc("a");
      cm.inc("b");
      cm.inc("b");
      var h = cm.serialize();
      assert.eql(h.a, 1);
      assert.eql(h.b, 2);
    },
    incDecBy : function () {
      var cm = new CountMap();
      Assertion.exception(assert, /:decBy:.+undefined key/i, object.bound(cm, "decBy", "a", 10));
      cm.incBy("a", 10);
      assert.strictEqual(10, cm.get("a"));
      cm.decBy("a", 10);
      assert.strictEqual(0, cm.get("a"));
      Assertion.exception(assert, /:decBy:.+can not decBy to below 0/i, object.bound(cm, "decBy", "a", 1));
      cm.incBy("a", 3);
      Assertion.exception(assert, /:decBy:.+can not decBy to below 0/i, object.bound(cm, "decBy", "a", 4));
      Assertion.exception(assert, /:decBy:.+can not decBy to below 0/i, object.bound(cm, "decBy", "a", 5));
    }
  };
})();
