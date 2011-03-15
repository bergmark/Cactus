module.exports = (function () {
  var Set = CactusJuice.Data.Set;
  return {
    "add/remove" : function () {
      var set = new Set();
      assert.ok(set instanceof Set);

      set.add("a");
      assert.eql(1, set.size());

      set.add("b");
      assert.eql(2, set.size());

      // Add an element already in the set, the length should not change.
      set.add("b");
      assert.eql(2, set.size());

      assert.eql("a", set.get(0));
      assert.eql("b", set.get(1));

      assert.ok(set.has("a"));
      assert.ok(set.has("b"));
      assert.ok(!set.has("c"));

      set.remove("a");
      assert.eql(1, set.size());
      assert.eql("b", set.get(0));
    },

    // Pass the "shallow" argument to compare all objects by value instead of
    // identity.
    "shallow" : function () {
      var set = new Set({
        elementType : "shallow"
      });
      set.add({ a : 1 });
      set.add({ a : 2 });
      assert.eql(2, set.size());
      set.add({ a : 1 });
      assert.eql(2, set.size());
    },

    // Getting an element by a non existant index should throw an error.
    "bad index" : function () {
      var set = new Set();

      assert.throws(function () {
        set.get("foo");
      });

      assert.throws(function () {
        set.get(0);
      });

      set.add("a");

      assert.throws(function () {
        set.get(2);
      });
    },

    map : function () {
      var s = new Set();
      s.add(1);
      s.add(3);
      s.add(5);
      var s2 = s.map(function (v) {
        return v + 1;
      });
      assert.strictEqual("2,4,6", s2.collection.sort().join(","));
    }
  };
})();
