module.exports = (function () {
  var JSON = Cactus.Util.JSON;
  return {
    test : function () {
      assert.eql('"aoeu"', JSON.stringify("aoeu"));
      assert.eql("1", JSON.stringify(1));
      assert.eql('"[1,2,\'3\']"', JSON.stringify("[1,2,'3']"));
    }
  };
})();
