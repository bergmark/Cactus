module.exports = (function () {
  var Tree = Cactus.Data.Tree;
  var CObject = Cactus.Addon.Object;

  return {
    structural : function () {
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
    values : function () {
      var root = new Tree("root");
      assert.strictEqual("root", root.getValue());
      root.setValue("new val");
      assert.strictEqual("new val", root.getValue());
    },
    getChild : function () {
      var root = new Tree();
      var childA = new Tree();
      var childB = new Tree();
      root.addChild(childA);
      root.addChild(childB);
      assert.strictEqual(childA, root.getChild(0));
      assert.strictEqual(childB, root.getChild(1));
      exception(/Tree:getChild:.+index out of bounds/i, CObject.bound(root, "getChild", 2));
      exception(/Tree:getChild:.+index out of bounds/i, CObject.bound(root, "getChild", -1));
      exception(/Tree:getChild:.+index out of bounds/i, CObject.bound(childA, "getChild", 0));
    },
    hasChild : function () {
      var root = new Tree();
      var childA = new Tree();
      var childB = new Tree();
      root.addChild(childA);
      root.addChild(childB);
      assert.ok(root.hasChild(childA));
      assert.ok(root.hasChild(childB));
      assert.ok(!root.hasChild(root));
      assert.ok(!childA.hasChild(root));
    },
    removeChild : function () {
      var root = new Tree();
      var childA = new Tree();
      var childB = new Tree();
      root.addChild(childA);
      root.addChild(childB);
      assert.strictEqual(2, root.childCount());
      root.removeChild(childA);
      assert.strictEqual(1, root.childCount());
      root.removeChild(childB);
      assert.strictEqual(0, root.childCount());

      exception(/Tree:removeChild: Node does not have child/i,
                CObject.bound(root, "removeChild", childA));
    },
    removeChildByIndex : function () {
      var root = new Tree();
      var childA = new Tree();
      var childB = new Tree();
      root.addChild(childA);
      root.addChild(childB);
      root.removeChildByIndex(1);
      root.removeChildByIndex(0);
      exception(/Tree:removeChildByIndex:.+index out of bounds./i,
                CObject.bound(root, "removeChildByIndex", 0));
    }
  };
})();
