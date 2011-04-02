module.exports = (function () {
  var Options = Cactus.Util.Options;
  var Assertion = Cactus.Dev.Assertion;
  var assertException = Assertion.exception.bind(Assertion);
  var JSON = Cactus.Util.JSON;
  var stringify = JSON.stringify;
  var object = Cactus.Addon.Object;
  var collection = Cactus.Data.Collection;

  var jsoneq = function (assert, a, b) {
    return assert.eql(JSON.stringify(a), JSON.stringify(b));
  };

  return {
    "recursive definition" : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        type : {
          type : {
            required : false,
            validator : function (v) {
              if (typeof v === "string") {
                return collection.hasValue(["string", "number", "object", "function", "boolean", "mixed"], v);
              } else if (v instanceof Array) {
                return v.length === 1;
              }
              return false;
            }
          },
          required : {
            required : false,
            type : "boolean"
          },
          defaultValue : {
            required : false,
            // Hack to allow any value until mixed values are implemented.
            // Will then be `type : "mixed"` instead.
            validator : function (v) {
              return true;
            }
          },
          validator : {
            required : false,
            type : Function
          },
          enumerable : {
            required : false,
            validator : function (v) {
              return v instanceof Array;
            }
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
        type : [{ type : "string" }]
      });
      o.parse({
        validator : Function.empty
      });
      o.parse({
        enumerable : [1,2,3]
      });

      // Fails until properties can constrain each other.
      // exception(/./i,
      //           o.parse.bind(o, {}));
    },

    a : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        type : "string"
      });
      assert.eql("aoeu", o.parse("aoeu"));
      exception(/expected "string", but got "number"/i, o.parse.bind(o, 1));
      exception(/expected "string", but got "boolean"/i, o.parse.bind(o, true));

      o = new Options({
        type : "number"
      });
      assert.eql(100, o.parse(100));
      exception(/^Options: Error: Expected "number", but got "string"$/, o.parse.bind(o, "1"));

      o = new Options({
        type : [{ type : "number"}]
      });
      jsoneq(assert, [1, 2], o.parse([1, 2]));
      jsoneq(assert, [], o.parse([]));
      exception(/^Options: Error: Expected \[\{"type":"number"\}\], but got "string"$/i, o.parse.bind(o, "a"));
      exception(/error in property "0": expected "number", but got "string"/i, o.parse.bind(o, ["a"]));
      exception(/error in property "1": expected "number", but got "boolean"/i, o.parse.bind(o, [1, true]));
      exception(/error in property "0": expected "number", but got "string"[\s\S]+error in property "1": expected "number", but got "boolean"/i, o.parse.bind(o, ["a", true]));

      // Nesting of arrays.
      o = new Options({
        type : [{ type : [{ type : "number" }] }]
      });
      jsoneq(assert, [[1, 2]], o.parse([[1, 2]]));
      exception(/^Options: Error in property "0": expected \[\{"type":"number"\}\], but got "number"$/i,
                o.parse.bind(o, [1, [2, 3]]));
      exception(/^Options: Error in property "1.1": expected "number", but got "boolean"$/i,
                o.parse.bind(o, [[1], [2, true]]));
      jsoneq(assert, [[]], o.parse([[]]));
      jsoneq(assert, [], o.parse([]));

      // Hashes.
      o = new Options({
        type : {
          a : { type : "number" },
          b : { type : "boolean" }
        }
      });
      jsoneq(assert, { a : 1, b : true }, o.parse({ a : 1, b : true }));
      exception(/^Options: Error: Expected \{"a":\{"type":"number"\},"b":\{"type":"boolean"\}\}, but got "number"/i,
                o.parse.bind(o, 1));
      exception(/^Options: Error in property "a": expected "number", but got "string"$/i,
                o.parse.bind(o, { a : "2", b : true }));
      exception(/^Options: Error in property "a": expected "number", but got "string"[\s\S]Options: Error in property "b": expected "boolean", but got "string"$/i,
                o.parse.bind(o, { a : "2", b : "2" }));
      exception(/^Options: Error in property "b": Missing property$/,
                o.parse.bind(o, { a : 1 }));
      exception(/^Options: Error in property "c": Property lacks definition$/i,
                o.parse.bind(o, { a : 1, b : true, c : "1" }));
    },
    map : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        map : true,
        type : "number"
      });
      jsoneq(assert, { a : 1, b : 1 }, o.parse({ a : 1, b : 1}));
      exception(/^Options: Error in property "b": Expected "number", but got "boolean"$/,
                o.parse.bind(o, { a : 1, b : false }));
    },
    "instanceof checks" : function () {
      var exception = assertException.curry(assert);
      var Foo2 = Class("Foo2", {});
      Class("Bar", {
        isa : Foo2
      });
      var o = new Options({
        type : Foo2
      });
      o.parse(new Foo2());
      o.parse(new Bar());
      exception(/^Options: Error: Expected "Foo2", but got "number"$/,
                o.parse.bind(o, 1));
      Class("Baz");
      exception(/^Options: Error: Expected "Foo2", but got "Baz"$/,
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
      exception(/^Options: Error: Expected "Bax", but got "number"$/,
                o.parse.bind(o, 1));
      exception(/^Options: Error: Expected "Bax", but got "Qax"$/,
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
      exception(/^Options: Error: Expected "Anonymous constructor", but got "number"$/,
                o.parse.bind(o, 1));
      exception(/^Options: Error: Expected "Anonymous constructor", but got "Anonymous constructor"$/,
                o.parse.bind(o, new H()));
    },
    "null and undefined" : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        type : "number"
      });
      exception(/^Options: Error: Expected "number", but got "undefined"$/,
                o.parse.bind(o, undefined));
      exception(/^Options: Error: Expected "number", but got "null"$/,
                o.parse.bind(o, null));
    },
    "required values" : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        required : false,
        type : "boolean"
      });
      o.parse(true);
      // undefined not allowed for atomic values.
      exception(/Options: Error: undefined is not an allowed atomic value./i,
                o.parse.bind(o, undefined));
      o.parse(null);

      // Hash with non-required properties.
      o = new Options({
        type : {
          a : { type : "number", required : false },
          b : { type : "boolean", required : false }
        }
      });
      jsoneq(assert, { a : 1, b : false },
             o.parse({ a : 1, b : false }));
      var h = o.parse({ a : 1, b : undefined });
      assert.ok(!("b" in h));
      h = o.parse({ a : 1, b : null });
      assert.eql(null, h.b);
      h = o.parse({ a : undefined, b : undefined });
      assert.ok(object.isEmpty(h));
      h = o.parse({});
      assert.ok(object.isEmpty(h));
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
    },
    "enums" : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        enumerable : [1,2,3]
      });
      o.parse(1);
      o.parse(2);
      o.parse(3);
      exception(/^Options: Error: Expected a value in \[1,2,3\], but got 0$/, o.parse.bind(o, 0));
      exception(/^Options: Error: Expected a value in \[1,2,3\], but got 4$/, o.parse.bind(o, 4));
    },
    "validators" : function () {
      var exception = assertException.curry(assert);
      var o = new Options({
        validator : function (v) {
          return v > 0;
        }
      });
      o.parse(1);
      exception(/^Options: Error: Validation failed, got 0. $/,
               o.parse.bind(o, 0));

      // Validation error message.
      o = new Options({
        validator : function (v) {
          return v > 0;
        },
        validationMessage : "Expected positive number."
      });
      o.parse(1);
      exception(/^Options: Error: Validation failed, got 0. Expected positive number.$/,
                o.parse.bind(o, 0));
    },
    "mixed values" : function () {
      var o = new Options({
        type : "mixed"
      });
      o.parse(true);
      o.parse(null);
      o.parse("");
      o.parse({});
      o.parse([]);
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
    }
  };
})();
