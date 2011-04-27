Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;

  Class("Renderer", {
    has : {
      _begun : false,
      _formHelper : null,
      _unRenderedFields : { init : function () { return []; } },
      _data : { is : "ro", getterName : "_getData" }
    },
    methods : {
      BUILD : function (formHelper, data) {
        return {
          _formHelper : formHelper,
          _data : data
        };
      },
      initialize : function () {
        this._unRenderedFields = this._formHelper.getFieldNames();
      },
      begin : function () {
        if (this._begun) {
          throw new Error("Renderer:begin: begin was called twice.");
        }
        this._begun = true;
      },
      field : function (name) {
        if (!this._begun) {
          throw new Error("Renderer:field: Need to call begin before end.");
        }
        if (!C.hasValue(this._unRenderedFields, name)) {
          throw new Error("Renderer:field: Trying to render undefined or already rendered field \"" + name + "\"");
        }
        array.remove(this._unRenderedFields, name);
      },
      _getFieldValue : function (fieldName, defaultValue) {
        return this._getData().getWithDefault(fieldName, defaultValue);
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

  Class("Data", {
    has : {
      _formHelper : { required : true },
      _values : { init : function () { return {}; } },
      _unPopulatedFields : { init : function () { return []; } },
      _defaults : null
    },
    methods : {
      BUILD : function (formHelper, defaults) {
        return {
          _formHelper : formHelper,
          _defaults : defaults || {}
        };
      },
      initialize : function () {
        this._unPopulatedFields = this._formHelper.getFieldNames();
      },
      populate : function (values) {
        for (var p in values) {
          this._values[p] = values[p];
          array.remove(this._unPopulatedFields, p);
        }
      },
      reversePopulate : function (values) {
        var vs = {};
        for (var p in values) {
          if (p in this._formHelper._transformers) {
            vs[p] = this._formHelper._transformers[p].reverse(values[p]);
          } else {
            vs[p] = values[p];
          }
        }
        this.populate(vs);
      },
      get : function () {
        var o = this._formHelper._options;
        o.parse(this._values);
        return this._values;
      },
      getWithDefault : function (fieldName, defaultValue) {
        var v = null;
        if (fieldName in this._values) {
          v = this._values[fieldName];
        } else if (defaultValue !== undefined) {
          v = defaultValue;
        } else if (fieldName in this._defaults) {
          v = this._defaults[fieldName];
        } else {
          throw new Error("Data:getWithDefault: No default defined for field \"" + fieldName + "\" and value was not populated");
        }
        if (fieldName in this._formHelper._transformers) {
          v = this._formHelper._transformers[fieldName].transform(v);
        }
        return v;
      },
      isValid : function () {
        var o = this._formHelper._options;
        o.parse(this._values, false);
        return !o.hasErrors();
      },
      getErrors : function () {
        var o = this._formHelper._options;
        o.parse(this._values, false);
        return o.getErrors();
      }
    }
  });
  Class("FormHelper", {
    has : {
      data : { init : function () { return {}; } },
      action : { is : "ro" },
      _fieldNames : { init : function () { return []; } },
      _options : null,
      _transformers : { init : function () { return {}; } }
    },
    methods : {
      initialize : function (args) {
        for (var fieldName in args.fields) {
          this._fieldNames.push(fieldName);
        }
        this._fieldNames.sort();
        this._options = new Options({
          type : args.fields
        });
        this._transformers = args.transformers || {};
      },
      getFieldNames : function () {
        return array.clone(this._fieldNames);
      },
      newRenderer : function (Renderer, data) {
        return new (Renderer || Cactus.Application.Renderer)(this, data || new Cactus.Application.Data(this));
      },
      newData : function (defaults) {
        return new Cactus.Application.Data(this, defaults);
      }
    }
  });
});
