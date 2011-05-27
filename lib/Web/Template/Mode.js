(function () {
  var m = Cactus.Web.Template;
  var O = Cactus.Addon.Object;
  m.Mode = Class({
    has : {
      /**
       * @type Map<string keyPath, enum{"both","read","write"}>
       */
      modes : { init : O.new }
    }, methods : {
      /**
       * @param string keyPath
       * @param enum{"both","read","write"} mode
       */
      set : function (keyPath, mode) {
        this.modes[keyPath] = mode || "both";
      },
      /**
       * @return enum{"both","read","write"}
       */
      get : function (keyPath) {
        return this.modes[keyPath] || "both";
      },
      /**
       * @param string keyPath
       * @return boolean
       */
      mayWriteToModel : function (keyPath) {
        var mode = this.get(keyPath);
        return mode === "write" || mode === "both";
      },
      /**
       * @param string keyPath
       * @return boolean
       */
      mayWriteToView : function (keyPath) {
        var mode = this.get(keyPath);
        return mode === "read" || mode === "both";
      },
      clone : function () {
        var clone = new m.Mode();
        for (var p in this.modes) {
          clone.set(p, this.modes[p]);
        }
        return clone;
      }
    }
  });
})();
