var StrictMap = Cactus.Data.StrictMap;
var C = Cactus.Data.Collection;
/**
 * @file
 * A Dictionary where you need to get all values for a key at once. After a get
 * the values under that key are removed from the Dictionary.
 *
 * Keys can be added either at init by passing an Array, or by calling define or
 * defineSeveral. You can't add a value to a key before it's defined.
 */
Module("Cactus.Data", function (m) {
  Class("StrictFlushDictionary", {
    has : {
      _map : { init : function () { return new StrictMap(); } }
    },
    methods : {
      /**
       * @param Array<string> keys
       */
      BUILD : function (keys) {
        return {
          keys : keys
        };
      },
      initialize : function (args) {
        this.defineSeveral(args.keys);
      },
      /**
       * @param string key
       */
      define : function (key) {
        this._map.define(key, []);
      },
      /**
       * @param Array<string> keys
       */
      defineSeveral : function (keys) {
        var h = {};
        for (var i = 0; i < keys.length; i++) {
          h[keys[i]] = [];
        }
        this._map.defineSeveral(h);
      },
      /**
       * @param string key
       * @param mixed val
       */
      add : function (key, val) {
        this._map.get(key).push(val);
      },
      /**
       * @param string key
       * @return boolean
       */
      has : function (key) {
        return !C.isEmpty(this._map.get(key));
      },
      /**
       * @param string key
       * @return Array<mixed>
       */
      get : function (key) {
       var vals = this._map.get(key);
        // Reset, and make sure returned value is a separate Array instance from
        // what's stored internally.
        this._map.set(key, []);
        return vals;
      }
    }
  });
});
