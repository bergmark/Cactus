var Clone = Cactus.Data.Clone;
var O = Cactus.Addon.Object;
module.exports = {
  initial : function () {
    var C = Class({
      does : Clone,
      has : {
        x : null,
        y : null,
        func : null
      }
    });
    var c = new C({
      x : 1,
      y : 2,
      func : function () {}
    });
    var func = function () {};
    var c2 = c.clone({ x : 3, y : 4, func : func });
    notequal(c, c2);
    equal(3, c2.x);
    equal(4, c2.y);
    equal(func, c2.func);

    var c3 = c.clone();
    equal(c.x, c3.x, c.x + "," + c3.x);
    equal(c.y, c3.y);
    equal(c.func, c3.func);
  }
};
