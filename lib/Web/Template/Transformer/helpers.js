(function () {
  var Transformer = Cactus.Web.Template.Transformer;
  var TypeChecker = Cactus.Util.TypeChecker;
  Transformer.createSelect = function (rootKeyPath, valueKeyPath, textKeyPath) {
    return {
      keyPath : rootKeyPath,
      forward : function (kvc) {
        return {
          value : kvc.getValue(valueKeyPath),
          text : kvc.getValue(textKeyPath)
        };
      }
    };
  };
})();
