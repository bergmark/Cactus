Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("Renderer2", {
    has : {
      _begun : false,
      _formHelper : null,
      _unRenderedFields : { init : function () { return []; } },
      _data : null
    },
    methods : {
      BUILD : function (formHelper, data) {
        return {
          _formHelper : formHelper,
          _unRenderedFields : formHelper.getFieldNames(),
          _data : data
        };
      },
      begin : function () {
        if (this._begun) {
          throw new Error("Renderer:begin: begin was called twice.");
        }
        this._begun = true;
      },
      field : function (name, defaultValue) {
        if (!this._begun) {
          throw new Error("Renderer:field: Need to call begin before end.");
        }
        if (!C.hasValue(this._unRenderedFields, name)) {
          throw new Error("Renderer:field: Trying to render undefined or already rendered field \"" + name + "\"");
        }
        array.remove(this._unRenderedFields, name);
        return this._data.getWithDefault(name, defaultValue);
      },
      _allFieldsRendered : function () {
        return this._unRenderedFields.length === 0;
      },
      end : function () {
        if (!this._begun) {
          throw new Error("Renderer:end: Need to call begin before end.");
        }
        if (!this._allFieldsRendered()) {
          throw new Error("Renderer:end: Missing required fields: " + this._unRenderedFields);
        }
      }
    }
  });
  Class("Data2", {
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
      reversePopulate : function (values) {
        var me = this;
        return this.populate(o.map(values, function (name, value) {
          return me._formHelper.outTransform(name, value);
        }));
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
              type : {
                type : { type : "mixed" },
                inTransformer : { type : Function, defaultValue : Function.id },
                outTransformer : { type : Function, defaultValue : Function.id },
                required : { type : "boolean", defaultValue : true },
                validators : {
                  type : [{
                    type : {
                      func : { type : Function },
                      message : { type : "string" }
                    }
                  }],
                  defaultValue : []
                }
              }
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
            if ("validators" in def) {
              h.validators = def.validators;
            }
            return h;
          })
        });

        return {
          _definition : definition,
          _fieldOptions : fieldOptions
        };
      },
      outTransform : function (fieldName, value) {
        return this._definition.fields[fieldName].outTransformer(value);
      },
      inTransform : function (fieldName, value) {
        return this._definition.fields[fieldName].inTransformer(value);
      },
      getFieldNames : function () {
        return o.keys(o.map(this._definition.fields, function (key) {
          return key;
        })).sort();
      },
      getAction : function () {
        return this._definition.action;
      },
      newData : function (defaults) {
        return new m.Data2(this, defaults);
      },
      parse : function (v) {
        this._fieldOptions.parse(v);
      },
      newRenderer : function (data) {
        return new m.Renderer2(this, data || this.newData());
      }
    }
  });
});
