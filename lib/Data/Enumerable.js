Joose.Module("Cactus.Data", function (m) {
  var Collection = Cactus.Data.Collection;
  Joose.Role("Enumerable", {
    requires : ["toArray", "map", "select"]
  });
});