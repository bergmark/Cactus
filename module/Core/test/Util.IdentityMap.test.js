module.exports = (function () {
  var IdentityMap = Cactus.Util.IdentityMap;
  var assertException = Cactus.Dev.Assertion.exception;

  return {
    "core" : function () {
      var map = new IdentityMap();

      // Add.
      map.add(1, "a");
      assert.strictEqual("a", map.get(1));
      assertException(assert, /another object/i, map.add.bind(map, 1, "c"));
      assertException(assert, /is already stored/i, map.add.bind(map, 1, "a"));

      assertException(assert, /non-existant ID/i, map.get.bind(map, 2));

      // Has.
      assert.ok(map.has(1));
      assert.ok(!map.has(2));

      // Remove.
      map.remove("a");
      assertException(assert, /non-existant ID/i, map.get.bind(map, "a"));
      assertException(assert, /not in map/i, map.remove.bind(map, "a"));
    },

    // OnAdd when an abject is added to the ID map.
    "OnAdd" : function () {

      var triggered = false;
      var map = new IdentityMap();
      map.add(1, "a");
      map.subscribe("Added", function (_map, key, object) {
        assert.strictEqual("2", key);
        assert.strictEqual("b", map.get(key));
        assert.strictEqual("b", object);
        triggered = true;
      });

      map.add(2, "b");
      assert.ok(triggered, "onAdded did not trigger.");
    },

    // OnRemove when an object is removed from the ID map.
    "OnRemove" : function () {

      var triggered = false;
      var map = new IdentityMap();
      map.add(1, "a");
      map.subscribe("Removed", function (_map, key, object) {
        assert.strictEqual("1", key);
        assert.strictEqual("a", object);
        triggered = true;
      });
      map.remove("a");
      assert.ok(triggered, "onRemoved did not trigger.");
    },

    // Should be able to fetch all objects.
    "fetch" : function () {
      var map = new IdentityMap();
      map.add(1, "a");
      map.add(2, "b");
      var objects = map.getAll();
      assert.ok(objects instanceof Array);
      assert.ok(objects[0] === "a" || objects[1] === "a");
      assert.ok(objects[0] === "b" || objects[1] === "b");
    }
  };
})();
