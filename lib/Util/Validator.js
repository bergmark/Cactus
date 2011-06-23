Module("Cactus.Util", function (m) {
  var O = Cactus.Addon.Object;
  var Validator = Class("Validator", {
    has : {
      func : { required : true },
      message : { required : true, is : "ro" }
    },
    methods : {
      isValid : function (val) {
        return this.func(val);
      },
      clone : function (args) {
        return new Validator(O.copy(args, {
          func : this.func,
          message : this.message
        }));
      }
    }
  });
});
