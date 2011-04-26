var FormHelper = Cactus.Application.FormHelper;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;

Class("User", {
  has : {
    name : null,
    password : null,
    email : null
  }
});

var jsoneq = function (a, b) {
  return assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
};

var userfh = new FormHelper({
  action : "/new",
  fields : {
    name : { type : "string" },
    email : { type : "string" },
    password : { type : "string" },
    passwordConfirmation : { type : "string", required : false }
  }
});

Class("HashRenderer", {
  isa : Renderer,
  override : {
    begin : function () {
      this.SUPER();
      return {
        form : {
          action : this._formHelper.getAction()
        }
      };
    },
    field : function (fieldName) {
      this.SUPER(fieldName);
      return {
        input : {
          type : "text",
          value : this._getFieldValue(fieldName, "")
        }
      };
    },
    end : function () {
      this.SUPER();
      return {};
    }
  }
});


module.exports = {
  formhelper : function () {
    var fh = userfh;
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
  },
  rendering : function () {
    var fh = userfh;

    var renderer = fh.newRenderer(Renderer);
    renderer.begin();
    renderer.field("name");
    renderer.field("email");
    renderer.field("password");
    renderer.field("passwordConfirmation");
    renderer.end();

    // Need begin, render, end sequence.
    renderer = fh.newRenderer(Renderer);
    assert.throws(renderer.end.bind(renderer), /end: Need to call begin/i);

    renderer = fh.newRenderer(Renderer);
    renderer.begin();
    assert.throws(renderer.begin.bind(renderer), /begin: begin was called twice/i);

    renderer = fh.newRenderer(Renderer);
    assert.throws(renderer.field.bind(renderer, "email"), /field: Need to call begin/i);

    // Need to render all required fields before end.
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
    renderer = fh.newRenderer(Renderer);
    renderer.begin();
    assert.throws(renderer.end.bind(renderer),
                  /end: Missing required fields: email,name,password/i);

    // Can't render undefined or already rendered fields.
    renderer = fh.newRenderer(Renderer);
    renderer.begin();
    assert.throws(renderer.field.bind(renderer, "foo"),
                  /field: Trying to render undefined or already rendered field "foo"/i);
    renderer = fh.newRenderer(Renderer);
    renderer.begin();
    renderer.field("name");
    assert.throws(renderer.field.bind(renderer, "name"),
                  /field: Trying to render undefined or already rendered field "name"/i);
  },
  "Renderer subclassing" : function () {
    var fh = userfh;
    var data = fh.newData();
    data.populate({
      name : "test",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    });
    var renderer = fh.newRenderer(HashRenderer, data);
    jsoneq({ form : { "action" : "/new"} }, renderer.begin());
    assert.throws(renderer.begin.bind(renderer), /begin was called twice/i);
    jsoneq({ input : { type : "text", value : "test" } }, renderer.field("name"));
    assert.throws(renderer.end.bind(renderer), /missing required fields/i);
    renderer.field("email");
    assert.throws(renderer.field.bind(renderer, "email"), /already rendered field/i);
    renderer.field("password");
    renderer.field("passwordConfirmation");
    jsoneq({}, renderer.end());
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
  },
  "data with defaults" : function () {
    var fh = userfh;
    var data = fh.newData({
      name : "default name",
      email : "defaultemail@example.com",
      password : "",
      passwordConfirmation : ""
    });
    var gwd = data.getWithDefault.bind(data);
    assert.strictEqual("default name", gwd("name"));
    assert.strictEqual("x", gwd("name", "x"));

    // Not specifying defaults.
    data = fh.newData();
    assert.strictEqual("y", data.getWithDefault("name", "y"));
  }
};
