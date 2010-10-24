var Joose = require('Joose');

Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("StrictHash", {
    has : {
      keys : null,
      _map : {
        init : function () {
          var sm = new m.StrictMap();
          sm._setClassName("StrictHash");
          return sm;
        }
      }
    },
    methods : {
      initialize : function (args) {
        var keys = args.keys;
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
