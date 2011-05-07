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
      BUILD : function (formHelper, defaults) {
        return {
          _formHelper : formHelper,
          _defaults : defaults || {}
        };
      },
      populate : function (data) {
        for (var fieldName in data) {
          this._values[fieldName] = data[fieldName];
        }
      },
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
      isValid : function () {
        var o = this._formHelper._fieldOptions;
         o.parse(this._values, false);
        return !o.hasErrors();
      },
      getErrors : function () {
        var o = this._formHelper._fieldOptions;
        o.parse(this._values, false);
        return o.getErrors();
      },
      get : function () {
        this._formHelper.parse(this._values);
        return this._values;
      }
    },
    continued : {
      methods : {
        reversePopulate : function (values) {
          var me = this;
          var cont = this.CONT;
          o.map(values, function (name, value) {
            cont.and(function () {
              me._formHelper.outTransformCont(name, value).now();
            });
          });
          cont.thenRun(function () {
            var args = o.map(arguments, function (v) { return v[0]; });
            this.CONTINUE(args);
          });
        }
      }
    }
  });
});
