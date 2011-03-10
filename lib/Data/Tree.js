Joose.Module("CactusJuice.Data", function (m) {

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
      }
    }
  });
});
