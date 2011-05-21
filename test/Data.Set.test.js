module.exports = (function () {
  var Set = Cactus.Data.Set;
  var CMath = Cactus.Addon.Math;
  return {
    "add/remove" : function () {
      var set = new Set();
      assert.ok(set instanceof Set);

      set.add("a");
      assert.eql(1, set.size());

      set.add("b");
      assert.eql(2, set.size());

      // Add an element already in the set, the length should not change.
      assert.throws(set.add.bind(set, "b"), /element already in set/i);
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

    isEmpty : function () {
      var s = new Set();
      assert.ok(s.isEmpty());
      s.add(1);
      assert.ok(!s.isEmpty());
      s.remove(1);
      assert.ok(s.isEmpty());
    },

    "add values on init" : function () {
      var s = new Set([1,2,3]);
      assert.ok(s.has(1));
      assert.ok(s.has(3));
      s = new Set([]);
      assert.ok(s.isEmpty());
    },

    customEquality : function () {
      var s1 = new Set([], Function.empty.returning(true));
      var s2 = new Set([], Function.empty.returning(false));

      s1.add(1);
      assert.throws(s1.add.bind(s1, 2), /element already in set/i);

      s2.add(1);
      s2.add(1);
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
    },

    arrayConversion : function () {
      var s = Set.fromArray([1, 2, 3]);
      assert.strictEqual("1,2,3", s.toArray().sort().join(","));
    },

    select : function () {
      var s = Set.fromArray([1, 2, 3]);
      assert.strictEqual("1,3", Set.fromArray([1,2,3]).select(CMath.odd.bind(CMath)).toArray().sort().join(","));
    }
  };
})();
