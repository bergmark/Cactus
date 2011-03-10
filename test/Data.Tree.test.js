var Joose = require('Joose');
require('../CactusJuice.js');

module.exports = (function () {
  var Tree = CactusJuice.Data.Tree;

  return {
    structural : function (assert) {
      var root = new Tree();
      assert.ok(root.isRoot());
      var childA = new Tree();
      assert.ok(childA.isRoot());
      root.addChild(childA);
      assert.ok(root.isRoot());
      assert.ok(!childA.isRoot());
      assert.strictEqual(1, root.childCount());

      assert.ok(!root.isLeaf());
      assert.ok(childA.isLeaf());

      var childAA = new Tree();
      childA.addChild(childAA);
      assert.ok(!childA.isRoot());
      assert.ok(!childA.isLeaf());
      assert.ok(childAA.isLeaf());
    },
    values : function (assert) {
      var root = new Tree("root");
      assert.strictEqual("root", root.getValue());
      root.setValue("new val");
      assert.strictEqual("new val", root.getValue());
    }
  };
})();
