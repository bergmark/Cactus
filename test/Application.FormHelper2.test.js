var FormHelper = Cactus.Application.FormHelper2;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;

var jsoneq = function (a, b) {
  return assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
};

var fh = new FormHelper({
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
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
    assert.strictEqual("/new", fh.getAction());
  },
  populate : function () {
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

    // Partial population with overrides.
    data = fh.newData();
    data.populate({
      name : "test",
      email : "test@example.com"
    });
    data.populate({
      name : "test2",
      password : "pass",
      passwordConfirmation : "pass"
    });
    jsoneq({
      name : "test2",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    }, data.get());

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
    // Throw error on missing default.
    assert.throws(data.getWithDefault.bind(data, "name"), /No default defined for field "name"/);
  },
  "validation errors" : function () {
    var fh = new FormHelper({
      action : "/new",
      fields : {
        name : {
          type : "string",
          validators : [{
            func : function (v) {
              return v.length >= 5;
            },
            message : "At least 5 characters."
          }, {
            func : function (v) {
              return /^[A-Z ]*$/i.test(v);
            },
            message : "only A-z and spaces."
          }]
        },
        email : { type : "string" },
        password : { type : "string" },
        passwordConfirmation : { type : "string", required : false }
      }
    });

    var data = fh.newData();
    assert.ok(!data.isValid());
    data.populate({
      name : "my name",
      email : "",
      password : ""
    });
    assert.ok(data.isValid());
    data = fh.newData();
    jsoneq({
      name : ["Missing property"],
      email : ["Missing property"],
      password : ["Missing property"]
    }, data.getErrors());

    // Validators.
    data = fh.newData();
    data.populate({
      name : "",
      email : "",
      password : ""
    });
    jsoneq({
      name : ["Validation failed: At least 5 characters."]
    }, data.getErrors());
  },
  valueTransformers : function () {
    var user = {
      id : 1
    };
    var fh = new FormHelper({
      action : "/new",
      fields : {
        user : {
          type : Object,
          inTransformer : function (u) {
            return u.id;
          },
          outTransformer : function (id) {
            return {
              id : id
            };
          }
        }
      }
    });
    var data = fh.newData();
    data.populate({
      user : user
    });
    jsoneq({
      user : {
        id : 1
      }
    }, data.get());

    data.reversePopulate({
      user : 1
    });
    assert.ok(data._values.user instanceof Object);
    assert.strictEqual(1, data.getWithDefault("user"));
    jsoneq(user, data.get().user);
  },
  rendering : function () {
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
  }
};
