var StrictMap = Cactus.Data.StrictMap;
var C = Cactus.Data.Collection;
var FlushDictionary = Cactus.Data.FlushDictionary;
var Set = Cactus.Data.Set;
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
    isa : FlushDictionary,
    has : {
      _keys : null
    },
    methods : {
      /**
       * @param optional Array<string> keys = []
       */
      BUILD : function (map) {
        var keys = new Set();
        for (var p in map) if (map.hasOwnProperty(p)) {
          if (!map[p] || map[p].length == 0) {
            throw new Error("StrictFlushDictionary:BUILD: Each key must have a non empty Array value.");
          }
          keys.add(p);
        }
        return {
          _keys : keys,
          _map : map || {}
        };
      },
      initialize : function (args) {
        for (var i = 0; i < this._keys.size(); i++) {
          this.define(this._keys.get(i));
        }
      },
      /**
       * @param string key
       */
      define : function (key) {
        this._keys.add(key);
      },
      /**
       * @param Array<string> keys
       */
      defineSeveral : function (keys) {
        for (var i = 0; i < keys.length; i++) {
          this.define(keys[i]);
        }
      },
      __checkExistance : function (methodName, key) {
        if (!this._keys.has(key)) {
          throw new Error('StrictFlushDictionary:' + methodName + ': undefined key "' + key + '"');
        }
      },
      /**
       * @param string key
       * @param mixed val
       */
      add : function (key, val) {
        this.__checkExistance("add", key);
        this.SUPER(key, val);
      },
      /**
       * @param string key
       * @return boolean
       */
      hasKey : function (key) {
        this.__checkExistance("has", key);
        return this.SUPER(key);
      },
      /**
       * @param string key
       * @return Array<mixed>
       */
      get : function (key) {
        this.__checkExistance("get", key);
        return this.SUPER(key);
      }
    }
  });
});
