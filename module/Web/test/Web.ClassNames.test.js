module.exports = (function () {
  var CN = Cactus.Web.ClassNames;

  return {
    initial : function () {
      var o = {};
      assert.ok(!CN.has(o, "foo"));
      CN.remove(o, "foo");
    },
    b : function () {
      // First CN.
      var o = {};
      CN.add(o, "foo");
      assert.eql("foo", o.className);
      assert.ok(CN.has(o, "foo"), "o doesn't have .foo");
      assert.ok(!CN.has(o, "bar"));

      // Add a second and third CN.
      CN.add(o, "bar");
      assert.ok(CN.has(o, "foo"), 1);
      assert.ok(CN.has(o, "bar"), 2);
      assert.ok(!CN.has(o, "baz"));

      CN.add(o, "baz");
      assert.ok(CN.has(o, "foo"), 3);
      assert.ok(CN.has(o, "bar"), 4);
      assert.ok(CN.has(o, "baz"), 5);

    },
    "remove" : function () {
      var o = {};
      CN.add(o, "foo");
      CN.add(o, "bar");
      CN.add(o, "baz");
      CN.add(o, "bax");

      // Remove middle CN.
      CN.remove(o, "baz");
      assert.ok(CN.has(o, "foo"), 6);
      assert.ok(CN.has(o, "bar"), 7);
      assert.ok(!CN.has(o, "baz"), 8);
      assert.ok(CN.has(o, "bax"), 9);

      // Remove first CN.
      CN.remove(o, "foo");
      assert.ok(!CN.has(o, "foo"), 10);
      assert.ok(CN.has(o, "bar"), 11);
      assert.ok(CN.has(o, "bax"), 12);

      // Remove last CN.
      CN.remove(o, "bax");
      assert.ok(CN.has(o, "bar"));
      assert.ok(!CN.has(o, "bax"));
    },
    "unusual chars" : function () {
      var o = {};
      CN.add(o, "a-b");
      CN.add(o, "c");

      assert.ok(CN.has(o, "a-b"));
      assert.ok(CN.has(o, "c"));
      assert.ok(!CN.has(o, "a"));
      assert.ok(!CN.has(o, "b"));

      CN.remove(o, "a");
      assert.ok(CN.has(o, "a-b"));
      assert.ok(CN.has(o, "c"));
      assert.ok(!CN.has(o, "a"));
      assert.ok(!CN.has(o, "b"));
      assert.ok(!CN.has(o, "-b"));

    },
    get : function () {
      var o = { className : "a b c" };
      var p = { className : "" };
      var q = { className : "a" };

      assert.eql("a,b,c", CN.get(o).join(","));
      assert.eql("", CN.get(p).join(","));
      assert.eql("a", CN.get(q).join(","));
    },
    toggle : function () {
      var o = { className : "a b c" };
      CN.toggle(o, "b");
      eql(["a", "c"], CN.get(o));
      CN.toggle(o, "d");
      eql(["a", "c", "d"], CN.get(o));
    },
    toggleCond : function () {
      var o = { className : "a b c" };
      CN.toggleCond(o, "b", false);
      not(CN.has(o, "b"));
      CN.toggleCond(o, "b", true);
      ok(CN.has(o, "b"));
    }
  };
})();
