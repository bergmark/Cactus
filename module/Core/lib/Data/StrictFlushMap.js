/**
 * @file
 * A StrictMap that clears the key after its value has been retrieved.
 */
Module("Cactus.Data", function () {
  var StrictMap = Cactus.Data.StrictMap;
  Class("StrictFlushMap", {
    isa : StrictMap,
    methods : {
      /**
       * @param string key
       * @return mixed
       */
      get : function (key) {
        var v = this.SUPERARG(arguments);
        this.removeKey(key);
        return v;
      }
    }
  });
});
