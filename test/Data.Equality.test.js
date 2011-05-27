var Equality = Cactus.Data.Equality;
module.exports = {
  equals : function () {
    var Eq = Class({
      does : Equality,
      methods : {
        equals : function (b) {
          return this === b;
        }
      }
    });

    var eq = new Eq();
    ok(Equality.equals(eq, eq));
    not(Equality.equals(null, eq));
    ok(Equality.equals(null, null));
    ok(Equality.equals(null, undefined));
    ok(Equality.equals(undefined, null));
  }
};
