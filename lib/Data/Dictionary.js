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
       * Whether any elements are stored under this key.
       *
       * @param string key
       * @return boolean
       */
      hasKey : function (key) {
        return key in this._map;
      },
      /**
       * @param mixed val
       * @return boolean
       */
      hasValue : function (val) {
        return this.findKey(val) !== null;
      },
      /**
       * @param string key
       * @param mixed val
       */
      add : function (key, val) {
        if (!this.hasKey(key)) {
          this._map[key] = [];
        }
        this._map[key].push(val);
      },
      /**
       * @param string key
       * @return mixed
       */
      get : function (key) {
        if (!this.hasKey(key)) {
          return [];
        };
        return A.clone(this._map[key]);
      },
      /**
       * @param string key
       * @param mixed value
       */
      removeValue : function (key, value) {
        if (!this.hasKey(key)) {
          return;
        }
        A.remove(this._map[key], value);
      },
      /**
       * @param string key
       */
      removeKey : function (key) {
        delete this._map[key];
      },
      /**
       * @param string key
       * @param mixed value
       * @return boolean
       */
      keyHasValue : function (key, value) {
        return this.hasKey(key) && C.hasValue(this._map[key], value);
      },
      /**
       * All keys that have values.
       *
       * @return Array<string>
       */
      keys : function () {
        return O.keys(this._map);
      },
      /**
       * Finds the first key containing the specified value, or null if the
       * value isn't in the Dictionary.
       *
       * @param mixed value
       * @return string key
       *   null if no key is found.
       */
      findKey : function (val) {
        for (var i = 0, keys = this.keys(); i < keys.length; i++) {
          if (C.hasValue(this.get(keys[i]), val)) {
            return keys[i];
          }
        }
        return null;
      }
    }
  });
});
