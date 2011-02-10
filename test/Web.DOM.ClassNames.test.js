var Joose = require('Joose');
require('../CactusJuice.js');
require('../CactusJuiceWebTestable.js');

module.exports = (function () {
  var CN = CactusJuice.Web.DOM.ClassNames;

  return {
    initial : function (assert) {
      var o = {};
      assert.ok(!CN.has(o, "foo"));
      CN.del(o, "foo");
    },
    b : function (assert) {
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
    "remove" : function (assert) {
      var o = {};
      CN.add(o, "foo");
      CN.add(o, "bar");
      CN.add(o, "baz");
      CN.add(o, "bax");

      // Remove middle CN.
      CN.del(o, "baz");
      assert.ok(CN.has(o, "foo"), 6);
      assert.ok(CN.has(o, "bar"), 7);
      assert.ok(!CN.has(o, "baz"), 8);
      assert.ok(CN.has(o, "bax"), 9);

      // Remove first CN.
      CN.del(o, "foo");
      assert.ok(!CN.has(o, "foo"), 10);
      assert.ok(CN.has(o, "bar"), 11);
      assert.ok(CN.has(o, "bax"), 12);

      // Remove last CN.
      CN.del(o, "bax");
      assert.ok(CN.has(o, "bar"));
      assert.ok(!CN.has(o, "bax"));
    },
    "unusual chars" : function (assert) {
      var o = {};
      CN.add(o, "a-b");
      CN.add(o, "c");

      assert.ok(CN.has(o, "a-b"));
      assert.ok(CN.has(o, "c"));
      assert.ok(!CN.has(o, "a"));
      assert.ok(!CN.has(o, "b"));

      CN.del(o, "a");
      assert.ok(CN.has(o, "a-b"));
      assert.ok(CN.has(o, "c"));
      assert.ok(!CN.has(o, "a"));
      assert.ok(!CN.has(o, "b"));
      assert.ok(!CN.has(o, "-b"));

    },
    "get" : function (assert) {
      var o = { className : "a b c" };
      var p = { className : "" };
      var q = { className : "a" };

      assert.eql("a,b,c", CN.get(o).join(","));
      assert.eql("", CN.get(p).join(","));
      assert.eql("a", CN.get(q).join(","));
    }
  };
})();
