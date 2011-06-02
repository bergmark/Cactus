/**
 * @file
 * The Filterer decorates an ArrayController by discarding
 * certain elements based on custom criteria. Thus providing a smaller amount of
 * elements than its component. An example usage would be if we only want to
 * display items with a name starting with a "T". Filterer would then be
 * instantiated with
 * new FilterDecorator(component, function (o) {
 *     return o.getValue("name").charAt(0) === "T";
 * });
 */
Module("Cactus.Data.ArrayControllerDecorator", function (m) {
  var AC = Cactus.Data.ArrayController;
  var ACD = Cactus.Data.ArrayControllerDecorator;

  Class("Filterer", {
    isa : ACD,
    has : {
      filterFunction : { required : true }
    },
    methods : {
      BUILD : function (component, filterFunction) {
        var h = this.SUPER(component);
        h.filterFunction = filterFunction;
        return h;
      },
      _setObjects : function () {
        this.objects = [];
        var componentObjects = this.getComponent().getRange();
        for (var i = 0; i < componentObjects.length; i++) {
          this.__add(componentObjects[i]);
        }
      },
      /**
       * Refreshes the contents of the ACD. The collection is rebuilt.
       */
      reFilter : function () {
        this._setObjects();
        this.onRearranged();
      },
      /**
       * @param mixed object
       * @return boolean
       *   Whether the object was added.
       */
      __add : function (object) {
        if (this.filterFunction(object)) {
          this.objects.push(object);
          return true;
        }
        return false;
      },
      /**
       * Sets a new filtering criteria, causes an Rearranged.
       *
       * @param Function filter
       *        @param mixed object
       *        @return boolean
       *           Whether `object` should be included in the filterer's
       *           collection.
       */
      setFilter : function (filter) {
        this.filterFunction = filter;
        this._setObjects();
        this.onRearranged();
      },
      /**
       * @param ArrayController component
       * @param natural index
       */
      onAddedTriggered : function (component, object, index) {
        if (this.__add(component.get(index))) {
          this.onAdded(object, this.objects.length - 1);
        }
      },
      /**
       * @param natural indexA
       * @param natural indexB
       */
      swap : function (indexA, indexB) {
        // Translate the indices to indices on the component and swap on it.
        var objA = this.get(indexA);
        var objB = this.get(indexB);
        var component = this.getComponent();
        component.swap(component.indexOf(objA), component.indexOf(objB));
      },
      /**
       * @param ArrayController component
       * @param natural indexA
       * @param natural indexB
       */
      onSwappedTriggered : function (component, indexA, indexB) {
        var objA = component.get(indexA);
        var objB = component.get(indexB);

        if (!this.has(objA) || !this.has(objB)) {
          return;
        }

        AC.prototype.swap.call(this, this.indexOf(objA), this.indexOf(objB));
      },
      /**
       * @param ArrayController component
       * @param natural index
       * @param mixed oldObject
       * @param mixed newObject
       */
      onReplacedTriggered : function (component, index, oldObject, newObject) {
        if (this.filterFunction(newObject)) {
          // If the old object is in the filterer, it's replaced for the
          // new one.
          if (this.has(oldObject)) {
            AC.prototype.replace.call(this, oldObject, newObject);
          }
          // Otherwise the new object is inserted at a location relative
          // to where it is in the component (see unit test for example).
          else {
            // Find the first element to the left of `index` in the
            // component that is also an element in the filterer, if
            // one exists. The new object should be placed after that
            // object in the filterer.
            for (var componentIndex = index; componentIndex >= 0; componentIndex--) {
              if (this.has(this.component.get(componentIndex))) {
                break;
              }
            }
            // If no previous element was found, componentIndex will be
            // -1 but the element should be inserted at index 0.
            if (componentIndex === -1) {
              componentIndex = 0;
            }

            this.__addAtIndex(componentIndex, newObject);
          }
        }
        // Otherwise we remove the old object if it's in the Filterer.
        else if (this.has(oldObject)) {
          AC.prototype.remove.call(this, oldObject);
        }
      },
      /**
       * @param natural index
       * @param mixed object
       */
      __addAtIndex : function (index, object) {
        // Walk from the end of the array and `swap` each element with the
        // new one.
        AC.prototype.add.call(this, object);

        var currentIndex = this.size() - 1;

        // We're done if the index was at the end of the collection.
        if (index === currentIndex) {
          return;
        }

        while (index !== currentIndex) {
          AC.prototype.swap.call(this, currentIndex, currentIndex - 1);
          currentIndex--;
        }
      }
    }
  });
  ACD.createChainOfResponsibilityMethods("setFilter", "reFilter");
});
