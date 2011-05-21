/**
 * @file
 * A set is an unordered collection of unique elements.
 *
 * Default equality check is ===, the client can specify its own by passing it
 * to the constructor.
 */
Module("Cactus.Data", function (m) {
  var Collection = Cactus.Data.Collection;
  var Enumerable = Cactus.Data.Enumerable;
  var Array = Cactus.Addon.Array;

  function defaultEquality(a, b) {
    return a === b;
  }

  var Set = Class("Set", {
    does : Enumerable,
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
      },
      _equality : null
    },
    methods : {
      /**
       * @param optional Array elements = []
       *   Initial elements in the Set.
       * @param optional Function equality
       *   Function to use to decide equality of objects.
       *   Defaults to identity checks (===).
       */
      BUILD : function (elements, equality) {
        return {
          elements : elements || [],
          _equality : equality || defaultEquality
        };
      },
      initialize : function (args) {
        for (var i = 0; i < args.elements.length; i++) {
          this.add(args.elements[i]);
        }
      },
      /**
       * Adds an element to the set, but only if it is not already in there.
       *
       * @param mixed element
       * @return boolean
       *   Whether element was added.
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
       * @return natural
       */
      isEmpty : function () {
        return this.size() === 0;
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
        for (var i = 0; i < this.size(); i++) {
          if (this._equality(element, this.collection[i])) {
            return true;
          }
        }
        return false;
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
       * @return Array
       */
      toArray : function () {
        var a = [];
        for (var i = 0; i < this.size(); i++) {
          a[i] = this.get(i);
        }
        return a;
      },
      map : function (f) {
        return Set.fromArray(Collection.map(this.toArray(), f));
      },
      select : function (f) {
        return Set.fromArray(Collection.select(this.toArray(), f));
      }
    }
  });
  /**
   * @param Array
   * @return Set
   */
  Set.fromArray = function (list) {
    var s = new Set();
    for (var i = 0; i < list.length; i++) {
      s.add(list[i]);
    }
    return s;
  };
});
