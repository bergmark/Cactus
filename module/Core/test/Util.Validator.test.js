var Validator = Cactus.Util.Validator;
module.exports = {
  initial : function () {
    var v = new Validator({
      func : Function.empty.returning(true),
      message : "msg"
    });
    ok(v.isValid(null));
    equal("msg", v.getMessage());
  },
  "isValid bool returns" : function () {
    var v = new Validator({
      func : function (v) {
        return v;
      },
      message : "isValid"
    });
    equal(true, v.isValid(1));
    equal(false, v.isValid(0));
  },
  "isValid helpers" : function () {
    var v = new Validator({
      func : function (v, helpers) {
        return helpers;
      },
      message : "helpers"
    });
    ok(v.isValid(null, true));
    not(v.isValid(null, false));
  },
  cloning : function () {
    var v = new Validator({
      func : Function.returning(true),
      message : "msg"
    });
    var v2 = v.clone();
    notequal(v, v2);
    equal(v.func, v2.func);
    equal(v.message, v2.message);
    var v3 = v.clone({
      func : Function.returning(false),
      message : "msg2"
    });
    notequal(v.func, v3.func);
    notequal(v.message, v3.func);
  }
};
