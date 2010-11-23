require('Task/Joose/NodeJS');
/**
 * @file
 * StrictHash is a hash where the client has to predefine keys.
 * All values are initialized to null.
 * a StrictHash then supports setting and getting of properties only.
 */
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
      /**
       * @param Array<String>
       */
      BUILD : function (keys) {
        this._map = new m.StrictMap();
        this._map._setClassName("StrictHash");
        for (var i = 0; i < keys.length; i++) {
          this._map.define(keys[i], null);
        }
      },
      /**
       * @param string key
       * @param mixed value
       */
      set : function (key, value) {
        this._map.set(key, value);
      },
      /**
       * @param string key
       * @return mixed
       */
      get : function (key) {
        return this._map.get(key);
      },
      /**
       * @param Function f
       *          @param mixed value
       *          @return mixed
       */
      map : function (f) {
        var sh = new m.StrictHash({ keys : this.keys});
        sh._map = this._map.map(f);
        return sh;
      }
    }
  });
});
