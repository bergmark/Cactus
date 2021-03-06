/**
 * @file
 *
 * Provides a wrapper around an Array, extending its functionality by
 * implementing the EventSubscription interface.
 *
 * Be careful when calling getRange() if working with subclasses since they
 * may implement lazy load and getting all objects might force a very expensive
 * server query. Pass an Util.Range to getRange() to get only a portion of the
 * contents instead of slicing the array afterwards.
 */
Module("Cactus.Data", function (m) {
  var EventSubscription = Cactus.Util.EventSubscription;
  var Range = Cactus.Data.Range;
  var Collection = Cactus.Data.Collection;
  var CArray = Cactus.Addon.Array;

  Class("ArrayController", {
    does : EventSubscription,
    has : {
      /**
       * @type Array
       *   Holds the array the instance controls.
       */
      objects : null
    },
    methods : {
      /**
       * @param optional Array array
       *   The array to control. If none is specified a new array is created.
       *   Remember that AC takes ownership of the array, and any outside
       *   modifications might cause errors.
       */
      BUILD : function (array) {
        return {
          objects : array || []
        };
      },

      // Events.
      /**
       * @param mixed object
       *   The object that was added.
       * @param natural index
       *   Where the new object was inserted.
       */
      onAdded : Function.empty,
      /**
       * Triggered when a bigger update is made, because sending individual
       * add/removes would be too complex.
       */
      onRearranged : Function.empty,
      /**
       * @param mixed object
       *   The removed object.
       * @param mixed index
       *   The index the object was located at.
       */
      onRemoved : Function.empty,
      /**
       * Triggers when two objects swap places.
       *
       * Contract: indexA < indexB
       *
       * @param natural indexA
       * @param natural indexB
       */
      onSwapped : Function.empty,
      /**
       * Triggers when an object is replaced with a new one.
       * @param natural index
       * @param mixed oldObject
       * @param mixed newObject
       */
      onReplaced : Function.empty,
      /**
       * Triggers when the last element is removed from the AC.
       *
       * This is a complementary event, consistency can be maintained
       * without subscribing to it
       */
      onEmptied : Function.empty,
      /**
       * Triggers when first element is added to the AC.
       *
       * This is a complementary event, consistency can be maintained
       * without subscribing to it
       */
      onFilled : Function.empty,

      /**
       * Checks if an object exists inside the array.
       *
       * @param mixed object
       * @return boolean
       */
      has : function (object) {
        return Collection.hasValue(this.objects, object);
      },
      /**
       * Gets the index of an object inside the array.
       *
       * @param mixed object
       * @return natural
       * @throws Error
       *   If the object isn't inside the array
       */
      indexOf : function (object) {
        return Collection.indexOf(this.objects, object);
      },
      /**
       * Gets an object at a specific index.
       * Subclasses may modify this to, for instance, lazy loading the object.
       *
       * @param natural index
       */
      get : function (index) {
        if (!this.hasIndex(index)) {
          throw new Error("Index out of bounds (" + index + ")");
        }
        return this.objects[index];
      },
      /**
       * Gets a shallow copy of the list of objects in the controller.
       * If a range is specified only the objects with indexes in the
       * range are retrieved. Beware of using this method with no
       * arguments. See class description at top of file.
       *
       * @param optional Range indexRange
       *   The whole array is fetched if the range isn't specified.
       */
      getRange : function (indexRange) {
        if (!indexRange && this.objects.length === 0) {
          return [];
        }
        indexRange = indexRange || new Range(0, this.objects.length - 1);
        return Collection.sliceWithRange(this.objects, indexRange);
      },
      /**
       * Returns the amount of objects in the array.
       * It's better to call this method instead of doing getRange().length
       * since the latter may force unnecessary computations.
       *
       * @return natural
       */
      size : function () {
        return this.objects.length;
      },
      /**
       * Checks if a specific index is inside the array. This method was
       * implemented to prevent the client programmer from calling
       * getRange() because of reasons mentioned in the class description.
       *
       * @param natural index
       */
      hasIndex : function (index) {
        return index >= 0 && index < this.objects.length;
      },
      /**
       * Adds an object to the collection, the object must not
       * already have been added.
       *
       * @throws Error
       *   If the object already exists in the controller.
       * @param mixed object
       */
      add : function (object) {
        if (this.has(object)) {
          throw new Error("Object already exists in ArrayController");
        }
        this.objects.push(object);
        this.onAdded(object, this.objects.length - 1);
        if (this.size() === 1) {
          this.onFilled();
        }
      },
      /**
       * Removes an object from the controller, no action is taken
       * if the object isn't found and onRemoved won't be
       * triggered in that case.
       *
       * @param mixed object
       */
      remove : function (object) {
        var index = CArray.remove(this.objects, object);
        if (index === -1) {
          throw new Error("ArrayController:remove: Object is not in collection.");
        }

        this.onRemoved(object, index);
        if (this.size() === 0) {
          this.onEmptied();
        }
      },
      /**
       * Removes the object at the specified index.
       *
       * @param natural index
       */
      removeAtIndex : function (index) {
        this.remove(this.objects[index]);
      },
      /**
       * Swaps the position of two objects, by their indexes.
       *
       * @param natural indexA
       * @param natural indexB
       */
      swap : function (indexA, indexB) {
        if (!this.hasIndex(indexA)) {
          throw new Error("ArrayController:swap: Index out of bounds: indexA = " + indexA);
        }
        if (!this.hasIndex(indexB)) {
          throw new Error("ArrayController:swap: Index out of bounds: indexB = " + indexB);
        }
        if (indexA === indexB) {
          throw new Error("ArrayController:swap: Both indices were " + indexA);
        }
        var a = this.objects[indexA];
        var b = this.objects[indexB];

        this.objects[indexA] = b;
        this.objects[indexB] = a;
        this.onSwapped(Math.min(indexA, indexB),
                       Math.max(indexA, indexB));
      },
      /**
       * Adds an object at the specified index and shifts all objects with
       * indices greater or equal to the index one step to the right.
       *
       * @param natural index
       * @param mixed object
       */
      addAtIndex : function (index, object) {
        // Walk from the end of the array and `swap` each object with the
        // new one.
        this.add(object);

        var currentIndex = this.size() - 1;

        // We're done if the index was at the end of the collection.
        if (index === currentIndex) {
          return;
        }

        while (index !== currentIndex) {
          this.swap(currentIndex, currentIndex - 1);
          currentIndex--;
        }
      },
      /**
       * Remove an object from the collection and replace it with a new one,
       * meaning no other objects will be shifted. The new object must not
       * already be in the collection, for that case, use swap.
       *
       * @param mixed oldObject
       * @param mixed newObject
       */
      replace : function (oldObject, newObject) {
        if (this.has (newObject)) {
          throw new Error("newObject (" + newObject + ") is already in the collection.");
        }

        var i = this.indexOf(oldObject);
        this.objects[i] = newObject;

        this.onReplaced(i, oldObject, newObject);
      },
      /**
       * Removes all object from the instance.
       * Does so while trying to minimize the number of events sent out.
       */
      clear : function () {
        // Removing backwards will send out O(size()) Removed events.
        for (var i = this.size() - 1; i >= 0; i--) {
          this.removeAtIndex(i);
        }
      }
    }
  });
});
