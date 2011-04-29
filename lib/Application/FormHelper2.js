Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("Renderer2", {

  });
  Class("Data2", {
    has : {
      _formHelper : null,
      _values : null
    },
    methods : {
      BUILD : function (formHelper) {
        this._formHelper = formHelper;
      },
      populate : function (data) {
        this._values = data;
      },
      getWithDefault : function (fieldName, defaultValue) {
        if (fieldName in this._values) {
          return this._values[fieldName];
        } else {
          return defaultValue;
        }
      },
      get : function () {
        this._formHelper.parse(this._values);
        return this._values;
      }
    }
  });

  Class("FormHelper2", {
    has : {
      _definition : null,
      _fieldOptions : null
    },
    methods : {
      BUILD : function (definition) {
        definition = new Options({
          type : {
            action : { type : "string" },
            fields : {
              map : true,
              type : "mixed"
            }
          }
        }).parse(definition);

        var fieldOptions = new Options({
          type : o.map(definition.fields, function (name, def) {
            var h = {
              type : def.type
            };
            if ("required" in def) {
              h.required = def.required;
            }
            return h;
          })
        });

        return {
          _definition : definition,
          _fieldOptions : fieldOptions
        };
      },
      getFieldNames : function () {
        return o.keys(o.map(this._definition.fields, function (key) {
          return key;
        })).sort();
      },
      getAction : function () {
        return this._definition.action;
      },
      newData : function () {
        return new m.Data2(this);
      },
      parse : function (v) {
        this._fieldOptions.parse(v);
      }
    }
  });
});
