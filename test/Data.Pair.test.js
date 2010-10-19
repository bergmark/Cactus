require('../CactusJuice.js');

module.exports = (function () {
  var Pair = CactusJuice.Data.Pair;
  var assertException = CactusJuice.Dev.Assertion.exception;
  return {
    test : function (assert) {
      var p = new Pair(1, 2);
      assert.eql(1, p.getFirst());
      assert.eql(2, p.getSecond());

      assert.ok(p.equals(new Pair(1,2)));
      assert.ok(!(p.equals(new Pair(1,3))));

      assert.ok(p.equals(new Pair(1,3).changeSecond(2)));
      assert.ok(p.equals(new Pair(3,2).changeFirst(1)));
      p.changeFirst(3);
      assert.eql(1, p.getFirst());
      p.changeSecond(4);
      assert.eql(2, p.getSecond());
    }
  };
})();
