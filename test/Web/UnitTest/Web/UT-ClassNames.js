Cactus.UnitTest.Web.ClassNames = function () {
  var UT = Cactus.Dev.UnitTest;
  var Test = UT.Test;
  var CN = Cactus.Web.ClassNames;
  var log = Cactus.Dev.log;

  var tc = new UT.TestCase("Web.ClassNames");
  // Initial.
  tc.add(function () {
    var o = {};
    this.assertFalse(CN.has(o, "foo"));
    CN.del(o, "foo");
  });
  tc.add(function () {
    // First CN.
    var o = {};
    CN.add(o, "foo");
    this.assertEqual("foo", o.className);
    this.assert(CN.has(o, "foo"), "o doesn't have .foo");
    this.assertFalse(CN.has(o, "bar"));

    // Add a second and third CN.
    CN.add(o, "bar");
    this.assert(CN.has(o, "foo"), 1);
    this.assert(CN.has(o, "bar"), 2);
    this.assertFalse(CN.has(o, "baz"));

    CN.add(o, "baz");
    this.assert(CN.has(o, "foo"), 3);
    this.assert(CN.has(o, "bar"), 4);
    this.assert(CN.has(o, "baz"), 5);

  });
  // Test remove.
  tc.add(function () {
    var o = {};
    CN.add(o, "foo");
    CN.add(o, "bar");
    CN.add(o, "baz");
    CN.add(o, "bax");

    // Remove middle CN.
    CN.del(o, "baz");
    this.assert(CN.has(o, "foo"), 6);
    this.assert(CN.has(o, "bar"), 7);
    this.assertFalse(CN.has(o, "baz"), 8);
    this.assert(CN.has(o, "bax"), 9);

    // Remove first CN.
    CN.del(o, "foo");
    this.assertFalse(CN.has(o, "foo"), 10);
    this.assert(CN.has(o, "bar"), 11);
    this.assert(CN.has(o, "bax"), 12);

    // Remove last CN.
    CN.del(o, "bax");
    this.assert(CN.has(o, "bar"));
    this.assertFalse(CN.has(o, "bax"));
  });
  // Test unusual characters.
  tc.add(function () {
    var o = {};
    CN.add(o, "a-b");
    CN.add(o, "c");

    this.assert(CN.has(o, "a-b"));
    this.assert(CN.has(o, "c"));
    this.assertFalse(CN.has(o, "a"));
    this.assertFalse(CN.has(o, "b"));

    CN.del(o, "a");
    this.assert(CN.has(o, "a-b"));
    this.assert(CN.has(o, "c"));
    this.assertFalse(CN.has(o, "a"));
    this.assertFalse(CN.has(o, "b"));
    this.assertFalse(CN.has(o, "-b"));

  });
  // Test get.
  tc.add(function () {
    var o = { className : "a b c" };
    var p = { className : "" };
    var q = { className : "a" };

    this.assertEqual("a,b,c", CN.get(o).join(","));
    this.assertEqual("", CN.get(p).join(","));
    this.assertEqual("a", CN.get(q).join(","));
  });
  return tc;
};
