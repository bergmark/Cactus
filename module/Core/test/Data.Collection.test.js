module.exports = (function () {
  var Coll = Cactus.Data.Collection;
  var Range = Cactus.Data.Range;
  var math = Cactus.Addon.Math;
  return {
    toArray : function () {
      var a = [1,2,3];
      var b = Coll.toArray(a);

      assert.ok(b instanceof Array);
      assert.eql("1,2,3", b.join(","));

      assert.throws(Coll.toArray.bind(Coll, null),
                   /toArray:.+must be a collection./);
    },

    "intersects" : function () {
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

    "hasValue" : function () {
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

    "intersection" : function () {
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

    "last" : function () {
      assert.eql(3, Coll.last([1,2,3]));
      assert.eql(1, Coll.last([1]));
      assert.throws(function () { Coll.last([]); });
    },

    nthLast : function () {
      var a = ["a", "b", "c"];
      equal("c", Coll.nthLast(a, 0));
      equal("a", Coll.nthLast(a, 2));
      exception(/Offset out of bounds: -1/, Coll.nthLast.bind(Coll, a, -1));
      exception(/Offset out of bounds: 3/, Coll.nthLast.bind(Coll, a, 3));
      exception(/Offset out of bounds: 0/, Coll.nthLast.bind(Coll, [], 0));
    },

    "isCollection" : function () {
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

    "select" : function () {
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

    "select index argument" : function () {
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

    "reject" : function () {
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

    "reject index argument" : function () {
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

    "each" : function () {
      var a = [1, 2, 3];
      var b = [];

      Coll.each(a, function (v) {
        b.push(v);
      });

      assert.eql("123", b.join(""));
    },

    "slice" : function () {
      var a = [0,1,2,3,4,5];
      assert.eql("0,1,2,3,4,5", Coll.slice(a, 0, 6).join(","));
      assert.eql("1,2,3,4", Coll.slice(a, 1, 5).join(","));
    },

    "sliceWithRange" : function () {
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

    "any" : function () {
      assert.ok(Coll.any([1, 5, 3, 6], function (el) {
        return el > 3;
      }));
      assert.ok(!Coll.any([1, 5, 3, 6], function (el) {
        return el > 13;
      }));
    },

    "all" : function () {
      assert.ok(Coll.all([1, 5, 3, 6], function (el) {
        return el > 0;
      }));
      assert.ok(!Coll.all([1, 5, 3, 6], function (el) {
        return el < 6;
      }));
    },

    "none" : function () {
      assert.ok(Coll.none([1, 2, 3, 0], function (el) {
        return el > 3;
      }));
      assert.ok(!Coll.none([1, 2, 3, 0], function (el) {
        return el >= 3;
      }));
    },

    "notAll" : function () {
      assert.ok(Coll.notAll([1, 5, 3, 6], function (el) {
        return el < 6;
      }));
      assert.ok(!Coll.notAll([1, 5, 3, 6], function (el) {
        return el <= 6;
      }));
    },

    "findFirst" : function () {
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
    "equal" : function () {
      assert.ok(Coll.equal([1, 2], [1, 2]));
      assert.ok(!Coll.equal([1, 2], [1, 2, 3]));
      assert.ok(!Coll.equal([1, 2, 3], [1, 2]));
      assert.ok(Coll.equal([1, 2], { 0 : 1, 1 : 2, length : 2 }));
    },

    randElement : function () {
      exception(/:randElement:.+empty collection/i, Coll.randElement.bind(Coll, []));
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
    },

    difference : function () {
      var a = [1, 2, 3];
      var b = [1, 3];
      assert.eql([], Coll.difference([], [1]));
      assert.eql([2], Coll.difference([1, 2, 3], [1, 3]));
    },

    concatMap : function () {
      assert.eql([1,2,2,3,3,4], Coll.concatMap([1,2,3], function (v) {
        return [v, v+1];
      }));
    },

    partition : function () {
      var p = Coll.partition(new Range(0, 9).toArray(), math.even);
      assert.eql([0,2,4,6,8], p.getFirst());
      assert.eql([1,3,5,7,9], p.getSecond());
    },

    flatten : function () {
      assert.eql([1,2], Coll.flatten([[1],[2]]));
      assert.eql([1,2,3,4], Coll.flatten([[1,2],[3,4]]));
      assert.eql([1,2,3], Coll.flatten([[1],[2],[3]]));
      assert.eql([[1], [2]], Coll.flatten([[[1],[2]]]));
    },

    // Methods shall not have to be bound by client.
    bound : function () {
      var odd = math.odd;
      var toArray = Coll.toArray;
      assert.ok(toArray([]) instanceof Array);
    },

    isEmpty : function () {
      assert.ok(Coll.isEmpty([]));
      assert.ok(!Coll.isEmpty([1]));
    },

    grep : function () {
      assert.eql(["a","d"], Coll.grep(["a","b","c","d"], /[ad]/));
      assert.eql(["b","c"], Coll.grep(["a","b","c","d"], /[bc]/));
      assert.eql([], Coll.grep([], /nomatch/));
      assert.eql([], Coll.grep(["a","b","c"], /nomatch/));
    },

    replicate : function () {
      assert.eql([], Coll.replicate(0, 1));
      assert.eql([1], Coll.replicate(1, 1));
      assert.eql([1,1], Coll.replicate(2, 1));
    },

    zip : function () {
      eql([[1,"a"],[2,"b"]], Coll.zip([1,2],["a","b"]));
      eql([], Coll.zip([1], []));
      eql([], Coll.zip([], [1]));
      eql([[1,"a"]], Coll.zip([1,2],["a"]));
      eql([[1,"a"]], Coll.zip([1],["a","b"]));
    }
  };
})();
