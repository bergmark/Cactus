/**
 * @file
 * A dictionary where when getting the values under a key you clear all the
 * values under that key.
 */
Module("Cactus.Data", function (m) {
  Class("FlushDictionary", {
    isa : m.Dictionary,
    methods : {
      /**
       * Gets and clears the values under the provided key.
       *
       * @param string key
       * @return Array<mixed>
       *   Returns an empty array if nothing is stored under that key.
       */
      get : function (key) {
        if (!this.hasKey(key)) {
          return [];
        }
        var vals = this._map[key];
        delete this._map[key];
        return vals;
      }
    }
  });
});
