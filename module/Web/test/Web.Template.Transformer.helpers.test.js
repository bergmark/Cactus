module.exports = {
  createSelect : function () {
    var O = Class({
      does : KVC,
      has : { x : 1, y : 2 }
    });
    var o = new O();
    var def = TTransformer.createSelect("root", "x", "y");
    eql({ value : 1, text : 2 }, def.forward(o));
  }
};
