require('Joose');
/**
 * @file
 * A set is an unordered collection of unique elements. Duplicates are not
 * added. It can either compare objects by their identity or by doing a shallow
 * compare of their properties.
 *
 * A future update will provide a 3rd method of comparison, recursively
 * comparing properties of value objects.
 */
Joose.Module("CactusJuice.Data", function (m) {
  var Collection = CactusJuice.Data.Collection;
  var Array = CactusJuice.Addon.Array;
  Joose.Class("Set", {
    has : {
      elementType : {
        /**
         * @type string
         *   "identity" or "shallow"
         */
        init : "identity"
      },
      collection : {
        init : function () { return []; }
      }
    },
    methods : {
      /**
       * @param optional string elementType = "identity"
       *   "shallow" or "identity" depending on whether objects should be compared
       *   based on their values or their identities.
       */
      initialize : function (elementType) {
        // .
      },
      /**
       * Adds an element to the set, but only if it is not already in there.
       *
       * @param mixed element
       * @return boolean
       *   Whether the element was added. (It's not added if it was already
       *   in the set.)
       */
      add : function (element) {
        if (this.has(element)) {
          return false;
        }

        this.collection.push(element);
        return true;
      },
      /**
       * @return natural
       *   The number of elements in the set.
       */
      size : function () {
        return this.collection.length;
      },
      /**
       * Returns an element from the set given an index. Note that there is
       * no guarantee that an element will keep its index since the set is
       * unordered.
       *
       * @param natural index
       * @param mixed
       */
      get : function (index) {
        if (typeof index !== "number") {
          throw new Error("Set:get: Index is not a number.");
        }
        if (index >= this.size() || index < 0) {
          throw new Error("Set:get: Index out of bounds");
        }
        return this.collection[index];
      },
      /**
       * @param mixed element
       * @return boolean
       *   Whether the element is in the set.
       */
      has : function (element) {
        if (this.elementType === "identity") {
          return Collection.hasValue(this.collection, element);
        } else {
          for (var i = 0; i < this.size(); i++) {
            if (this._equal(element, this.collection[i])) {
              return true;
            }
          }
          return false;
        }
      },
      /**
       * Removes an element from the set.
       *
       * @param mixed element
       */
      remove : function (element) {
        Array.remove(this.collection, element);
      },
      /**
       * Does a shallow compare of two object's properties.
       *
       * @param mixed a
       * @param mixed b
       * @return boolean
       *   Whether the objects are considered equal.
       */
      _equal : function (a, b) {
        var properties = [];
        for (var p in a) {
          properties.push(p);
          if (!(p in b)) {
            return false;
          }
          if (a[p] !== b[p]) {
            return false;
          }
        }
        for (p in b) {
          if (!Collection.hasValue(properties, p)) {
            return false;
          }
        }
        return true;
      }
    }
  });
});
