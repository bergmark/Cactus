var FormHelper = Cactus.Application.FormHelper;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;

Class("User", {
  has : {
    id : null,
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

var editUser = new FormHelper({
  action : "/edit",
  fields : {
    name : {
      in : { type : "string" },
      out : {
        // Will always be string or ["string"] for form submissions.
        type : "string",
        validators : [{
          required : true,
          message : "This field is required"
        }, {
          // Non-required validations will not be executed if the field is required and value is empty.

        }]
      }
    },
    email : {
      type : "string",
      inout : {
        validators : [{
          regex : /^[^@]+@[^@]+\.[^@]+$/,
          message : "Invalid e-mail address."
        }]
      }
    },
    bestFriend : {
      type : User,
      in : {
        transform : function (v) {
          return v.getId();
        }
      },
      out : {
        type : "string",
        required : false,
        // Is executed before validators,
        // return value is validated against `type`.
        // Value is passed as 2nd arg to validators.
        transform : function (id) {
          return UserRepository.find(parseInt(id, 10));
        },
        validators : [{
          func : function (id, user) {
            return UserRepository.isValidId(id);
          },
          message : "Invalid user id."
        }, {
          func : function (id, user) {
            return user.hasFriend(user);
          },
          message : "You're not friends with this user."
        }]
      }
    },
    friends : {
      type : [User],
        in : {
          transform : function (v) {
            return v.getId();
          }
        },
      out : {
        type : ["string"],
        transform : function (ids) {
          return C.map(ids, function (v) { return UserRepository.find(parseInt(id, 10)); });
        }
      }
    },
    subscribeToNewsletter : {
      type : "boolean",
      out : {
        required : true
      }
    },
    country : {
      enumerable : ["SWE", "ENG", "FIN", "USA"]
    }
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
    // Throw error on missing default.
    assert.throws(data.getWithDefault.bind(data, "name"), /No default defined for field "name"/);
  },
  "validation errors" : function () {
    var userfh = new FormHelper({
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

    var data = userfh.newData();
    assert.ok(!data.isValid());
    data.populate({
      name : "my name",
      email : "",
      password : ""
    });
    assert.ok(data.isValid());
    data = userfh.newData();
    jsoneq({
      name : ["Missing property"],
      email : ["Missing property"],
      password : ["Missing property"]
    }, data.getErrors());

    // Validators.
    data = userfh.newData();
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
    var user = new User({
      id : 1
    });
    var fh = new FormHelper({
      action : "/new",
      fields : {
        user : { type : User }
      },
      transformers : {
        user : {
          transform : function (u) { return u.id; },
          reverse : Function.returning(user)
        }
      }
    });
    var data = fh.newData();
    data.populate({
      user : user
    });
    var renderer = fh.newRenderer(HashRenderer, data);
    renderer.begin();
    jsoneq({
      input : {
        type : "text",
        value : 1
      }
    }, renderer.field("user"));

    data.reversePopulate({
      user : 1
    });
    assert.ok(data._values.user instanceof User);
    assert.strictEqual(1, data.getWithDefault("user"));
    assert.strictEqual(user, data.get().user);
  }
};
