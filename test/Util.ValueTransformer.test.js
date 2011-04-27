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
  }
};
