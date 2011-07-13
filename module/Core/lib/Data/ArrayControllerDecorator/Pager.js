/**
 * @file
 * Pager decorates an ArrayController by dividing
 * its contents into different pages. The obvious usage for a paginator is to
 * enable the presentation lots of data, a little bit at a time.
 *
 * Assume we have an ArrayController containing 50 items. We can create a
 * paginator with new PaginatonDecorator (component, 10); in order to create
 * 5 pages, each containing 10 items. We can then change pages by calling
 * setPage (n) where n is 0..4. In this case the paginator sends out an
 * onRearranged event since only new objects will be shown. The paginator
 * allows a client programmer to not worry about which page is active and he can
 * choose to display only the data currently "in" the paginator.
 *
 * A different graphical component may be used to control the changing between
 * pages.
 *
 * It's also possible to use a paginator to only show one object at a time, just
 * set objectsPerPage to 1. This could be useful for a master/detail interface.
 */
Module("Cactus.Data.ArrayControllerDecorator", function (m) {
  var ArrayController = Cactus.Data.ArrayController;
  var ArrayControllerDecorator = m;
  var Range = Cactus.Data.Range;
  var Collection = Cactus.Data.Collection;
  var A = Cactus.Addon.Array;
  Class("Pager", {
    isa : ArrayControllerDecorator,
    has : {
      /**
       * @type positive
       */
      objectsPerPage : { is : "rw" },
      /**
       * @type natural
       */
      page : { is : "rw" },
      /**
       * @type natural
       */
      pageCount : { is : "ro", init : 0 },
      /**
       * The indices on the component that are in the
       * pagination decorators collection.
       *
       * @type Util.Range
       */
      componentIndexRange : null
    },
    methods : {
      /**
       * @param ArrayController component
       * @param positive objectsPerPage = 10
       *   The amount of objects to make available at a time.
       * @param natural page = 0
       *   The page to show when the object initializes.
       */
      BUILD : function (component, objectsPerPage, page) {
        return O.copy(this.SUPER(component), {
          _objectsPerPage : objectsPerPage || 10,
          _page : page || 0
        });
      },
      initialize : function (args) {
        this.SUPER();
        this.setObjectsPerPage(args._objectsPerPage);
        this.setPage(args._page);
        this._setObjects();
      },
      // Events.
      /**
       * Passed out when one or more pages are added or removed.
       *
       * @param natural pageCount
       *   The new pageCount.
       * @param natural oldPageCount
       *   The previous pageCount.
       */
      onPageCountUpdated : Function.empty,
      /**
       * Triggered when the page is changed,
       * page will never be equal to oldPage.
       *
       * @param natural page
       *   The current page.
       * @param natural oldPage
       *   The previous page.
       */
      onPageChanged : Function.empty,

      /**
       * Changes objects if necessary.
       *
       * @param positive amount
       *   The amount of objects to fit inside a page.
       */
      setObjectsPerPage : function (amount) {
        if (amount !== this.getObjectsPerPage()) {
          this.objectsPerPage = amount;
          this._setObjects();
          this.onRearranged();
        }
      },
      /**
       * Changes the active page. Sends out onPageChanged and
       * onRearranged if necessary.
       *
       * @param natural page
       *   The number of the page to show.
       * @throws Error
       *   If the specified page is out of bounds.
       */
      setPage : function (page) {
        // the page can always be zero since zero is used if the list is
        // empty.
        if (page !== 0 && (page < 0 || page >= this.getPageCount())) {
          throw new Error ("Specified page (" + page + ") is out of bounds");
        }
        // No need to change the page if the the new page matches the active
        // one.
        if (page === this.getPage()) {
          return;
        }

        var oldPage = this.getPage();
        this.page = page;
        this._setObjects();
        this.onPageChanged (this.getPage(), oldPage);
        this.onRearranged();
      },
      /**
       * Calculates the amount of available pages based on the amount of
       * objects the component contains.
       *
       * @return boolean
       *   Whether the page count changed.
       */
      _setPageCount : function () {
        var oldPageCount = this.pageCount;
        this.pageCount = Math.ceil(this.component.size() / this.getObjectsPerPage());
        // There has to be at least one page.
        this.pageCount = Math.max(1, this.pageCount);

        // If the page  count has changed we have  to pass out the
        // event, and change  the page if the current  page is out
        // of bounds.
        if (oldPageCount === this.pageCount) {
          return false;
        }

        // If there are no pages with objects, we show page 0,
        // and it'll be empty.
        if (this.getPageCount() === 0) {
          this.setPage(0);
        } else if (this.getPage() >= this.getPageCount()) {
          // Current page out of bounds, so it's changed to the
          // previous one.
          this.setPage(this.pageCount - 1);
        }
        this.onPageCountUpdated (this.pageCount, oldPageCount);
        return true;
      },
      /**
       * Sets the correct range for componentIndexRange, the range contains
       * all indices on the component whose objects are on the current page.
       */
      _setComponentIndexRange : function () {
          var start = this.getPage() * this.getObjectsPerPage();
          var end   = start + this.getObjectsPerPage() - 1;
          this.componentIndexRange = new Range (start, end);
      },
      /**
       * Sets the pageCount and the componentIndexRange and finally retrieves
       * all objects for the actual page from the component. This method does
       * not trigger any events, so methods using this method must decide if
       * this is necessary.
       */
      _setObjects : function () {
          this._setPageCount();
          this._setComponentIndexRange();
          this.objects = this.component.getRange(this.componentIndexRange);
      },
      /**
       * Checks if a given index on the component is inside the current page.
       *
       * @param natural componentIndex
       * @return boolean
       */
      _isIndexInCurrentPage : function (componentIndex) {
        return this.componentIndexRange.includes (componentIndex);
      },
      /**
       * Checks if the current page is full, which it always will be unless
       * the last page is the active one, and it isn't full of course.
       *
       * @return boolean
       *   Whether the page is full.
       */
      _isCurrentPageFull : function () {
        return this.objects.length === this.getObjectsPerPage();
      },
      /**
       * Converts a component index to the index in the paginator's
       * collection.
       *
       * @param natural componentIndex
       * @return natural
       */
      _convertIndex : function (componentIndex) {
        return componentIndex - this.componentIndexRange.getStart();
      },
      /**
       * Converts an index on the paginator into the corresponding index on
       * the component.
       *
       * @param natural index
       * @return natural
       */
      _convertIndexToComponent : function (index) {
        return index + this.componentIndexRange.getStart();
      },
      /**
       * Whether an index on the component is inside the current page.
       *
       * @param natural componentIndex
       * @return boolean
       */
      _isComponentIndexInPage : function (componentIndex) {
        var index = this._convertIndex (componentIndex);
        return index >= 0 && index < this.getObjectsPerPage();
      },
      /**
       * Swaps two elements, they must both be inside the current page.
       *
       * @param natural indexA
       * @param natural indexB
       */
      swap : function (indexA, indexB) {
        // Fetch the indexes on the component and swap them.
        this.getComponent().swap (this._convertIndexToComponent (indexA), this._convertIndexToComponent (indexB));
      },
      /**
       * Adds an object to a specific index inside the page, elements to the
       * right will be shifted.
       *
       * @param natural index
       * @param mixed object
       */
      addAtIndex : function (index, object) {
        if (!this.hasIndex (index)) {
          throw new Error ("Invalid index supplied");
        }

        this.getComponent().addAtIndex (this._convertIndex (index), object);
      },
      /**
       * Triggered when an object is added on the component. The method makes
       * sure that objects added to the page make the active items shift to
       * the right, and a new object on the active page is inserted.
       * Nothing has to happen if the object is on page later than the active
       * one.
       *
       * @param ArrayController component
       * @param natural index
       */
      onAddedTriggered : function (component, index) {
        this._setPageCount();

        if (index > this.componentIndexRange.getEnd()) {
          return;
        }

        var pageFullBeforeAdd = this._isCurrentPageFull();

        // The object is added to the current page or preceeding
        // pages, so we need to add it to the correct position and
        // shift the succeeding elements one step to the right.
        var lastObject = this.objects.length === 0 ? null : Collection.last (this.objects);
        this._setObjects();
        // If the last object was shifted out of the page we need
        // to send an onRemove event.
        if (pageFullBeforeAdd &&
            lastObject !== this.objects[this.getObjectsPerPage() - 1]) {

          this.onRemoved (lastObject, this.objects.length - 1);
        }
        this.onAdded (this._convertIndex (index));
      },
      /**
       * Triggered when an object is removed from the component.
       *
       * @param ArrayController component
       * @param mixed object
       *   The object removed from the component.
       * @param natural componentIndex
       *   The index the object was removed from on the component.
       */
      onRemovedTriggered : function (component, object, componentIndex) {
        var that = this;
        /*
         * When an object is removed there are three cases for the
         * removed object:
         * 1. It was located past the end of page, in which case we do
         *    nothing.
         * 2. It was located before the start of the page, in which
         *    case we shift all elements to the left, removing the
         *    first one, and adding a new last element, if one is
         *    available.
         * 3. The only element on the current page was removed, so we change
         *    the current page to the previous one.
         * 4. It was located inside the page in which case we remove it,
         *    shifting the elements after it to the left, and then we add
         *    a new element to the end of the collection (the first one of
         *    the next page, if you will).
         */
        var previousPage = this.getPage();
        var pageCountChanged = this._setPageCount();
        var pageChanged = previousPage !== this.getPage();
        var isLastPage = this.getPage() === this.getPageCount() - 1;

        // 1.
        if (componentIndex > this.componentIndexRange.getEnd()) {
          return;
        }

        function canAddObjectToEnd () {
          // Since the component has removed the object already, the last
          // element of componentIndexRange on the component will be an
          // element not on the current page, so here we check that such
          // an element exists (it won't if the current page is the last
          // one.)
          return component.hasIndex (that.componentIndexRange.getEnd());
        }
        function addToEnd () {
          that.objects.push(component.get (that.componentIndexRange.getEnd()));
          that.onAdded(that.objects.length - 1);
        }

        // 2.
        if (componentIndex < this.componentIndexRange.getStart()) {
          var removedObject = this.objects.shift();
          this.onRemoved (removedObject, 0);
          if (canAddObjectToEnd()) {
            addToEnd();
          }

          return;
        }

        // 3.
        if (pageCountChanged && isLastPage & pageChanged) {
          this.onRemoved (object, index);
          return;
        }

        // 4.
        var index = A.remove (this.objects, object);
        this.onRemoved (object, index);
        if (canAddObjectToEnd()) {
          addToEnd();
        }
      },
      /**
       * Triggered when two objects swap places on the component.
       *
       * @param ArrayController component
       * @param natural indexA
       * @param natural indexB
       */
      onSwappedTriggered : function (component, indexA, indexB) {
      /*
       * Three cases:
       * 1. None of the indices are inside the current page, in this case
       *    nothing needs to be done.
       * 2. Both objects are in the array, swap them.
       * 3. Only one object is inside the array, replace that one with
       *    the other one.
       */

        var indexAInPage = this._isComponentIndexInPage (indexA);
        var indexBInPage = this._isComponentIndexInPage (indexB);
        var indexAOnDecorator = this._convertIndex (indexA);
        var indexBOnDecorator = this._convertIndex (indexB);
        // Indexes are shifted here because the component has already
        // swapped the elements.
        var objectA = this.getComponent().get (indexB);
        var objectB = this.getComponent().get (indexA);

        // 1.
        if (!indexAInPage && !indexBInPage) {
          return;
        }

        // 2.
        if (indexAInPage && indexBInPage) {
          var tmp = this.get (indexAOnDecorator);
          this.objects [indexAOnDecorator] = this.get (indexBOnDecorator);
          this.objects [indexBOnDecorator] = tmp;
          this.onSwapped(Math.min(indexAOnDecorator, indexBOnDecorator),
                         Math.max(indexAOnDecorator, indexBOnDecorator));
          return;
        }

        // 3.
        if (indexAInPage) {
          ArrayController.prototype.replace.call (this, objectA, objectB);
        } else {
          ArrayController.prototype.replace.call (this, objectB, objectA);
        }
      },
      /**
       *
       *
       * @param ArrayController component
       * @param natural index
       * @param mixed oldObject
       * @param mixed newObject
       */
      onReplacedTriggered : function (component, index, oldObject, newObject) {
        if (!this._isIndexInCurrentPage (index)) {
          return;
        }

        ArrayController.prototype.replace.call (this, oldObject, newObject);
      }
    }
  });

  ArrayControllerDecorator.createChainOfResponsibilityMethods(
    "setObjectsPerPage",
    "getObjectsPerPage",
    "setPage",
    "getPage",
    "getPageCount"
  );
});
