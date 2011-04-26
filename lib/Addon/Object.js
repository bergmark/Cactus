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
    }
  };
});
