(function () {
  var Transformer = Cactus.Web.Template.Transformer;
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
