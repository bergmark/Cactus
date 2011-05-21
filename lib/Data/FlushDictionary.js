/**
 * @file
 * A dictionary where when getting the values under a key you clear all the
 * values under that key.
 */
Module("Cactus.Data", function (m) {
  Class("FlushDictionary", {
    has : {
      _map : { init : function () { return {}; } }
    },
    methods : {
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
       * @return Array<mixed>
       *   Returns an empty array if nothing is stored under that key.
       */
      get : function (key) {
        if (!this.has(key)) {
          return [];
        }
        var vals = this._map[key];
        delete this._map[key];
        return vals;
      }
    }
  });
});
