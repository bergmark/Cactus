Module("Cactus.Data", function (m) {
  var O = Cactus.Addon.Object;
  Role("Clone", {
    methods : {
      clone : function (args) {
        var ivars = {};
        for (var p in this.meta.attributes) if (this.meta.attributes.hasOwnProperty(p)) {
          ivars[p] = this[p];
        }
        return new this.constructor(O.copy(args, ivars));
      }
    }
  });
});