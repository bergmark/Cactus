var DtoFactory = Cactus.Application.DtoFactory;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;
var object = Cactus.Addon.Object;

var fh = new DtoFactory({
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
    ({
      name : "test",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    }).should.eql(dto.get());

    // Can't get if required values are missing.
    dto = fh.newDto();
    dto.populate({});
    assert.throws(dto.get.bind(dto), function (e) {
      assert.ok(/"name": Missing property/.test(e.message));
      assert.ok(/"password": Missing property/.test(e.message));
      assert.ok(/"email": Missing property/.test(e.message));
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
    ({
      name : "test2",
      email : "test@example.com",
      password : "pass",
      passwordConfirmation : "pass"
    }).should.eql(dto.get());

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
  "validation errors" : function (done) {
    var fh = new DtoFactory({
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
    ({
      name : ["Missing property"],
      email : ["Missing property"],
      password : ["Missing property"]
    }).should.eql(dto.getErrors());

    // Validators.
    dto = fh.newDto();
    dto.populate({
      name : "",
      email : "",
      password : ""
    });
    ({ name : ["Validation failed: At least 5 characters."] }).should.eql(dto.getErrors());

    // Validation of entire structure.
    var df = new DtoFactory({
      a : { type : "string", required : false },
      b : { type : "string", required : false },
      __validators : [{
        func : function (v) {
          return !!v.a || !!v.b;
        },
        message : "a or b 1"
      }]
    });
    dto = df.newDto();
    dto.reversePopulate({ a : "x" }).then(function () {
      dto.get();
      dto = df.newDto();
      dto.reversePopulate({}).now();
    }).then(function () {
      assert.throws(dto.get.bind(dto), /a or b/i);
      // should get defaultValues etc.
      var o = {};
      df = new DtoFactory({
        a : { type : "string", required : false },
        b : { type : "string", required : false },
        __validators : [{
          func : function (v) {
            o.hash = v;
            return !!v.a || !!v.b;
          },
          message : "a or b 2"
        }]
      });
      dto = df.newDto();
      dto.reversePopulate({}).then(function () {
        this.CONTINUE(o);
      }).now();
    }).then(function (o) {
      try { dto.get(); } catch (e) { }
      ({}).should.eql(o.hash);
      done();
    }).now();
  },
  globalValidation : function (done) {
    var fh = new DtoFactory({
      name : { type : "string" },
      __validators : [{
        func : function (v, helpers) {
          return helpers.ok;
        },
        message : "bad"
      }]
    });
    var dto = fh.newDto();
    dto.reversePopulate({ name : "x" }).then(function () {
      dto.get({ ok : true });
      assert.throws(dto.get.bind(dto, { ok : false }),
                    /validation failed: bad/i);
      done();
    }).now();
  },
  valueTransformers : function (done) {
    var user = {
      id : 1
    };
    var fh = new DtoFactory({
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
    ({
      user : {
        id : 1
      }
    }).should.eql(dto.get());

    dto = fh.newDto();
    dto.reversePopulate({
      user : 1
    }).then(function () {
      assert.ok(dto._values.user instanceof Object);
      assert.strictEqual(1, dto.getWithDefault("user"));
      user.should.eql(dto.get().user);

      // Reverse populating with undefined fields.
      dto.reversePopulate({
        undef : "undef"
      }).now();
    }).then(function () {
      assert.throws(dto.get.bind(dto), /"undef".+lacks definition/i);
      done();
    }).now();
  },
  "default value transformers" : function (done) {
    var fh = new DtoFactory({
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
    var fh = new DtoFactory({
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
    var User = Class({
      has : {
        id : null
      }
    });
    var fh = new DtoFactory({
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
  },
  "remove undefined fields" : function (done) {
    var df = new DtoFactory({
      name : {
        type : "string",
        required : false,
        outTransformerCont : function (CONT, s) { CONT(s === "" ? undefined : s); }
      }
    });
    var dto = df.newDto();
    dto.reversePopulate({ name : "x" }).then(function () {
      dto.get().should.property("name");
      "x".should.equal(dto.get().name);

      dto = df.newDto();
      dto.reversePopulate({ name : "" }).now();
    }).then(function () {
      dto.get().should.not.property("name");
      done();
    }).now();
  },
  "default value for dto factories" : function () {
    var df = new DtoFactory({
      name : {
        type : "string",
        defaultValue : "adam"
      }
    });
    var dto = df.newDto();
    ({ name : "adam" }).should.eql(dto.get());
    // Should be default value for getWithDefault.
    dto = df.newDto();
    "adam".should.eql(dto.getWithDefault("name"));
  }
};
