var Joose = require('Joose');
/**
 * @file
 * A Map with stricter behavior than a regular Map(/Object).
 * Clients must define properties when they are first used, and an attempt to
 * to get/set the value of an undefined property is made, an error is thrown.
 * An Error is also thrown if trying to define an already existing property.
 */
Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("StrictMap", {
    has : {
      keys : {
        init : function () { return []; }
      },
      _map : {
        init : function () { return {}; }
      },
      className : {
        init : "StrictMap"
      }
    },
    methods : {
      /**
       * @param optional Map map
       *   If supplied, the value is wrapped with the strict map instance.
       *   Note that no copy is made, so ownership of the map should be
       *   transferred to the StrictMap.
       *   If not supplied, an empty map is initialized.
       */
      initialize : function (args) {
        var map = args.map;
        if (map !== undefined) {
          if (map === null || typeof map !== "object") {
            throw new Error("%s:initialize: Expected Map argument, or no argument.".format(this.className));
          }
        }
        this._map = map || {};
        for (var p in this._map) if (this._map.hasOwnProperty(p)) {
          this.keys.push(p);
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
        if (!(key in this._map)) {

          throw new Error("%s:%s: Undefined key %s".format(this.className, methodName, key));
        }
      },
      /**
       * @param string methodName
       * @param string key
       * @throws Error if key is defined.
       */
      __checkNonExistence : function (methodName, key) {
        if (key in this._map) {
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
