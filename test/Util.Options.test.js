require('../CactusJuice.js');

module.exports = (function () {
  var Options = CactusJuice.Util.Options;
  var Assertion = CactusJuice.Dev.Assertion;
  var assertException = Assertion.exception.bind(Assertion);
  var JSON = CactusJuice.Util.JSON;
  var stringify = JSON.stringify;

  return {
    a : function (assert) {
      var exception = assertException.curry(assert);
      var o = new Options({
        type : "string"
      });
      assert.eql("aoeu", o.parse("aoeu"));
      exception(/expected string, but got number/i, o.parse.bind(o, 1));
      exception(/expected string, but got boolean/i, o.parse.bind(o, true));

      o = new Options({
        type : "number"
      });
      assert.eql(100, o.parse(100));
      exception(/expected number, but got string/i, o.parse.bind(o, "1"));

      o = new Options({
        type : ["number"]
      });
      assert.eql(JSON.stringify([1, 2]), JSON.stringify(o.parse([1, 2])));
    }
  };
})();
