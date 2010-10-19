var Joose = require('Joose');

Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("StrictHash", {
    has : {
      map : {
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
          this.map.define(keys[i], null);
        }
      },
      set : function (key, value) {
        this.map.set(key, value);
      },
      get : function (key) {
        return this.map.get(key);
      }
    }
  });
});
