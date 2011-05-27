/**
 * @file
 * A Map with stricter behavior than a regular Map(/Object).
 * Clients must define properties when they are first used, and an attempt to
 * to get/set the value of an undefined property is made, an error is thrown.
 * An Error is also thrown if trying to define an already existing property.
 */
Module("Cactus.Data", function (m) {
  Class("StrictMap", {
    has : {
      keys : { init : function () { return []; } },
      _map : { init : function () { return {}; } },
      className : {
        init : "StrictMap"
      }
    },
    methods : {
      /**
       * @param optional map map
       *   If supplied, the value is wrapped with the strict map instance.
       *   Note that no copy is made, so ownership of the map should be
       *   transferred to the StrictMap.
       *   If not supplied, an empty map is initialized.
       */
      BUILD : function (map) {
        if (map !== undefined) {
          if (map === null || typeof map !== "object") {
            throw new Error("%s:initialize: Expected Map argument, or no argument.".format(this.className));
          }
        }
      },
      initialize : function (map) {
        this.defineSeveral(map);
      },
      /**
       * @param map<string, mixed>
       */
      defineSeveral : function (map) {
        for (var p in map) if (map.hasOwnProperty(p)) {
          this.define(p, map[p]);
        }
      },
      /**
       * @param string className
       */
      _setClassName : function (className) {
        this.className = className;
      },
      /**
       * @param string methodName
       * @param string key
       * @throws Error if key is undefined.
       */
      __checkKeyExistence : function (methodName, key) {
        if (!this.has(key)) {
          throw new Error("%s:%s: Undefined key %s".format(this.className, methodName, key));
        }
      },
      /**
       * @param string methodName
       * @param string key
       * @throws Error if key is defined.
       */
      __checkNonExistence : function (methodName, key) {
        if (this.has(key)) {
          throw new Error("%s:%s: key %s is already defined".format(this.className, methodName, key));
        }
      },
      /**
       * @param string key
       * @param mixed value
       * @throws Error if key is defined.
       */
      define : function (key, value) {
        this.__checkNonExistence("define", key);
        this.keys.push(key);
        this._map[key] = value;
      },
      /**
       * Checks key existance. You should only call this if you get the key from
       * your client, otherwise you can normally  keep track of the indexes
       * yourself.
       *
       * @param string key
       * @return boolean
       */
      has : function (key) {
        return key in this._map;
      },
      /**
       * @param string key
       * @param mixed value
       * @throws Error if key is undefined.
       */
      set : function (key, value) {
        this.__checkKeyExistence("set", key);
        this._map[key] = value;
      },
      /**
       * @param string key
       * @return mixed
       * @throws Error if key is undefined.
       */
      get : function (key) {
        this.__checkKeyExistence("get", key);
        return this._map[key];
      },
      /**
       * @param Function
       *          @param mixed value
       * @return StrictMap
       */
      map : function (f) {
        var sm = new m.StrictMap();
        for (var p in this.keys) if (this.keys.hasOwnProperty(p)) {
          var key = this.keys[p];
          sm.define(key, f(this.get(key)));
        }
        return sm;
      }
    }
  });
});
