module.exports = (function () {
  var Coll = CactusJuice.Data.Collection;
  var Range = CactusJuice.Data.Range;
  var assertException = CactusJuice.Dev.Assertion.exception;
  return {
    toArray : function (assert) {
      var a = [1,2,3];
      var b = Coll.toArray(a);

      assert.ok(b instanceof Array);
      assert.eql("1,2,3", b.join(","));
    },

    "intersects" : function (assert) {
      var a = [1, 2, 3];
      var b = [3, 4, 5];
      var c = [6, 5, 4];

      var i = Coll.intersects.bind(Coll);

      assert.ok(i(a, b));
      assert.ok(!i(a, c));
      assert.ok(i(b, a));
      assert.ok(i(b, c));
      assert.ok(!i(c, a));
      assert.ok(i(c, b));
    },

    "hasValue" : function (assert) {
      var a = [1, 2, 3];

      var hv = Coll.hasValue;

      assert.ok(hv(a, 1));
      assert.ok(hv(a, 2));
      assert.ok(hv(a, 3));
      assert.ok(!hv(a, 0));
      assert.ok(!hv(a, 4));

      a.push([1]);
      // ID is compared, not value.
      assert.ok(!hv(a, [1]));
    },

    "intersection" : function (assert) {
      var a = [1, 2, 3];
      var b = [3, 4, 5];
      var c = [6, 5, 4];

      var i = Coll.intersection.bind(Coll);

      assert.eql("3", i(a, b).join(","));
      assert.eql("", i(a, c).join(","));
      assert.eql("3", i(b, a).join(","));
      assert.eql("4,5", i(b, c).sort().join(","));
      assert.eql("", i(c, a).join(","));
      assert.eql("4,5", i(c, b).sort().join(","));
    },

    "last" : function (assert) {
      assert.eql(3, Coll.last([1,2,3]));
      assert.eql(1, Coll.last([1]));
      assert.throws(function () { Coll.last([]); });
    },

    "isColl" : function (assert) {
      var glob = null;
      glob = typeof window !== "undefined" ? window : null;
      glob = typeof global !== "undefined" ? global : null;
      var ial = Coll.isCollection;
      assert.ok(ial([]));
      assert.ok(ial([1, 2, 3]));
      assert.ok(ial({ 0 : "a", length : 1 }));
      if (glob !== null) {
        assert.ok(!ial(glob));
      }
      assert.ok(!ial({}));
      assert.ok(!ial(0));
      assert.ok(!ial(null));
      assert.ok(!ial(undefined));
      if (typeof document !== "undefined") {
        assert.ok(!ial(document.createElement("select")),
                  "select should not be a collection");
        assert.ok(!ial(document.createElement("form")),
                  "form should not be a collection");
      }
    },

    "select" : function (assert) {
      var a = [1, 2, 3, 4, 5, 6];
      function isEven(n) {
        return !(n % 2);
      }
      var b = Coll.select(a, isEven);
      assert.eql(3, b.length);
      assert.eql(2, b[0]);
      assert.eql(4, b[1]);
      assert.eql(6, b[2]);

      // Select no elements.
      assert.eql(0, Coll.select(a, function () {
        return false;
      }).length);
      // Select all elements.
      assert.eql(6, Coll.select(a, function () {
        return true;
      }).length);
    },

    "select index argument" : function (assert) {
      var a = [1, 2, 3, 4, 5, 6];
      function isEven(_, n) {
        return !(n % 2);
      }
      // Select all elements with an even index.
      var b = Coll.select(a, isEven);
      assert.eql(3, b.length);
      assert.eql(1, b[0]);
      assert.eql(3, b[1]);
      assert.eql(5, b[2]);
    },

    "reject" : function (assert) {
      var a = [1, 2, 3, 4, 5, 6];
      function isEven(n) {
        return (n % 2) === 0;
      }
      var b = Coll.reject(a, isEven); // remove all even numbers
      assert.eql("1,3,5", b.join(","));

      // Remove all objects.
      assert.eql(0, Coll.reject(a, function () {
        return true;
      }).length);
      // Remove no objects.
      assert.eql(6, Coll.reject(a, function () {
        return false;
      }).length);
    },

    "reject index argument" : function (assert) {
      var a = [1, 2, 3, 4, 5, 6];
      function isEven(_, n) {
        return !(n % 2);
      }
      // reject all elements with an even index
      var b = Coll.reject(a, isEven);
      assert.eql(3, b.length);
      assert.eql(2, b[0]);
      assert.eql(4, b[1]);
      assert.eql(6, b[2]);
    },

    "each" : function (assert) {
      var a = [1, 2, 3];
      var b = [];

      Coll.each(a, function (v) {
        b.push(v);
      });

      assert.eql("123", b.join(""));
    },

    "slice" : function (assert) {
      var a = [0,1,2,3,4,5];
      assert.eql("0,1,2,3,4,5", Coll.slice(a, 0, 6).join(","));
      assert.eql("1,2,3,4", Coll.slice(a, 1, 5).join(","));
    },

    "sliceWithRange" : function (assert) {
      var a = [0,1,2,3,4,5];
      var r = new Range({
        start : 0,
        end : 5
      });
      assert.eql("0,1,2,3,4,5", Coll.sliceWithRange(a, r).join(","));
      r = new Range({
        start : 1,
        end : 4
      });
      assert.eql("1,2,3,4", Coll.sliceWithRange(a, r).join(","));
    },

    "some" : function (assert) {
      assert.ok(Coll.some([1, 5, 3, 6], function (el) {
        return el > 3;
      }));
      assert.ok(!Coll.some([1, 5, 3, 6], function (el) {
        return el > 13;
      }));
    },

    "every" : function (assert) {
      assert.ok(Coll.every([1, 5, 3, 6], function (el) {
        return el > 0;
      }));
      assert.ok(!Coll.every([1, 5, 3, 6], function (el) {
        return el < 6;
      }));
    },

    "notAny" : function (assert) {
      assert.ok(Coll.notAny([1, 2, 3, 0], function (el) {
        return el > 3;
      }));
      assert.ok(!Coll.notAny([1, 2, 3, 0], function (el) {
        return el >= 3;
      }));
    },

    "notEvery" : function (assert) {
      assert.ok(Coll.notEvery([1, 5, 3, 6], function (el) {
        return el < 6;
      }));
      assert.ok(!Coll.notEvery([1, 5, 3, 6], function (el) {
        return el <= 6;
      }));
    },

    "findFirst" : function (assert) {
      assert.eql(1, Coll.findFirst([1, 2, 3], function (v) {
        return v === 1;
      }));
      assert.eql(3, Coll.findFirst([1, 2, 3], function (v) {
        return v === 3;
      }));
      assert.eql(null, Coll.findFirst([1, 2, 3], function (v) {
        return v === 4;
      }));
    },

    // Two collections are equal if their contents are identical.
    "equal" : function (assert) {
      assert.ok(Coll.equal([1, 2], [1, 2]));
      assert.ok(!Coll.equal([1, 2], [1, 2, 3]));
      assert.ok(!Coll.equal([1, 2, 3], [1, 2]));
      assert.ok(Coll.equal([1, 2], { 0 : 1, 1 : 2, length : 2 }));
    },

    randElement : function (assert) {
      assertException(assert, /:randElement:.+empty collection/i, Coll.randElement.bind(Coll, []));
      var a = [0,1,2];
      var count = [0,0,0];
      var v;
      // Should improbable that one element gets picked less than 900 times.
      for (var i = 0; i < 3000; i++) {
        count[Coll.randElement(a)]++;
      }
      assert.ok(count[0] > 900, count[0]);
      assert.ok(count[1] > 900, count[1]);
      assert.ok(count[2] > 900, count[2]);
    }
  };
})();
