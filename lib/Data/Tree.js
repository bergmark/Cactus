Joose.Module("CactusJuice.Data", function (m) {
  var Collection = CactusJuice.Data.Collection;
  var CArray = CactusJuice.Addon.Array;

  Joose.Class("Tree", {
    has : {
      parent : null,
      children : { init : function () { return []; } },
      value : { is : "rw" }
    },
    methods : {
      BUILD : function (value) {
        return {
          value : value
        };
      },
      isRoot : function () {
        return this.parent === null;
      },
      addChild : function (child) {
        this.children.push(child);
        child._setParent(this);
      },
      _setParent : function (parent) {
        this.parent = parent;
      },
      childCount : function () {
        return this.children.length;
      },
      isLeaf : function () {
        return this.children.length === 0;
      },
      getChild : function (i) {
        if (i < 0 || i >= this.children.length) {
          throw new Error("Tree:getChild: Child index out of bounds.");
        }
        return this.children[i];
      },
      hasChild : function (child) {
        return Collection.hasValue(this.children, child);
      },
      removeChild : function (child) {
        if (!this.hasChild(child)) {
          throw new Error("Tree:removeChild: Node does not have child.");
        }
        CArray.remove(this.children, child);
      },
      removeChildByIndex : function (i) {
        if (i < 0 || i >= this.children.length) {
          throw new Error("Tree:removeChildByIndex: Child index out of bounds.");
        }
        this.removeChild(this.getChild(i));
      }
    }
  });
});
