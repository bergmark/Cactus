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
      _keys : { init : function () { return new Set(); } }
    },
    methods : {
      /**
       * @param optional Array<string> keys = []
       */
      BUILD : function (keys) {
        return {
          keys : keys || []
        };
      },
      initialize : function (args) {
        this.defineSeveral(args.keys);
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
      has : function (key) {
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
