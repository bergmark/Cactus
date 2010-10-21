require('../CactusJuice.js');

module.exports = (function () {
  var Options = CactusJuice.Util.Options;
  var Assertion = CactusJuice.Dev.Assertion;
  var assertException = Assertion.exception.bind(Assertion);
  var JSON = CactusJuice.Util.JSON;
  var stringify = JSON.stringify;

  var jsoneq = function (assert, a, b) {
    return assert.eql(JSON.stringify(a), JSON.stringify(b));
  };

  return {
    a : function (assert) {
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
      exception(/error in property "0.": expected "number", but got "string"/i, o.parse.bind(o, ["a"]));
      exception(/error in property "1.": expected "number", but got "boolean"/i, o.parse.bind(o, [1, true]));
      exception(/error in property "0.": expected "number", but got "string"[\s\S]+error in property "1.": expected "number", but got "boolean"/i, o.parse.bind(o, ["a", true]));

      // Nesting of arrays.
      o = new Options({
        type : [{ type : [{ type : "number" }] }]
      });
      jsoneq(assert, [[1, 2]], o.parse([[1, 2]]));
      exception(/^Options: Error in property "0.": expected \[\{"type":"number"\}\], but got "number"$/i,
                o.parse.bind(o, [1, [2, 3]]));
      exception(/^Options: Error in property "1.1.": expected "number", but got "boolean"$/i,
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
      exception(/^Options: Error in property "a.": expected "number", but got "string"$/i,
                o.parse.bind(o, { a : "2", b : true }));
      exception(/^Options: Error in property "a.": expected "number", but got "string"[\s\S]Options: Error in property "b.": expected "boolean", but got "string"$/i,
                o.parse.bind(o, { a : "2", b : "2" }));
      exception(/^Options: Error in property "b": Missing property$/,
                o.parse.bind(o, { a : 1 }));
      exception(/^Options: Error in property "c": Property lacks definition$/i,
                o.parse.bind(o, { a : 1, b : true, c : "1" }));
    },
    map : function (assert) {
      var exception = assertException.curry(assert);
      var o = new Options({
        map : true,
        type : "number"
      });
      jsoneq(assert, { a : 1, b : 1 }, o.parse({ a : 1, b : 1}));
      exception(/^Options: Error in property "b.": Expected "number", but got "boolean"$/,
                o.parse.bind(o, { a : 1, b : false }));
    }
  };
})();
