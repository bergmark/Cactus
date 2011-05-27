/**
 * @file
 * A Dictionary is a data structure where each key can have several values.
 * You can add values to a key, get all values under that key, and clear a key.
 * You can also check whether an element exists under a key, === is used for
 * this comparison.
 */
Module("Cactus.Data", function (m) {
  var A = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var O = Cactus.Addon.Object;
  Class("Dictionary", {
    has : {
      _map : null
    },
    methods : {
      BUILD : function (map) {
        return {
          _map : map || {}
        };
      },
      /**
       * @param string key
       * @return boolean
       */
      has : function (key) {
        return key in this._map;
      },
      /**
       * @param string key
       * @param mixed val
       */
      add : function (key, val) {
        if (!this.has(key)) {
          this._map[key] = [];
        }
        this._map[key].push(val);
      },
      /**
       * @param string key
       * @return mixed
       */
      get : function (key) {
        if (!this.has(key)) {
          return [];
        };
        return A.clone(this._map[key]);
      },
      /**
       * @param string key
       * @param mixed value
       */
      remove : function (key, value) {
        if (!this.has(key)) {
          return;
        }
        A.remove(this._map[key], value);
      },
      /**
       * @param string key
       */
      clear : function (key) {
        delete this._map[key];
      },
      /**
       * @param string key
       * @param mixed value
       * @return boolean
       */
      contains : function (key, value) {
        return this.has(key) && C.hasValue(this._map[key], value);
      },
      /**
       * All keys that have values.
       *
       * @return Array<string>
       */
      keys : function () {
        return O.keys(this._map);
      }
    }
  });
});
