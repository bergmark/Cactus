/**
 * @file
 * Cloning. By default all instance variables are shared when an object is cloned.
 * Implementing classes may override `clone` for custom behavior.
 */
Module("Cactus.Data", function (m) {
  var O = Cactus.Addon.Object;
  Role("Clone", {
    methods : {
      /**
       * @param optional map args
       * @return Clone
       */
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
