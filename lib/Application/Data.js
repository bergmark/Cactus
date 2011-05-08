/**
 * @file
 * See docs for Formhelper.
 */
Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("Data2", {
    trait : JooseX.CPS,
    has : {
      _formHelper : null,
      _values : { init : function () { return {}; } },
      _defaults : null,
      _enumerables : { init : function () { return {}; } }
    },
    methods : {
      /**
       * @param FormHelper formhelper
       * @param optional Map<string fieldName, mixed value> defaults
       */
      BUILD : function (formHelper, defaults) {
        return {
          _formHelper : formHelper,
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
          throw new Error("Data:getWithDefault: No default defined for field \"" +
                          fieldName + "\" and value was not populated");
        }
        return this._formHelper.inTransform(fieldName, v);
      },
      /**
       * Checks whether the entire Data object validates properly (including
       * checks for missing values)
       *
       * @return boolean
       */
      isValid : function () {
        var o = this._formHelper._fieldOptions;
         o.parse(this._values, false);
        return !o.hasErrors();
      },
      /**
       * @return Map<string fieldName, Array<string>>
       */
      getErrors : function () {
        var o = this._formHelper._fieldOptions;
        o.parse(this._values, false);
        return o.getErrors();
      },
      /**
       * Retrieves all data values, but only if all fields validate. If you only
       * want to fetch parts of values (for the view), use getWithDefault for
       * those fields.
       *
       * @return Map<string fieldName, mixed value>
       */
      get : function () {
        this._formHelper.parse(this._values);
        return this._values;
      }
    },
    continued : {
      methods : {
        /**
         * Takes the "out" values from the view and converts them to application values.
         *
         * @param Map<string fieldName, mixed value>
         */
        reversePopulate : function (values) {
          var me = this;
          var cont = this.CONT;
          o.map(values, function (name, value) {
            cont.and(function () {
              me._formHelper.outTransformCont(name, value).thenRun(function (transformedValue) {
                this.CONT.CONTINUE([name, transformedValue]);
              });
            });
          });
          cont.thenRun(function () {
            var newValues = {};
            var args = C.map(arguments, function (v) { return v[0]; });
            C.map(args, function (arg) {
              newValues[arg[0]] = arg[1];
            });
            me.populate(newValues);
            this.CONTINUE();
          });
        }
      }
    }
  });
});
