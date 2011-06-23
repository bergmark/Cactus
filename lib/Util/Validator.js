/**
 * @file
 * A validator has a function that returns a bool, and an (error) message that
 * clients should use when a validation fails.
 */
Module("Cactus.Util", function (m) {
  var O = Cactus.Addon.Object;
  var Validator = Class("Validator", {
    has : {
      /**
       * @type Function
       *         @type mixed
       *         @return boolean
       */
      func : { required : true },
      /**
       * @type string
       */
      message : { required : true, is : "ro" }
    },
    methods : {
      /**
       * @param mixed val
       * @return boolean
       */
      isValid : function (val) {
        return this.func(val);
      },
      /**
       * @param Hash args
       * @return Validator
       */
      clone : function (args) {
        return new Validator(O.copy(args, {
          func : this.func,
          message : this.message
        }));
      }
    }
  });
});
