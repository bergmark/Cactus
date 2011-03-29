module.exports = (function () {
  var Pair = Cactus.Data.Pair;
  var assertException = Cactus.Dev.Assertion.exception;
  return {
    test : function () {
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
    },
    toHash : function () {
      var p = new Pair(1, 2);
      var h = p.toHash();
      assert.eql(1, h.first);
      assert.eql(2, h.second);
    }
  };
})();
