/**
 * @file
 * Provides helpers for working with objects as hashes.
 */
Module("Cactus.Addon", function (m) {
  m.Object = {
    /**
     * Checks if an object has no properties of its own
     *
     * @param Object o
     * @return boolean
     */
    isEmpty : function (o) {
      if (!o || !(o instanceof Object)) {
        return false;
      }
      for (var p in o) if (o.hasOwnProperty(p)) {
        return false;
      }
      return true;
    },
    /**
     * Copies all the properties of an object to another object
     * no deep copy is made. If copy isn't specified then a new
     * shallow copied object is created.
     *
     * @param Object o
     * @param optional Object copy
     * @return Object
     *   The copy
     */
    copy : function (o, copy) {
      copy = copy || {};
      for (var p in o) if (o.hasOwnProperty(p)) {
        copy[p] = o[p];
      }

      return copy;
    },
    /**
     * Executes a function on each property/value pair in an object
     * and returns an array of the results.
     *
     * @param Object object
     * @param Function func
     *          @param string property
     *          @param mixed value
     *          @return mixed
     * @return Object
     */
    map : function (object, func) {
      var h = {};
      for (var p in object) if (object.hasOwnProperty(p)) {
        h[p] = func(p, object[p]);
      }
      return h;
    },
    /**
     * @param Object object
     * @param String methodName
     * @param mixed *arg1
     * @return Function
     *   The function found under object[methodName] bound (using Function:bind) to
     *   object, currying with arg1 and later arguments.
     */
    bound : function (object, methodName, arg1) {
      var args = Array.prototype.slice.call(arguments, 2);
      return Function.prototype.bind.apply(object[methodName], [object].concat(args));
    },
    /**
     * Counts the number of properties in the object.
     *
     * @param Object object
     * @return int
     */
    count : function (object) {
      var i = 0;
      for (var p in object) if (object.hasOwnProperty(p)) {
        i++;
      }
      return i;
    },
    /**
     * Gets all own keys (properties) in an Object.
     *
     * @param Object object
     * @return Array<string>
     */
    keys : function (object) {
      var keys = [];
      for (var p in object) if (object.hasOwnProperty(p)) {
        keys.push(p);
      }
      return keys;
    },
    /**
     * Returns a function that gets the specified property from the object when
     * called.
     *
     * @param Object object
     * @param string property
     * @return Function
     */
    gettingProp : function (object, property) {
      return function () {
        return object[property];
      };
    },
    /**
     * Returns a new object with all properties of a and b. No copies are made.
     * @param Object a
     * @param Object b
     * @return Object
     */
    merge : function (a, b) {
      var o = {};
      for (var p in a) if (a.hasOwnProperty(p)) {
        o[p] = a[p];
      }
      for (p in b) if (b.hasOwnProperty(p)) {
        o[p] = b[p];
      }
      return o;
    },
    /**
     * Removes all properties containing the given value.
     * Does not mutate the argument.
     *
     * @param Object o
     * @param mixed value
     * @return Object
     */
    remove : function (o, value) {
      var res = {};
      for (var p in o) if (o.hasOwnProperty(p) && o[p] !== value) {
        res[p] = o[p];
      }
      return res;
    },
    /**
     * Use as a shorthand when wanting to generate a new Object in callback.
     *
     * @return Object
     */
    new : function () {
      return {};
    }
  };
});
