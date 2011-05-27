/**
 * @file
 * See docs for DtoFactory.
 */
Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var TypeChecker = Cactus.Util.TypeChecker;
  var o = Cactus.Addon.Object;

  Class("Renderer", {
    has : {
      _begun : false,
      _dtoFactory : null,
      _unRenderedFields : { init : function () { return []; } },
      _dto : null,
      _action : { is : "ro", getterName : "getAction" }
    },
    methods : {
      /**
       * @param DtoFactory dtoFactory
       * @param Dto dto
       */
      BUILD : function (dtoFactory, dto, action) {
        return {
          _dtoFactory : dtoFactory,
          _unRenderedFields : dtoFactory.getFieldNames(),
          _dto : dto,
          _action : action
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
        return this._dto.getWithDefault(name, defaultValue);
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
