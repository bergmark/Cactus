/**
 * @file
 * A Map that can have any key as a property, not just strings.
 * The inner construct is just an Array ATM, so handling won't be very fast.
 */
Joose.Module("Cactus.Data", function (m) {
  var collection = Cactus.Data.Collection;
  var array = Cactus.Addon.Array;
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
       * @param <k> key
       * @param <v> value
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
       * @param <k> key
       * @return <v>
       */
      get : function (key) {
        if (!this.has(key)) {
          throw new Error("ObjectMap:get: Undefined key " + key);
        }
        return this.values[collection.indexOf(this.keys, key)];
      },
      /**
       * @param <k> key
       * @return boolean
       */
      has : function (key) {
        return collection.hasValue(this.keys, key);
      },
      /**
       * @param <k> key
       */
      remove : function (key) {
        if (!this.has(key)) {
          throw new Error("ObjectMap:remove: Undefined key " + key);
        }
        var value = this.get(key);
        array.remove(this.keys, key);
        array.remove(this.values, value);
      },
      /**
       * @param Function f
       *          @param <a>
       *          @return <b>
       * return ObjectMap<k,b>
       */
      map : function (f) {
        var om = new m.ObjectMap();
        for (var i = 0; i < this.keys.length; i++) {
          om.set(this.keys[i], f(this.values[i]));
        }
        return om;
      },
      /**
       * @return Hash<<k>,<v>>
       */
      toHash : function () {
        var a = [];
        for (var i = 0; i < this.keys.length; i++) {
          var key = this.keys[i];
          var val = this.get(key);
          if (key instanceof Object && "serialize" in key) {
            key = key.serialize();
          }
          if (val instanceof Object && "serialize" in val) {
            val = val.serialize();
          }
          a.push([key, val]);
        }
        return a;
      },
      /**
       * @return <k>
       */
      getKeys : function () {
        return array.clone(this.keys);
      }
    }
  });
});
