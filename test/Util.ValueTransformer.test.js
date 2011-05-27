var ValueTransformer = Cactus.Util.ValueTransformer;
module.exports = {
  init : function () {
    assert.ok(ValueTransformer instanceof Function);
  },
  transform : function () {
    var intToString = new ValueTransformer({
      transform : function (v) {
        return "" + v;
      },
      reverse : function (v) {
        return parseInt(v, 10);
      }
    });
    assert.strictEqual("1", intToString.transform(1));
    assert.strictEqual(1, intToString.reverse("1"));
  },
  "allow omission of transformers" : function () {
    var idTransformer = new ValueTransformer();
    equal(1, idTransformer.transform(1));
    equal(1, idTransformer.reverse(1));
  },
  "getting the transformers" : function () {
    function toString() {
      return "" + v;
    }
    function toInt() {
      return parseInt(v, 10);
    }
    var intToString = new ValueTransformer({
      transform : toString,
      reverse : toInt
    });
    equal(toString, intToString.getTransform());
    equal(toInt, intToString.getReverse());
  }
};
