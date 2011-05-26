module.exports = (function () {
  var Options = Cactus.Util.Options;
  var JSON = Cactus.Util.JSON;
  var stringify = JSON.stringify;
  var object = Cactus.Addon.Object;
  var collection = Cactus.Data.Collection;

  var gettype = Options.gettype.bind(Options);

  return {
    "null and undefined" : function () {
      var o = new Options({
        type : "number"
      });
      exception(/Expected "number", but got undefined \(type "undefined"\)/,
                o.parse.bind(o, undefined));
      exception(/Expected "number", but got null \(type "null"\)/,
                o.parse.bind(o, null));
    },
    "required values" : function () {
      var o = new Options({
        required : false,
        type : "boolean"
      });
      equal(true, o.parse(true));
      o.parse(null);

    },
    "default value" : function () {
      var o = new Options({
        type : "number",
        defaultValue : 3
      });
      assert.eql(3, o.parse(null));
      assert.eql(4, o.parse(4));

      o = new Options({
        type : {
          a : {
            type : "number",
            defaultValue : 1
          }
        }
      });
      var h = o.parse({ a : 2 });
      assert.eql(2, o.parse({ a : 2}).a);
      assert.eql(1, o.parse({ a : null }).a);
      assert.eql(1, o.parse({}).a);


      o = new Options({
        type : {
          x : {
            type : "boolean",
            defaultValue : false
          }
        }
      });
      eql({ x : true }, o.parse({ x : true }));
      eql({ x : false }, o.parse({ x : false }));
      eql({ x : false }, o.parse({}));

      // When not passing bool properties.
      o = new Options({
        type : {
          b : { type : "boolean", defaultValue : false }
        }
      });
      eql({ b : false }, o.parse({}));
    },
    "validators" : function () {
      var o = new Options({
        type : "number",
        validators : [{
          func : function (v) {
            return v > 0;
          }
        }]
      });
      o.parse(1);
      assert.throws(o.parse.bind(o,0), /Options: Error: Validation failed: got 0./);


      // Validation error message.
      o = new Options({
        type : "number",
        validators : [{
          func : function (v) {
            return v > 0;
          },
          message : "Expected positive number."
        }]
      });
      o.parse(1);
      exception(/Options: Error: Validation failed: Expected positive number./,
                o.parse.bind(o, 0));

      // Multiple ordered validators.
      o = new Options({
        type : "number",
        validators : [{
          func : function (v) {
            return v > -1;
          },
          message : "Expected number bigger than -1."
        }, {
          func : function (v) {
            return v < 1;
          },
          message : "Expected number smaller than 1."
        }]
      });
      o.parse(0);

      exception(/Expected number bigger than -1/i, o.parse.bind(o, -1));
      exception(/Expected number smaller than 1/i, o.parse.bind(o, 1));

      o = new Options({
        type : "number",
        validators : [{
          func : function (v) {
            return v > 0;
          },
          message : "Expected number bigger than 0."
        }, {
          func : function (v) {
            return v > 1;
          },
          message : "Expected number bigger than 1."
        }]
      });
      o.parse(2);
      exception(/bigger than 0.+ bigger than 1./i, o.parse.bind(o, 0));
    },
    "simple interface" : function () {
      var o = Options.simple("number");
      o.parse(1);
      o = Options.simple(["number"]);
      o.parse([1]);

      o = Options.simple({
        a : "number",
        b : "boolean"
      });
      o.parse({
        a : 1,
        b : true
      });

      o = Options.simple({
        a : ["number"]
      });
      o.parse({
        a : [1]
      });

      o = Options.simple({
        a : {
          b : "boolean"
        }
      });
      o.parse({
        a : {
          b : true
        }
      });

      // Classes.
      Class("X");
      o = Options.simple({ _type : X });
      o.parse(new X());
      o = Options.simple({
        a : { _type : X }
      });
      o.parse({
        a : new X()
      });
    },
    defaultValueFunc : function () {
      var o = new Options({
        defaultValueFunc : function () { return 1; },
        type : "number"
      });
      assert.strictEqual(1, o.parse(null));
      o = new Options({
        type : {
          a : {
            defaultValueFunc : function () { return 2; },
            type : "number"
          }
        }
      });
      assert.strictEqual(2, o.parse({ a : null }).a);
      assert.strictEqual(2, o.parse({}).a);

      // defaultValueFunc return value must match type.
      exception(/expected "boolean", but got 1/i,
                function () {
                  return new Options({
                    defaultValueFunc : function () { return 1; },
                    type : "boolean"
                  }).parse(undefined);
                });
      exception(/expected "boolean", but got 1/i,
                function () {
                  return new Options({
                    type : {
                      a : {
                        defaultValueFunc : function () { return 1; },
                        type : "boolean"
                      }
                    }
                  }).parse({});
                });
    },
    errorHash : function () {
      var o = Options.simple("string");
      o.parse(1, false);
      var errors = o.getErrors();
      eql({ "" : ["Expected \"string\", but got 1 (type \"number\")"] }, o.getErrors());

      o = Options.simple({
        a : "number",
        b : "number"
      });
      o.parse({
        a : "x",
        b : true
      }, false);
      eql({
        a : ['Expected "number", but got "x" (type "string")'],
        b : ['Expected "number", but got true (type "boolean")']
      }, o.getErrors());

      o = new Options({
        type : "number",
        validators : [{
          func : Function.returning(false),
          message : "false"
        }]
      });
      assert.throws(o.parse.bind(o, 1), /Validation failed.+false/i);

      // Errors for array validators.
      o = new Options({
        type : {
          p : {
            type : "string",
            validators : [{
              func : Function.returning(false),
              message : "Error #1."
            }, {
              func : Function.returning(false),
              message : "Error #2."
            }]
          }
        }
      });
      assert.throws(o.parse.bind(o, { p : "" }), /Error #1.+Error #2/);

      // When Error is thrown, there should be a hash property with the error
      // messages as well.
      o = new Options({
        type : "string"
      });
      assert.throws(o.parse.bind(o, 1), function (e) {
        assert.ok(/expected "string".+got 1 \(type "number"\)/i.test(e.message));
        assert.ok("hash" in e, "Missing hash property");
        eql({
          "" : ['Expected "string", but got 1 (type "number")']
        }, e.hash);
        return true
      });
    },
    validators : function () {
      // Validators should run only if all other validations pass.
      var ran = false;
      var o = new Options({
        type : "number",
        defaultValue : 0,
        validators : [{
          func : function (v) {
            ran = true;
            return v === 0;
          },
          message : "Only way to validate is to send null or 0."
        }]
      });

      o.parse(0);
      assert.throws(o.parse.bind(o, "x"), /expected "number".+got "x"/i);

      // Do not run validators if constraints fail.
      o.parse("x", false);
      assert.strictEqual(1, object.count(o.getErrors()));

      assert.throws(o.parse.bind(o, -1), /Validation failed:.+send null or 0/i);

      // Default value should be applied before validation as well.
      ran = false;
      assert.strictEqual(0, o.parse(null));
      assert.ok(ran, "Validation did not run.");
    },
    "predefined validations" : function () {
      var o = new Options({
        type : "number",
        validators : ["natural"]
      });
      o.parse(1);
      o.parse(0);
      assert.throws(o.parse.bind(o,-1), /Expected natural number/i);

      o = new Options({
        type : "number",
        validators : ["positive"]
      });
      o.parse(1);
      assert.throws(o.parse.bind(o, 0), /Expected positive number/i);

      o = new Options({
        type : "number",
        validators : ["negative"]
      });
      o.parse(-1);
      assert.throws(o.parse.bind(o, 0), /Expected negative number/i);

      o = new Options({
        type : "number",
        validators : ["x"]
      });
      assert.throws(o.parse.bind(o, 1),
                   /Undefined built in validator "x"/i);
      o = new Options({
        type : {
          a : {
            type : "number",
            validators : ["x"]
          }
        }
      });
      assert.throws(o.parse.bind(o, { a : 1 }),
                    /Undefined built in validator "x"/i);
      o = new Options({
        type : "string",
        validators : ["non empty string"]
      });
      o.parse("x");
      assert.throws(o.parse.bind(o, ""),
                    /Expected non-empty string/i);
    },
    T_Array : function () {
      eql([{ type : "string" }], gettype(new Options.types.T_Array({ type : "string" })));

      var o = new Options({
        type : [{ type : "number" }]
      });
      eql([1, 2], o.parse([1, 2]));
      eql([], o.parse([]));
      exception(/Expected \[\{"type":"number"\}\], but got "a" \(type "string"\)/i,
                o.parse.bind(o, "a"));
      assert.throws(o.parse.bind(o, ["a"]),
                    /error in property "0": expected "number", but got "a" \(type "string"\)/i);
      exception(/error in property "1": expected "number", but got true \(type "boolean"\)/i, o.parse.bind(o, [1, true]));
      exception(/error in property "0": expected "number", but got "a"[\s\S]+error in property "1": expected "number", but got true/i, o.parse.bind(o, ["a", true]));


      // Nesting of arrays.
      var o = new Options({
        type : [{ type : [{ type : "number" }] }]
      });
      eql([[1, 2]], o.parse([[1, 2]]));
      exception(/^Options: Error in property "0": expected \[\{"type":"number"\}\], but got 1/i,
                o.parse.bind(o, [1, [2, 3]]));
      exception(/^Options: Error in property "1.1": expected "number", but got true/i,
                o.parse.bind(o, [[1], [2, true]]));
      eql([[]], o.parse([[]]));
      eql([], o.parse([]));

      // Optional arrays.
      o = new Options({
        type : [{
          type : "mixed"
        }],
        defaultValue : []
      });
      o.parse(null);

      // Optional array in hash.
      o = new Options({
        type : {
          a : {
            type : [{
              type : "number"
            }],
            defaultValue : []
          }
        }
      });
      o.parse({});
    },
    T_Primitive : function () {
      var o = new Options({
        type : "string"
      });
      assert.eql("aoeu", o.parse("aoeu"));
      exception(/expected "string", but got 1 \(type "number"\)/i, o.parse.bind(o, 1));
      exception(/expected "string", but got true \(type "boolean"\)/i, o.parse.bind(o, true));

      o = new Options({
        type : "number"
      });
      assert.eql(100, o.parse(100));
      exception(/^Options: Error: Expected "number", but got "1" \(type "string"\)$/, o.parse.bind(o, "1"));

      // Default values
      o = new Options({
        type : "boolean",
        defaultValue : false
      });
      o.parse(true);
      o.parse(false);
      not(o.parse(null));
    },
    T_Enumerable : function () {
      var o = new Options({
        enumerable : [1,2,3]
      });
      eql(1, o.parse(1));
      o.parse(2);
      o.parse(3);
      exception(/^Options: Error: Expected a value in \[1,2,3\], but got 0$/, o.parse.bind(o, 0));
      exception(/^Options: Error: Expected a value in \[1,2,3\], but got 4$/, o.parse.bind(o, 4));

      eql({ enumerable : [1,2,3] }, gettype(new Options.types.T_Enumerable([1, 2, 3])));
    },
    "T_Union" : function () {
      var o = new Options({
        union : ["string", "number"]
      });
      eql(1, o.parse(1));
      eql("x", o.parse("x"));
      assert.throws(o.parse.bind(o, true),
                    /Expected a Union/i);
      eql({ union : [
        { type : "string"},
        { type : "number" }
      ]}, gettype(new Options.types.T_Union([
        { type : "string" },
        { type : "number" }
      ])));
    },
    "T_Instance" : function () {
      var Foo2 = Class("Foo2", {});
      Class("Bar", {
        isa : Foo2
      });
      var o = new Options({
        type : Foo2
      });
      var foo2 = new Foo2();
      equal(foo2, o.parse(foo2));
      o.parse(new Bar());
      exception(/Expected an instance of "Foo2", but got value <1> \(type "number"\)/,
                o.parse.bind(o, 1));
      Class("Baz");
      exception(/Expected an instance of "Foo2", but got value <a Baz> \(type "Baz"\)$/,
                o.parse.bind(o, new Baz()));

      // Non-Joose classes.
      function Bax() {

      }
      function Qux() {

      }
      Qux.extend(Bax);
      o = new Options({
        type : Bax
      });
      o.parse(new Bax());
      o.parse(new Qux());
      function Qax() {
      }
      Qax.prototype.toString = function () {
        return "my Qax";
      };
      exception(/Expected an instance of "Bax", but got value <1> \(type "number"\)/,
                o.parse.bind(o, 1));
      exception(/Expected an instance of "Bax", but got value <my Qax> \(type "Qax"\)$/,
                o.parse.bind(o, new Qax()));

      // Anonymous classes.
      var F = function () {};
      var G = function () {};
      o = new Options({
        type : F
      });
      G.extend(F);
      o.parse(new F());
      o.parse(new G());
      var H = function () {};
      H.prototype.toString = Function.returning("my H");
      exception(/Expected an instance of "anonymous type", but got value <1>/,
                o.parse.bind(o, 1));
      exception(/Expected an instance of "anonymous type", but got value <my H> \(type "anonymous type"\)/i,
                o.parse.bind(o, new H()));

      function I() {}
      equal(I, gettype(new Options.types.T_Instance(I)).type);
    },
    T_Hash : function () {
      var o = new Options({ x : { type : "boolean" } });
      eql({ x : { type : "boolean" } }, gettype(new Options.types.T_Hash({ x : { type : "boolean" } })));

      o = new Options({
        type : {
          a : { type : "number" },
          b : { type : "boolean" }
        }
      });
      eql({ a : 1, b : true }, o.parse({ a : 1, b : true }));
      o = new Options({
        type : {
          a : { type : "number" },
          b : { type : "boolean" }
        }
      });
      exception(/Expected \{"a":\{"type":"number"\},"b":\{"type":"boolean"\}\}, but got 1/i,
                o.parse.bind(o, 1));
      exception(/Error in property "a": expected "number", but got "2"/i,
                o.parse.bind(o, { a : "2", b : true }));
      exception(/Error in property "a": expected "number", but got "2"[\s\S]+Error in property "b": expected "boolean", but got "2"/i,
                o.parse.bind(o, { a : "2", b : "2" }));
      exception(/Error in property "b": Missing property/,
                o.parse.bind(o, { a : 1 }));
      exception(/Error in property "c": Property lacks definition/i,
                o.parse.bind(o, { a : 1, b : true, c : "1" }));

      // With required specified.
      o = new Options({
        type : {
          name : { type : "string", required : true }
        }
      });
      assert.throws(o.parse.bind(o, {}), function (e) {
        assert.ok(/"name": Missing property/.test(e.message));
        return true;
      });

      // Non-required properties.
      o = new Options({
        type : {
          a : { type : "number", required : false },
          b : { type : "boolean", required : false }
        }
      });
      eql({ a : 1, b : false },
          o.parse({ a : 1, b : false }));
      var h = o.parse({ a : 1, b : undefined });
      ok(!("b" in h));
      h = o.parse({ a : 1, b : null });
      equal(null, h.b);
      h = o.parse({ a : undefined, b : undefined });
      ok(object.isEmpty(h));
      h = o.parse({});
      ok(object.isEmpty(h));
    },
    T_Map : function () {
      var o = new Options({
        map : true,
        type : "number"
      });
      eql({ a : 1, b : 1 }, o.parse({ a : 1, b : 1 }));
      exception(/Error in property "b": Expected "number", but got false/,
                o.parse.bind(o, { a : 1, b : false }));
    },
    "T_Mixed" : function () {
      var o = new Options({
        type : "mixed"
      });
      equal(true, o.parse(true));
      o.parse("");
      o.parse({});
      eql([], o.parse([]));
      ok(null === o.parse(null));
      ok(undefined === o.parse(undefined));
      equal("mixed", gettype(new Options.types.T_Mixed()));
    },
    "typeof" : function () {
      var t = Options.typeof.bind(Options);
      equal("number", t(1));
      equal("boolean", t(true));
      equal("undefined", t(undefined));
      equal("null", t(null));
      equal("Function", t(function () {}));
      equal("Object", t({}));
      equal("Array", t([]));
      Class("JooseClass");
      equal("JooseClass", t(new JooseClass()));
      function MyClass() {}
      equal("MyClass", t(new MyClass()));
      var AnonymousClass = function () {};
      equal("anonymous type", t(new AnonymousClass));
    },
    "BUILD errors" : function () {
      new Options({});

      // required or defaultValue or defaultValueFunc
    },
    "recursive definition" : function () {
      var o = new Options({
        type : {
          type : {
            required : false,
            type : "mixed",
            validators : [{
              func : function (v) {
                if (typeof v === "string") {
                  return collection.hasValue(["string", "number", "object", "function", "boolean", "mixed"], v);
                } else if (v instanceof Array) {
                  return v.length === 1;
                }
                return false;
              }
            }]
          },
          required : {
            required : false,
            type : "boolean"
          },
          defaultValue : {
            required : false,
            type : "mixed"
          },
          defaultValueFunc : {
            required : false,
            type : Function
          },
          validators : {
            type : [{
              type : {
                func : { type : Function },
                message : { type : "string" }
              }
            }],
            defaultValue : []
          },
          enumerable : {
            required : false,
            type : Array
          }
        }
      });
      o.parse({
        type : "string"
      });
      o.parse({
        type : "number"
      });
      o.parse({
        required : false,
        type : "number"
      });
      o.parse({
        defaultValue : 3,
        type : "number"
      });
      o.parse({
        defaultValue : true,
        type : "boolean"
      });
      o.parse({
        defaultValue : 4,
        type : "mixed"
      });
      o.parse({
        defaultValue : {},
        type : "mixed"
      });
      o.parse({
        defaultValueFunc : function () { return 1; },
        type : "number"
      });
      o.parse({
        type : [{ type : "string" }]
      });
      o.parse({
        type : "mixed",
        validators : [{
          func : Function.empty,
          message : "msg"
        }]
      });
      o.parse({
        type : "number",
        enumerable : [1,2,3]
      });

      // Fails until properties can constrain each other.
      // exception(/./i,
      //           o.parse.bind(o, {}));
    }
  };
})();
