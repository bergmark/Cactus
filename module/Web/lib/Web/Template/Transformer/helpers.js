Module("Cactus.Web.Template.Transformer", function (m) {
  m.createSelect = function (rootKeyPath, valueKeyPath, textKeyPath) {
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
});
