/**
 * @file
 * A validator has a function that returns a bool, and an (error) message that
 * clients should use when a validation fails.
 */
Module("Cactus.Util", function (m) {
  var O = Cactus.Addon.Object;
  var Clone = Cactus.Data.Clone;
  var Validator = Class("Validator", {
    does : Clone,
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
       * @param optional mixed helpers
       * @return boolean
       */
      isValid : function (val, helpers) {
        return !!this.func(val, helpers);
      }
    }
  });
});
