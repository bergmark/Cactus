var FormHelper = Cactus.Application.FormHelper2;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;

var jsoneq = function (a, b) {
  return assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
};

var userfh = new FormHelper({
  action : "/new",
  fields : {
    email : { type : "string" },
    name : { type : "string" },
    password : { type : "string" },
    passwordConfirmation : { type : "string", required : false }
  }
});

module.exports = {
  init : function () {
    var fh = userfh;
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
    assert.strictEqual("/new", fh.getAction());
  },
  populate : function () {
    var fh = userfh;
    var data = fh.newData();
    data.populate({
      name : "test",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    });
    jsoneq({
      name : "test",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    }, data.get());

    // Can't get if required values are missing.
    data = fh.newData();
    data.populate({});
    assert.throws(data.get.bind(data), function (e) {
      assert.ok(/"name": Missing property/.test(e.message));
      assert.ok(/"password": Missing property/.test(e.message));
      assert.ok(/"email": Missing property/.test(e.message));
      assert.ok(/"name": Missing property/.test(e.message));
      assert.ok(!/"passwordConfirmation"/.test(e.message));
      return true;
    });

    // Getting values on validation errors (for view).
    data = fh.newData();
    data.populate({
      name : "test",
      passwordConfirmation : "pass"
    });
    var gwd = data.getWithDefault.bind(data);
    assert.strictEqual("test", gwd("name", "foo"));
    assert.strictEqual("pass", gwd("passwordConfirmation", "bar"));
    assert.strictEqual("baz", gwd("password", "baz"));
  }
};
