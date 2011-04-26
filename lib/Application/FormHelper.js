Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;

  Class("Renderer", {
    has : {
      _begun : false,
      _formHelper : null,
      _unRenderedFields : { init : function () { return []; } }
    },
    methods : {
      BUILD : function (formHelper) {
        return {
          _formHelper : formHelper
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
      _unPopulatedFields : { init : function () { return []; } }
    },
    methods : {
      BUILD : function (formHelper) {
        return {
          _formHelper : formHelper
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
      get : function () {
        var o = this._formHelper._options;
        o.parse(this._values);
        return this._values;
      },
      getWithDefault : function (fieldName, defaultValue) {
        if (fieldName in this._values) {
          return this._values[fieldName];
        }
        return defaultValue;
      }
    }
  });
  Class("FormHelper", {
    has : {
      data : { init : function () { return {}; } },
      action : { is : "ro" },
      _fieldNames : { init : function () { return []; } },
      _options : null
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
      },
      getFieldNames : function () {
        return array.clone(this._fieldNames);
      },
      newRenderer : function (Renderer) {
        return new (Renderer || Cactus.Application.Renderer)(this);
      },
      newData : function () {
        return new Cactus.Application.Data(this);
      }
    }
  });
});
