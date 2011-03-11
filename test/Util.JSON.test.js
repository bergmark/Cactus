module.exports = (function () {
  var JSON = CactusJuice.Util.JSON;
  return {
    test : function (assert) {
      assert.eql('"aoeu"', JSON.stringify("aoeu"));
      assert.eql("1", JSON.stringify(1));
      assert.eql('"[1,2,\'3\']"', JSON.stringify("[1,2,'3']"));
    }
  };
})();
