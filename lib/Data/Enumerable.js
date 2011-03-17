Joose.Module("CactusJuice.Data", function (m) {
  var Collection = CactusJuice.Data.Collection;
  Joose.Role("Enumerable", {
    requires : ["toArray", "map", "select"]
  });
});