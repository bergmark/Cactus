require('../CactusJuice.js');

module.exports = (function () {
  var Options = CactusJuice.Util.Options;
  var Assertion = CactusJuice.Dev.Assertion;
  var assertException = Assertion.exception.bind(Assertion);
  var JSON = CactusJuice.Util.JSON;
  var stringify = JSON.stringify;

  // Shorthand for creating an option.
  var cOptions = function (h) {
    return function () {
      return new Options(h);
    };
  };

  return {

    "a" : function (assert) {
      var exception = assertException.curry(assert);
      var o;
      var r;

      exception(/did not specify type/i, cOptions(undefined));
      exception(/did not specify type/i, cOptions({}));

      // Test default settings for Options itself.
      var o = new Options({ type : { a : {} } });
      assert.ok(o.definition.type.a.required);
      assert.ok(!o.definition.type.a.coerce);
      assert.eql("mixed", o.definition.type.a.type);

      o = new Options({ type : { a : { type : "boolean" } } });
      assert.ok(o.parse({ a : true }).a);
      assert.ok(!o.parse({ a : false }).a);
      exception(/Missing required property/i, o.parse.bind(o, {}));
      exception(/Expected/i, o.parse.bind(o, { a : 1 }));
      // Allow any type if type is omitted.
      assert.ok(new Options({ type : { a : {} } }).parse({ a : true }).a);


      // Coerces the a property into a boolean.
      o = new Options({ type : { a : { type : "boolean", coerce : true }}});
      // Cannot coerce if no type is specified.
      exception(/Cannot coerce/i, function () {
        new Options({ type : { a : { coerce : true }}});
      });
      // Cannot coerce if type is mixed.
      exception(/Cannot coerce/i, function () {
        new Options({ type : { a : { coerce : true, type : "mixed" }}});
      });

      assert.ok(o.parse({ a : true }).a);
      assert.ok(o.parse({ a : 1 }).a);
      assert.ok(!o.parse({ a : null }).a);
      // a is required, even though it coerces its values.
      exception(/Missing required property/i, o.parse.bind(o, {}));

      // instanceof type checks.
      function A() {}
      function B() {}
      B.extend(A);
      var a = new A();
      var b = new B();
      o = new Options({ type : { a : { type : A }}});
      assert.eql(a, o.parse({ a : a }).a);
      assert.eql(b, o.parse({ a : b }).a);

      // Invalid constraint type.
      exception(/"a".+Invalid type constraint for/i, function () {
        new Options({ type : { a : null } });
      });
      // Unknown type.
      exception(/"a".+Invalid type/i, function () {
        new Options({ type : { a : { type : "x" } } });
      });
      // Nested types.
      var o = new Options({
        type : { a : { type : { b : { type : "boolean" } } } }
      });
      assert.eql(stringify({ a : { b : true } }),
                       stringify(o.parse({ a : { b : true } })));
      // Throw nested option errors while outer option is created.
      exception(/"a.b".+Invalid type.+null/i,
                           cOptions({ type : { a : { type : { b : { type : null } } } } }));
      // Second argument to constructor should prevent errors from being thrown.
      var o = new Options({ type : { a : { type : "x" } } }, false);
      assert.ok(o.hasErrors(), "Has no errors.");
      assert.eql(1, o.getErrors().length);
      assert.ok(/"a".+Invalid type/.test(o.getErrorMessages()[0]), "Did not match");
      // Parse to show as many errors as possible, do not halt after the
      // first error.
      exception(/"a".+Invalid type[\s\S]+"b".+Invalid type/i,
                           cOptions({ type : { a : null, b : null } }));
      exception(/"a.b".+Invalid type[\s\S]+"c".+Invalid type/i,
                           cOptions({ type : { a : { type : { b : { type : null } } },
                                               c : null } }));
      // If an error occurs in a nested property on the initial pass,
      // the complete path should be in the error message.
      exception(/"a.b".+invalid type/i,
                           cOptions({ type : { a : { type : { b : { type : null }}}}}));
      // Parsing should use ErrorMessage to show all errors.
      var o = new Options({ type : { a : { type : "boolean" }, b : { type : "boolean" }}});
      exception(/"a".+expected type boolean[\s\S]+"b".+missing required property/i,
                           o.parse.bind(o, { a : 1 }));
      // Sub errors.
      var o = new Options({ type : { a : { type : { b : { type : "boolean" } } }, c : { type : "boolean" }}});
      exception(/"a.b".+expected type boolean[\s\S]+"c".+expected type boolean/i,
                           o.parse.bind(o, { a : { b : 1 }, c : 2 }));

      // Parsing for arrays.
      var o = new Options({ type : { a : { type : ["boolean"] } }});
      o.parse({ a : [true, false] });
      o.parse({ a : [] });
      exception(/"a".+expected type \["boolean"\] but got type \["number"\]/i,
                           o.parse.bind(o, { a : [1] }));
      exception(/"a".+expected type \["boolean"\] but got type boolean/i,
                           o.parse.bind(o, { a : true }));
      exception(/"a".+expected type \["boolean"\] but got type \["mixed"\]/i,
                           o.parse.bind(o, { a : [true, 1] }));

      // Don't fail on optional keys.
      var options = new Options({
        type : {
          classNameConditions : {
            required : false,
            type : [{
              keyPath : { type : "string" },
              className : { type : "string" }
            }]
          }
        }
      });
      var res = options.parse(undefined);
      assert.eql(stringify({}), stringify(res));
      // Provide default values.
      var options = new Options({
        type : { a : {
          required : false,
          type : ["boolean"],
          defaultValue : []
        }}
      });
      assert.eql(stringify({ a : [] }), stringify(options.parse(undefined)));
      // defaultValue should imply required : false.
      var options = new Options({
        type : {
            a : {
              defaultValue : [],
              type : ["boolean"]
            }
        }
      });
      assert.eql(stringify({ a : [] }), stringify(options.parse(undefined)));

      // Throw error if unspecified field is passed.
      options = new Options({ type : { x : { type : "mixed" }}});
      exception(/"a".+lacks def[\s\S]+"b".+lacks def/i,
                           options.parse.bind(options, { a : true, b : true }));
      // Nested compound option definitions in Arrays.
      options = new Options({
        type : {
          x : {
            required : false,
            type : [{
              y : { type : "boolean" }
            }]
          }
        }
      });
      options.parse({
        x : [{
          y : true
        }]
      });
      options = new Options({
        type : {
          x : {
            required : false,
            defaultValue : [],
            type : [{
              y : { type : "boolean" }
            }]
          }
        }
        });
      assert.eql(stringify({ x : [] }), stringify(options.parse({})));

      // Add string type.
      o = new Options({ type : { x : { type : "string", coerce : true }}});
      o.parse({ x : "x" });
      // Coercion for strings.
      assert.eql("1", o.parse({ x : 1 }).x);

      // Add number type.
      o = new Options({ type : { x : { type : "number", coerce : true }}});
      o.parse({ x : 1 });
      // Coercion for numbers.
      assert.eql(1, o.parse({ x : "1"}).x);
      // Always use base 10.
      assert.eql(10, o.parse({ x : "010"}).x);

      // Invalid type signature, should be { type : ["boolean"] }.
      exception(/"x.type".+expected Hash/, cOptions({
        type : {
          x : {
            type : [{
              type : "boolean"
            }]
          }
        }
      }));

    },
    "map type" : function (assert) {
      var exception = assertException.curry(assert);

      // Map of hashes.
      var o = new Options({
        map : true,
        type : {
          b : { type : "number" },
          c : { type : "boolean" }
        }
      });
      var res = o.parse({
        x : { b : 1, c : true },
        y : { b : 2, c : false }
      });
      assert.deepEqual({
        x : { b : 1, c : true },
        y : { b : 2, c : false }
      }, res);

      // Pass invalid args as map value.
      exception(/"x".+expected an object/i, o.parse.bind(o, { x : 3 }));

      // Pass non-map as arg.
      exception(/not an object/i, o.parse.bind(o, 3));
    }
  };
})();
