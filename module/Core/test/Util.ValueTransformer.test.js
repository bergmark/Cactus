var ValueTransformer = Cactus.Util.ValueTransformer;
module.exports = {
  init : function () {
    assert.ok(ValueTransformer instanceof Function);
  },
  transform : function () {
    var intToString = new ValueTransformer({
      forward : function (v) {
        return "" + v;
      },
      backward : function (v) {
        return parseInt(v, 10);
      }
    });
    assert.strictEqual("1", intToString.forward(1));
    assert.strictEqual(1, intToString.backward("1"));
  },
  "allow omission of transformers" : function () {
    var idTransformer = new ValueTransformer();
    equal(1, idTransformer.forward(1));
    equal(1, idTransformer.backward(1));
  },
  "getting the transformers" : function () {
    function toString() {
      return "" + v;
    }
    function toInt() {
      return parseInt(v, 10);
    }
    var intToString = new ValueTransformer({
      forward : toString,
      backward : toInt
    });
    equal(toString, intToString.getForward());
    equal(toInt, intToString.getBackward());
  }
};
