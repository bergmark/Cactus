var Joose = require('Joose');
/**
 * @file
 * A Map that can have any key as a property, not just strings.
 * The inner construct is just an Array ATM, so handling won't be very fast.
 */
Joose.Module("CactusJuice.Data", function (m) {
  var collection = new CactusJuice.Data.Collection();
  var array = new CactusJuice.Addon.Array();
  Joose.Class("ObjectMap", {
    has : {
      keys : {
        init : function () { return []; }
      },
      values : {
        init : function () { return []; }
      }
    },
    methods : {
      /**
       * @param Object key
       * @param Object value
       */
      set : function (key, value) {
        if (this.has(key)) {
          var i = collection.indexOf(this.keys, key);
          this.values[i] = value;
        } else {
          this.keys.push(key);
          this.values.push(value);
        }
      },
      /**
       * @param Object key
       * @return Object
       */
      get : function (key) {
        return this.values[collection.indexOf(this.keys, key)];
      },
      /**
       * @param Object key
       * @return boolean
       */
      has : function (key) {
        return collection.hasValue(this.keys, key);
      },
      /**
       * @param Object key
       */
      remove : function (key) {
        var value = this.get(key);
        array.remove(this.keys, key);
        array.remove(this.values, value);
      }
    }
  });
});
