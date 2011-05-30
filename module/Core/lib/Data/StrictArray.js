/**
 * @file
 * Array with same interface as other Data structures.
 * Throws error on bad indices.
 */
Module("Cactus.Data", function (m) {
  var A = Cactus.Addon.Array;
  var C = m.Collection;
  Class("StrictArray", {
    does : [m.Enumerable, m.Equality],
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

      // Enumerable.
      toArray : function () {
        return A.clone(this._array);
      },
      map : function (f) {
        return C.map(this._array, f);
      },
      select : function (f) {
        return C.select(this._array, f);
      },

      // Equality.
      /**
       * Checks identity of elements.
       */
      equals : function (sa) {
        if (this.size() !== sa.size()) {
          return false;
        }
        for (var i = 0, ii = this.size(); i < ii; i++) {
          if (this.get(i) !== sa.get(i)) {
            return false;
          }
        }
        return true;
      }
    }
  });
});
