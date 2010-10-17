var Joose = require('Joose');

/**
 * @file
 * Provides extended functionality for Arrays.
 */
Module("CactusJuice.Addon", function (m) {
  Class("Array", {
    methods : {
      /**
       * Empties an array. Use this function when there are several
       * references to an array and you can't modify all of them to
       * point to a new array instance.
       *
       * @param Array array
       *   The array to empty.
       */
      empty : function (array) {
        array.length = 0;
      }
      /**
       * Removes the specified element from the given array. If removeAll is set
       * the element is removed from every index in the array, if found.
       * Otherwise only the first occurence is removed.
       * Any objects to the right of the removed object are shifted to the left.
       *
       * @param Array array
       *   The array to remove the element from.
       * @param mixed element
       *   The element to remove.
       * @param optional boolean removeAll = true
       *   If more than one matching element should be removed (if found).
       * @return boolean
       *   The index of the element that was removed, -1 if nothing was removed.
       *   If removeAll is specified, any of the found indices may be returned.
       */
      , remove : function (array, element, removeAll) {
        removeAll = removeAll === undefined ? false : !!removeAll;
        var newArray = [];
          var removed  = -1;

        function shouldRemove(matchingElements) {
          return matchingElements && (removeAll || removed === -1);
        }
        // Append the elements we want to keep to newArray.
        for (var i = 0; i < array.length; i++) {
          if (shouldRemove(element === array[i])) {
            removed = i;
          } else {
            newArray.push(array[i]);
          }
        }
        // Move contents of newArray to array.
        if (array.length > newArray.length) {
          this.empty(array);
          while (newArray.length) {
            array.push(newArray.shift());
          }
        }

        return removed;
      }
      /**
       * Shallow clones an Array.
       *
       * @param Array array
       * @return Array
       */
      , clone : function (array) {
        return array.slice(0);
      }
      /**
       * Removes all duplicates and returns a new array containing only one
       * occurance of each value.
       *
       * @param Array array
       * @return Array
       */
      , unique : function (array) {
        function hasValue(array, value) {
          for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
              return true;
            }
          }
          return false;
        }

        var result = [];
          for (var i = 0; i < array.length; i++) {
            var o = array[i];
            if (!hasValue(result, o)) {
              result.push(o);
            }
          }
        return result;
      }
    }
  });
});
