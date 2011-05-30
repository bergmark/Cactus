/**
 * @file
 *
 * Basic Tree data type.
 */
Module("Cactus.Data", function (m) {
  var Collection = Cactus.Data.Collection;
  var CArray = Cactus.Addon.Array;

  Class("Tree", {
    has : {
      /**
       * @type Tree
       *   May be null.
       */
      parent : null,
      /**
       * @type Array<Tree>
       */
      children : { init : function () { return []; } },
      /**
       * @type mixed
       *   May be null.
       */
      value : { is : "rw" }
    },
    methods : {
      /**
       * @param mixed value
       */
      BUILD : function (value) {
        return {
          value : value
        };
      },
      /**
       * @return boolean
       */
      isRoot : function () {
        return this.parent === null;
      },
      /**
       * @param Tree child
       */
      addChild : function (child) {
        this.children.push(child);
        child._setParent(this);
      },
      /**
       * @param Tree parent
       */
      _setParent : function (parent) {
        this.parent = parent;
      },
      /**
       * @return natural
       */
      childCount : function () {
        return this.children.length;
      },
      /**
       * @type boolean
       */
      isLeaf : function () {
        return this.children.length === 0;
      },
      /**
       * @param natural i
       */
      getChild : function (i) {
        if (i < 0 || i >= this.children.length) {
          throw new Error("Tree:getChild: Child index out of bounds.");
        }
        return this.children[i];
      },
      /**
       * @param Tree child
       * @return boolean
       */
      hasChild : function (child) {
        return Collection.hasValue(this.children, child);
      },
      /**
       * Throws an error if the Tree does not have the specified child.
       *
       * @param Tree child
       */
      removeChild : function (child) {
        if (!this.hasChild(child)) {
          throw new Error("Tree:removeChild: Node does not have child.");
        }
        CArray.remove(this.children, child);
      },
      /**
       * @param natural i
       */
      removeChildByIndex : function (i) {
        if (i < 0 || i >= this.children.length) {
          throw new Error("Tree:removeChildByIndex: Child index out of bounds.");
        }
        this.removeChild(this.getChild(i));
      }
    }
  });
});
