/**
 * @file
 * See docs for DtoFactory.
 */
Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var TypeChecker = Cactus.Util.TypeChecker;
  var o = Cactus.Addon.Object;
  Class("Dto", {
    trait : JooseX.CPS,
    has : {
      _dtoFactory : null,
      _values : { init : function () { return {}; } },
      _defaults : null,
      _enumerables : { init : function () { return {}; } }
    },
    methods : {
      /**
       * @param DtoFactory dtoFactory
       * @param optional Map<string fieldName, mixed value> defaults
       */
      BUILD : function (dtoFactory, defaults) {
        return {
          _dtoFactory : dtoFactory,
          _defaults : defaults || {}
        };
      },
      /**
       * @param Map<string fieldName, mixed value>
       */
      populate : function (data) {
        for (var fieldName in data) {
          this._values[fieldName] = data[fieldName];
        }
      },
      /**
       * @param string fieldName
       * @param optional mixed defaultValue
       * @return mixed
       */
      getWithDefault : function (fieldName, defaultValue) {
        var v = null;
        if (fieldName in this._values) {
          v = this._values[fieldName];
        } else if (defaultValue) {
          v = defaultValue;
        } else if (fieldName in this._defaults) {
          v = this._defaults[fieldName];
        } else {
          throw new Error("Dto:getWithDefault: No default defined for field \"" +
                          fieldName + "\" and value was not populated");
        }
        return this._dtoFactory.inTransform(fieldName, v);
      },
      /**
       * Checks whether the entire Dto validates properly (including
       * checks for missing values)
       *
       * @return boolean
       */
      isValid : function () {
        var o = this._dtoFactory._fieldTypeChecker;
         o.parse(this._values, false);
        return !o.hasErrors();
      },
      /**
       * @return Map<string fieldName, Array<string>>
       */
      getErrors : function () {
        var o = this._dtoFactory._fieldTypeChecker;
        o.parse(this._values, false);
        return o.getErrors();
      },
      /**
       * Retrieves all dto values, but only if all fields validate. If you only
       * want to fetch parts of values (for the view), use getWithDefault for
       * those fields.
       *
       * @param mixed helpers
       *   Are passed along as the second arg to __validators for the DtoFactory.
       * @return Map<string fieldName, mixed value>
       */
      get : function (helpers) {
        return this._dtoFactory.parse(this._values, helpers);
      }
    },
    continued : {
      methods : {
        /**
         * Takes the "out" values from the view and converts them to application
         * values.
         *
         * @param Map<string fieldName, mixed value>
         * @param optional Map<string, mixed> helpers = {}
         *   Additional data to be passed to out transformers to construct
         *   the Dto.
         */
        reversePopulate : function (values, helpers) {
          helpers = helpers || {};
          var me = this;
          var cont = this.CONT;
          o.map(values, function (name, value) {
            cont.and(function () {
              me._dtoFactory.outTransformCont(name, value, helpers).thenRun(function (transformedValue) {
                this.CONT.CONTINUE([name, transformedValue]);
              });
            });
          });
          cont.thenRun(function () {
            var newValues = {};
            var args = C.map(arguments, function (v) { return v[0]; });
            C.map(args, function (arg) {
              if (arg[1] !== undefined) {
                newValues[arg[0]] = arg[1];
              }
            });
            me.populate(newValues);
            this.CONTINUE();
          });
        }
      }
    }
  });
});
