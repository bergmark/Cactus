var Enumerable = Cactus.Data.Enumerable;
var C = Cactus.Data.Collection;
var A = Cactus.Addon.Array;
/**
 * @file
 * Array with same interface as other Data structures.
 * Throws error on bad indices.
 */
Module("Cactus.Data", function (m) {
  Class("StrictArray", {
    does : Enumerable,
    has : {
      _array : null
    },
    methods : {
      BUILD : function (array) {
        return {
          _array : array ? A.clone(array) : []
        };
      },
      size : function () {
        return this._array.length;
      },
      isEmpty : function () {
        return this.size() === 0;
      },
      add : function (val) {
        this._array.push(val);
      },
      get : function (i) {
        if (typeof i !== "number" || i < 0 || i >= this.size()) {
          throw new Error("StrictArray:get: Bad index: " + i + ", length is: " + this.size());
        }
        return this._array[i];
      },
      toArray : function () {
        return A.clone(this._array);
      },
      map : function (f) {
        return C.map(this._array, f);
      },
      select : function (f) {
        return C.select(this._array, f);
      }
    }
  });
});
