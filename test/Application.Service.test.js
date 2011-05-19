var Service = Cactus.Application.Service;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;
var object = Cactus.Addon.Object;

var jsoneq = function (a, b) {
  return assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
};

var fh = new Service({
  email : { type : "string" },
  name : { type : "string" },
  password : { type : "string" },
  passwordConfirmation : { type : "string", required : false }
});

module.exports = {
  init : function () {
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
  },
  populate : function () {
    var dto = fh.newDto();
    dto.populate({
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
    }, dto.get());

    // Can't get if required values are missing.
    dto = fh.newDto();
    dto.populate({});
    assert.throws(dto.get.bind(dto), function (e) {
      assert.ok(/"name": Missing property/.test(e.message));
      assert.ok(/"password": Missing property/.test(e.message));
      assert.ok(/"email": Missing property/.test(e.message));
      assert.ok(/"name": Missing property/.test(e.message));
      assert.ok(!/"passwordConfirmation"/.test(e.message));
      return true;
    });

    // Partial population with overrides.
    dto = fh.newDto();
    dto.populate({
      name : "test",
      email : "test@example.com"
    });
    dto.populate({
      name : "test2",
      password : "pass",
      passwordConfirmation : "pass"
    });
    jsoneq({
      name : "test2",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    }, dto.get());

    // Getting values on validation errors (for view).
    dto = fh.newDto();
    dto.populate({
      name : "test",
      passwordConfirmation : "pass"
    });
    var gwd = dto.getWithDefault.bind(dto);
    assert.strictEqual("test", gwd("name", "foo"));
    assert.strictEqual("pass", gwd("passwordConfirmation", "bar"));
    assert.strictEqual("baz", gwd("password", "baz"));
  },
  "dto with defaults" : function () {
    var dto = fh.newDto({
      name : "default name",
      email : "defaultemail@example.com",
      password : "",
      passwordConfirmation : ""
    });
    var gwd = dto.getWithDefault.bind(dto);
    assert.strictEqual("default name", gwd("name"));
    assert.strictEqual("x", gwd("name", "x"));

    // Not specifying defaults.
    dto = fh.newDto();
    assert.strictEqual("y", dto.getWithDefault("name", "y"));
    // Throw error on missing default.
    assert.throws(dto.getWithDefault.bind(dto, "name"), /No default defined for field "name"/);
  },
  "validation errors" : function () {
    var fh = new Service({
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
    });

    var dto = fh.newDto();
    assert.ok(!dto.isValid());
    dto.populate({
      name : "my name",
      email : "",
      password : ""
    });
    assert.ok(dto.isValid());
    dto = fh.newDto();
    jsoneq({
      name : ["Missing property"],
      email : ["Missing property"],
      password : ["Missing property"]
    }, dto.getErrors());

    // Validators.
    dto = fh.newDto();
    dto.populate({
      name : "",
      email : "",
      password : ""
    });
    jsoneq({
      name : ["Validation failed: At least 5 characters."]
    }, dto.getErrors());
  },
  valueTransformers : function (done) {
    var user = {
      id : 1
    };
    var fh = new Service({
      user : {
        type : Object,
        inTransformer : function (u) {
          return u.id;
        },
        outTransformerCont : function (CONTINUE, id) {
          CONTINUE({
            id : id
          });
        }
      }
    });
    var dto = fh.newDto();
    dto.populate({
      user : user
    });
    jsoneq({
      user : {
        id : 1
      }
    }, dto.get());

    dto = fh.newDto();
    dto.reversePopulate({
      user : 1
    }).then(function () {
      assert.ok(dto._values.user instanceof Object);
      assert.strictEqual(1, dto.getWithDefault("user"));
      jsoneq(user, dto.get().user);

      // Reverse populating with undefined fields.
      dto.reversePopulate({
        undef : "undef"
      }).now()
    }).then(function () {
      assert.throws(dto.get.bind(dto), /"undef".+lacks definition/i);
      done();
    }).now();
  },
  "default value transformers" : function (done) {
    var fh = new Service({
      name : { type : "string" }
    });
    var dto = fh.newDto();
    dto.populate({
      name : "x"
    });
    assert.strictEqual("x", dto.get().name);

    dto = fh.newDto();
    dto.reversePopulate({
      name : "y"
    }).then(function () {
      assert.strictEqual("y", dto.get().name);
      done();
    }).now()
  },
  "reversePopulate with helpers" : function (done) {
    var fh = new Service({
      name : {
        type : "string",
        outTransformerCont : function (CONTINUE, name, helpers) {
          CONTINUE(helpers.myValue);
        }
      }
    });
    var dto = fh.newDto();
    dto.reversePopulate({
      name : "x"
    }, {
      myValue : "y"
    }).then(function () {
      assert.strictEqual("y", dto.get().name);
      done();
    }).now();
  },
  rendering : function () {
    var dto = fh.newDto({
      name : "x",
      email : "x@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    });
    var renderer = fh.newRenderer(dto, "action");
    assert.strictEqual("action", renderer.getAction());
    renderer.begin();
    assert.strictEqual("x", renderer.field("name"));
    assert.strictEqual("x@example.com", renderer.field("email"));
    assert.strictEqual("pass", renderer.field("password"));
    assert.strictEqual("pass", renderer.field("passwordConfirmation"));
    renderer.end();

    // Need begin, render, end sequence.
    renderer = fh.newRenderer();
    assert.throws(renderer.end.bind(renderer), /end: Need to call begin/i);

    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.begin.bind(renderer), /begin: begin was called twice/i);

    renderer = fh.newRenderer();
    assert.throws(renderer.field.bind(renderer, "email"), /field: Need to call begin/i);

    // Need to render all required fields before end.
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.end.bind(renderer),
                  /end: Missing required fields: email,name,password/i);

    // Can't render undefined or already rendered fields.
    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.field.bind(renderer, "foo"),
                  /field: Trying to render undefined or already rendered field "foo"/i);
    renderer = fh.newRenderer();
    renderer.begin();
    renderer.field("name", "x");
    assert.throws(renderer.field.bind(renderer, "name"),
                  /field: Trying to render undefined or already rendered field "name"/i);
  },
  "compound fields" : function () {
    Class("User", {
      has : {
        id : null
      }
    });
    var fh = new Service({
      users : {
        type : [{ type : User }],
        inTransformer : function (users) {
          return C.map(users, function (u) { return u.id; });
        },
        outTransformerCont : function (CONTINUE, ids) {
          CONTINUE(o.map(ids, function (id) { return new User({ id : id }); }));
        }
      }
    });
    var dto = fh.newDto();
    dto.populate({
      users : [new User({ id : 1 })]
    });
    var renderer = fh.newRenderer(dto);
    renderer.begin();
    assert.strictEqual(1, renderer.field("users")[0]);
    renderer.end();
  }
};
