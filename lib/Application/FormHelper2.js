Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("FormHelper2", {
    has : {
      _definition : null
    },
    methods : {
      BUILD : function (definition) {
        return {
          _definition : definition
        };
      },
      getFieldNames : function () {
        return o.keys(o.map(this._definition.fields, function (key) {
          return key;
        })).sort();
      }
    }
  });
});