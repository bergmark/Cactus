module.exports = (function () {
  var Enumerable = CactusJuice.Data.Enumerable;
  var Collection = CactusJuice.Data.Collection;
  var CMath = CactusJuice.Addon.Math;

  Class("Coll", {
    does : Enumerable,
    has : {
      arr : null
    },
    methods : {
      size : function () {
        return this.arr.length;
      },
      get : function (i) {
        return this.arr[i];
      },
      toArray : function () {
        return this.arr;
      },
      fromArray : function (array) {
        return new Coll({
          arr : array
        });
      },
      map : function (f) {
        return this.fromArray(Collection.map(this.toArray(), f));
      },
      select : function (f) {
        return this.fromArray(Collection.select(this.toArray(), f));
      }
    }
  });

  return {
    map : function (f) {
      assert.strictEqual("2,3,4", new Coll({ arr : [1,2,3] }).map(function (v) { return v + 1; }).toArray().join(","));
    },
    select : function (f) {
      assert.strictEqual("1,3", new Coll({ arr : [1,2,3] }).select(CMath.odd.bind(CMath)).toArray().join(","));
    }
  };
})();