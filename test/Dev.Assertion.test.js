module.exports = (function () {
  var Assertion = Cactus.Dev.Assertion;
  return {
    // assertException, passing an Error constructor as the argument.
    "assertException constructor" : function () {
        var pred = null;
      var msg = null;

        var myAssert = {
          ok : function (_pred, _msg) {
            pred = _pred;
            msg = _msg;
          }
        };

      Assertion.exception(myAssert, Error, function () {
        throw new Error("foo");
      });
      assert.ok(pred);
    },

    // assertException should be able to take a regex to match the error message
    // as its first argument, instead of an Error constructor.
    "assertException regex" : function () {
        var pred = null;
      var msg = null;

      var myAssert = {
        ok : function (_pred, _msg) {
          pred = _pred;
          msg = _msg;
        }
      };

      Assertion.exception(myAssert, /bar/, function () {
        throw new Error("foobarbaz");
      });
      assert.ok(pred);

      Assertion.exception(myAssert, /qux/, function () {
        throw new Error("foobarbaz");
      });
      assert.ok(!pred);
    }
  };
})();