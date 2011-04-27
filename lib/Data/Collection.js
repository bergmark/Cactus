/**
 * @file
 *
 * Provides helper functions for working with collections.
 *
 * Terminology:
 *   A Collection is an object with numerical indices and a length property.
 *   The first index is 0. A length property also has to exist. So this includes
 *   Arrays, NodeLists (HTMLCollections), 'arguments' objects and some custom
 *   types.
 *
 * The type of a collection should be given as "collection" in documentation.
 * It's safe to assume that arrays are returned when functions that generate new
 * collections are used (return values state this).
 *
 * In collection methods that take additional non-collection args the collection
 * is the first argument.
 */
Module("Cactus.Data", function (m) {
  var math = Cactus.Addon.Math;
  var Pair = Cactus.Data.Pair;
  var Collection = {
    /**
     * Coerces a collection into an Array.
     * If the object is readOnly, as with a NodeList, pass the iterate flag
     * to iterate through the collection and create an array of the contents.
     *
     * A new object is returned, the argument remains the same type.
     *
     * @param collection collection
     *   The collection to convert.
     * @param optional boolean iterate = false
     *   Whether the collection is readOnly.
     */
    toArray : function (collection, iterate) {
      if (!Collection.isCollection(collection)) {
        throw new Error("Collection:toArray: collection argument must be a collection.");
      }
      if (!iterate) {
        return Array.prototype.slice.call(collection);
      } else {
        var a = [];
        for (var i = 0; i < collection.length; i++) {
          a.push(collection[i]);
        }
        return a;
      }
    },
    /**
     * Checks if the given value is inside the collection.
     *
     * @param collection collection
     *   The collection to look through.
     * @param mixed value
     *   The value to look for.
     * @return boolean
     *   Whether the value is in the collection.
     */
    hasValue : (function () {
      // Use native indexOf it it exists.
      if (Array.prototype.indexOf) {
        return function (collection, value) {
          return Array.prototype.indexOf.call(collection, value) !== -1;
        };
      } else {
        return function (collection, value) {
          for (var i = 0; i < collection.length; i++) {
            if (collection[i] === value) {
              return true;
            }
          }
          return false;
        };
      }
    })(),
    /**
     * Checks if two collections share any value. Runs in O(n^2).
     *
     * @param collection a
     * @param collection b
     * @return boolean
     *   Whether a value was found inside both a and b.
     */
    intersects : function (a, b) {
      for (var i = 0; i < a.length; i++) {
        if (Collection.hasValue(b, a[i])) {
          return true;
        }
      }
      return false;
    },
    /**
     * Returns an array of the intersecting elements of two collections.
     * The ordering of the returned elements is arbitrary.
     *
     * @param collection a
     * @param collection b
     * @return Array
     *   The elements occuring in both a and b, or an empty array if none is
     *   found.
     */
    intersection : function (a, b) {
      var intersection = [];
      for (var i = 0; i < a.length; i++) {
        if (Collection.hasValue(b, a[i])) {
          intersection.push(a[i]);
        }
      }
      return intersection;
    },
    /**
     * Gets the last element out of a collection.
     *
     * @param collection collection
     *   The collection to retrieve the value from.
     * @return mixed
     *   The last element.
     * @throws Error
     *   If the array is empty
     */
    last : function (collection) {
      if (!collection.length) {
        throw Error("Collection:last: Collection is empty.");
      }
      return collection[collection.length - 1];
    },
    /**
     * Checks if a collection can be iterated through using
     * numeric indices and the length property.
     *
     * @param mixed collection
     * @return boolean
     */
    isCollection : function (collection) {
      var glob = null;
      if (typeof window !== "undefined") {
        glob = window;
      } else if (typeof global !== "undefined") {
        glob = global;
      }
      return !!(collection &&
                (typeof collection === "object") &&
                ("length" in collection) &&
                isFinite(collection.length) &&
                (glob !== null && collection !== glob) &&
                !("tagName" in collection));
    },
    /**
     * Performs slice on a collection.
     *
     * @param collection collection
     *   The collection to slice.
     * @param *args
     *   Any arguments to pass to Array:slice
     * @return Array
     *   The sliced array.
     */
    slice : function (collection, args) {
      args = Array.prototype.slice.call(arguments, 1);
      return Array.prototype.slice.apply(collection, args);
    },
    /**
     * Slices an collection using a range to define the boundaries.
     *
     * @param collection collection
     *   The collection to slice.
     * @param Util.Range range
     *   The boundaries of the slice.
     * @return Array
     *   The new array.
     */
    sliceWithRange : function (collection, range) {
      return Collection.slice(collection, range.getStart(), range.getEnd() + 1);
    },
    /**
     * Returns an array of all elements in the given array that
     * gives a true return value when passed to the given function.
     *
     * @param collection collection
     *   The collection to loop through.
     * @param Function func
     *   A function with a boolean return type.
     * @return Array
     *   The matched elements.
     */
    select : function (collection, func) {
      var selection = [];
      for (var i = 0; i < collection.length; i++) {
        if (func(collection[i], i)) {
          selection.push(collection [i]);
        }
      }
      return selection;
    },
    /**
     * A Higher-order function that returns an array with
     * all elements in the given array that do not match
     * the given function.
     *
     * @param collection collection
     *   The collection to look through.
     * @param Function func(element) -> boolean
     *   A predicate function to apply the elements of the collection to.
     * @return Array
     *   The elements not matching the predicate.
     */
    reject : function (collection, func) {
      var a = [];
      for (var i = 0; i < collection.length; i++) {
        if (!func(collection[i], i)) {
          a.push(collection[i]);
        }
      }
      return a;
    },
    /**
     * Returns the index of an object in a collection.
     *
     * @param collection collection
     *   The collection to look in.
     * @param mixed object
     *   The object to look for.
     * @param optional throwError = true
     *   If true, an error is thrown if the object isn't found in the collection.
     *   If false, -1 is returned if the object isn't found.
     * @return integer
     *   The index of the located object.
     * @throws Error
     *   If the object isn't in the collection and throwError is set to true.
     */
    indexOf : function (collection, object, throwError) {
      throwError = throwError === true || throwError === undefined;
      for (var i = 0; i < collection.length; i++) {
        if (collection[i] === object) {
          return i;
        }
      }

      if (throwError) {
        throw new Error("Collection:indexOf: Object is not in collection.");
      } else {
        return -1;
      }
    },
    /**
     * Returns an array of all return values of func applied
     * to each key value pair in the collection.
     *
     * @param collection collection
     * @param Function func
     * @return Array
     */
    map : function (collection, func) {
      var a = [];
      for (var i = 0; i < collection.length; i++) {
        a.push(func(collection[i], i));
      }
      return a;
    },
    /**
     * Calls the specified function for every element in the collection.
     *
     * @param collection collection
     * @param Function func
     */
    each : function (collection, func) {
      for (var i = 0; i < collection.length; i++) {
        func(collection[i], i);
      }
    },
    /**
     * Returns whether the given predicate is true for one or more
     * elements in the collection.
     *
     * @param collection collection
     * @param Function predicate
     * @return boolean
     */
    some : function (collection, pred) {
      for (var i = 0; i < collection.length; i++) {
        if (pred(collection[i], i)) {
          return true;
        }
      }
      return false;
    },
    /**
     * Returns whether the given predicate is false for all
     * elements in the collection.
     *
     * @param collection collection
     * @param Function pred
     * @return boolean
     */
    notAny : function (collection, pred) {
      return !Collection.some(collection, pred);
    },
    /**
     * Returns whether the given predicate is true for all the
     * elements in the collection.
     *
     * @param collection collection
     * @param Function pred
     * @return boolean
     */
    every : function (collection, pred) {
      for (var i = 0; i < collection.length; i++) {
        if (!pred(collection[i], i)) {
          return false;
        }
      }
      return true;
    },
    /**
     * Returns whether the given predicate is false for at least one
     * element in the collection.
     *
     * @param collection collection
     * @param Function pred
     * @return boolean
     */
    notEvery : function (collection, pred) {
        return !Collection.every(collection, pred);
    },
    /**
     * Finds the first element of a collection matching the given predicate.
     *
     * @param collection collection
     * @param Function pred
     * @return mixed
     *   An element of the collection, or null if none matches the predicate.
     */
    findFirst : function (collection, pred) {
      for (var i = 0; i < collection.length; i++) {
        if (pred(collection[i])) {
          return collection[i];
        }
      }
      return null;
    },
    /**
     * Checks whether two collections have the same elements in the same order.
     *
     * @param collection a
     * @param collection b
     * @return boolean
     */
    equal : function (a, b) {
      if (a.length !== b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    },
    /**
     * @param collection collection
     *   A collection with at least one element.
     * @return mixed
     *   A randomly picked element in the collection.
     */
    randElement : function (collection) {
      if (collection.length === 0) {
        throw new Error("Collection:randElement: Empty collection");
      }
      return collection[math.rand(0, collection.length - 1)];
    },
    /**
     * @param collection a
     * @param collection b
     * @return Array
     *   All elements in a that are not in b.
     */
    difference : function (a, b) {
      var res = [];
      for (var i = 0; i < a.length; i++) {
        if (!Collection.hasValue(b, a[i])) {
          res.push(a[i]);
        }
      }
      return res;
    },
    /**
     * @param collection collection
     * @param Function f
     *          @param
     *          @return Array
     * @return Array
     */
    concatMap : function (collection, f) {
      var res = [];
      Collection.map(collection, function (v) {
        res = res.concat(f(v));
      });
      return res;
    },
    /**
     * Splits a collection into two, the first part is values matching the
     * predicate, and the second part is the rest.
     *
     * @param Array<x> collection
     * @param Function predicate
     *          @param<x>
     *          @return boolean
     * @return Pair<Array<x>,Array<x>>
     */
    partition : function (collection, predicate) {
      var first = [];
      var second = [];
      for (var i = 0; i < collection.length; i++) {
        if (predicate(collection[i])) {
          first.push(collection[i]);
        } else {
          second.push(collection[i]);
        }
      }
      return new Pair(first, second);
    },
    /**
     * Shallow flattening of a collection.
     *
     * @param collection<collection<x>>
     * @return array<x>
     */
    flatten : function (collection) {
      var res = [];
      for (var i = 0; i < collection.length; i++) {
        for (var j = 0; j < collection[i].length; j++) {
          res.push(collection[i][j]);
        }
      }
      return res;
    },
    /**
     * @param collection collection
     * @return boolean
     */
    isEmpty : function (collection) {
      return collection.length === 0;
    },
    /**
     * Shorthand for select:ing strings with a regexp.
     *
     * @param collection<string> collection
     * @param RegExp reg
     * @return collection<string>
     */
    grep : function (collection, reg) {
      return Collection.select(collection, reg.test.bind(reg));
    }
  };
  m.Collection = Collection;
});
