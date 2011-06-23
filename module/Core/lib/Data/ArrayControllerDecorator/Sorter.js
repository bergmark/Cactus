/**
 * @file
 * A decorator for sorting the contents of an array. Sorter
 * uses a comparator (function returning -1, 0, 1 depending on whether the
 * first argument is less than, equal to, or larger than the second argument).
 *
 * Initially the built-in sorting function is used. On later modifications--
 * insertion sort. Sorter needs O(n) swaps to add and remove elements from the
 * list, meaning as many onSwap events will be passed out, if this turns out
 * to be too inefficient a system for coordinating groups of changes may be
 * implemented, and can in that case be used by all decorators.
 */
Module("Cactus.Data.ArrayControllerDecorator", function (m) {
  var ACD = m;
  var AC = Cactus.Data.ArrayController;

  Class("Sorter", {
    isa : ACD,
    has : {
      /**
       * @type Function
       *   See constructor documentation for exact type definition.
       */
      comparator : { init : function () { return Function.empty; }}
    },
    methods : {
      /**
       * @param ArrayController component
       * @param Function comparator
       *        @param X
       *        @param X
       *        @return int
       *          in [-1, 0, 1]
       *      where X is the type of any object that may occur in the component.
       *   The function to use for comparing elements when sorting.
       */
      BUILD : function (component, comparator) {
        var h = this.SUPER(component);
        h.comparator = comparator;
        return h;
      },
      /**
       * @type Function comparator
       */
      setComparator : function (comparator) {
        this.comparator = comparator;
        this._setObjects();
      },
      /**
       *
       */
      _setObjects : function () {
        this.objects = this.component.getRange().sort(this.comparator);
        this.onRearranged();
      },
      /**
       * It makes no sense to try to swap elements in a sorted list, so an
       * error will be thrown if it's attempted.
       */
      swap : function () {
        throw new Error("Cannot swap elements in a sorted list.");
      },
      /**
       * @param ArrayController component
       * @param natural index
       */
      onAddedTriggered : function (component, addedObject, index) {

        // Insert as the last element.
        AC.prototype.add.call(this, addedObject);

        // Loop backwards, swapping until the element lands where it
        // belongs.
        // `i` starts at the 2nd to last element since the last one is the
        // one just added.
        for (var i = this.size() - 2; i >= 0; i--) {
          var comparison = this.comparator(addedObject, this.objects[i]);
          if (comparison === 0) {
            // The element is equal to the one to the left, so it might
            // as well stay put.
            break;
          } else if (comparison === -1) {
            // The element is less than the one to the left, it has to
            // be swapped further.
            AC.prototype.swap.call(this, i + 1, i);
          } else {
            // The element is larger than the one to the left. It's in
            // the right position.
            break;
          }
        }
      },
      onRemovedTriggered : function () {
        this.SUPERARG(arguments);
      },
      /**
       * Component swapping does not affect sorting.
       */
      onSwappedTriggered : Function.empty,
      onReplacedTriggered : function (component, componentIndex, oldObject, newObject) {
        // Replace the old object with the new one.
        AC.prototype.replace.call(this, oldObject, newObject);

        var index = this.indexOf(newObject);

        var that = this;

        // Shorthands for making comparisons.
        function lt(a, b) {
          return that.comparator(a, b) === -1;
        }
        function gt(a, b) {
          return that.comparator(a, b) === 1;
        }

        var swap = AC.prototype.swap.bind(this);

        var previous;
        var next;
        var hasNext;
        var hasPrevious;

        function setPrevious() {
          hasPrevious = index > 0;
          previous = hasPrevious ? that.get(index - 1) : null;
        }
        function setNext() {
          hasNext = index < that.size() - 1;
          next = hasNext ? that.get(index + 1) : null;
        }
        setPrevious();
        setNext();

        // Move the object rightwards as long as the element to the right
        // exists and is smaller than the new object.
        while (next !== null && gt(newObject, next)) {
          swap(index, index + 1);
          index++;
          setPrevious();
          setNext();
        }

        // Move the object leftwards as long as the element to the left
        // exists and is greater than the new object.
        while (previous !== null && lt(newObject, previous)) {
          swap(index, index - 1);
          index--;
          setPrevious();
          setNext();
        }
      }
    }
  });
});
