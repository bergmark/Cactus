var Equality = Cactus.Data.Equality;
module.exports = {
  equals : function () {

    var called = false;

    var Eq = Class({
      does : Equality,
      methods : {
        equals : function (b) {
          called = true;
          return this === b;
        }
      }
    });

    var eq = new Eq();
    ok(Equality.equals(eq, eq));
    called = false;
    not(Equality.equals(null, eq));
    not(called);
    ok(Equality.equals(null, null));
    ok(Equality.equals(null, undefined));
    ok(Equality.equals(undefined, null));
  }
};
