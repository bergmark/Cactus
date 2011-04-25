Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;

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
  Class("FormHelper", {
    has : {
      action : null,
      fields : null
    },
    methods : {
      getFieldNames : function () {
        var fields = [];
        for (var p in this.fields) {
          fields.push(p);
        }
        return fields.sort();
      },
      newRenderer : function () {
        return new Cactus.Application.Renderer(this);
      }
    }
  });
});
