/**
 * @file
 * See docs for FormHelper.
 */
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
      /**
       * @param FormHelper formHelper
       * @param Data data
       */
      BUILD : function (formHelper, data) {
        return {
          _formHelper : formHelper,
          _unRenderedFields : formHelper.getFieldNames(),
          _data : data
        };
      },
      /**
       * Call before rendering starts. may only be called once for each Renderer.
       */
      begin : function () {
        if (this._begun) {
          throw new Error("Renderer:begin: begin was called twice.");
        }
        this._begun = true;
      },
      /**
       * Must be called exactly once for each required field between calls to
       * :begin and :end.
       *
       * @param string name
       * @param optional mixed defaultValue
       * @return mixed
       */
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
      /**
       * @return boolean
       */
      _allFieldsRendered : function () {
        return this._unRenderedFields.length === 0;
      },
      /**
       * Must be called exactly once after :begin is called, and :field is
       * called for each required value.
       */
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
});
