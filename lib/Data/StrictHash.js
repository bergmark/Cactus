var Joose = require('Joose');

Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("StrictHash", {
    has : {
      /**
        * @type Array<String>
        */
      keys : null,
      /**
       * @type StrictMap
       */
      _map : null
    },
    methods : {
      BUILD : function (keys) {
        this._map = new m.StrictMap();
        this._map._setClassName("StrictHash");
        for (var i = 0; i < keys.length; i++) {
          this._map.define(keys[i], null);
        }
      },
      set : function (key, value) {
        this._map.set(key, value);
      },
      get : function (key) {
        return this._map.get(key);
      },
      map : function (f) {
        var sh = new m.StrictHash({ keys : this.keys });
        sh._map = this._map.map(f);
        return sh;
      }
    }
  });
});
