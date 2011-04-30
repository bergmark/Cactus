/**
 * @file
 *  An abstract interface for templates. It's primary purpose is to remove
 *  duplication between subclasses.
 */
Module("Cactus.Web", function (m) {

  function AbstractTemplate () {

  } AbstractTemplate.prototype = {
    /**
     * @type HTMLElement
     *   Contains the root of the template.
     */
    rootElement : null,
    /**
     * @type Object
     *   A model object that the template operates on. Subclasses may
     *   restrict this type further.
     */
    dataSource : null,
    /**
     * Fetches the root element of the template, use this to append the
     * template to the DOM.
     *
     * @return HTMLElement
     *   The root of the template.
     */
    getRootElement : function () {
      return this.rootElement;
    },
    /**
     * Lets the client add DOM events that are automatically attached to
     * the bound data source, and is updated if the data source changes.
     *
     * @param Array[Hash] bindings
     *   The hashes can have the following properties:
     *     optional string event = "click"
     *       The type of event to bind, valid arguments to Events.add().
     *     string selector
     *       The selector of the element to add the event to.
     *       As a special case, the selector "root" will refer to the root
     *       element of the template.
     *     optional string method
     *       The name of a method on the data source to bind the event to.
     *       Binding a method means it will be called on the object when
     *       the event triggers. This also takes into account that the
     *       dataSource might change.
     *     optional Function callback
     *       A function to call once the event triggers. Don't pass in a
     *       function bound to the data source, since the data source might
     *       change. Use method for that case.
     *   Either method or callback have to be passed.
     */
    createEventBindings : function (bindings) {
      // .
    },
    /**
     * A template always has a model object of some sort that it retrieves
     * its values from. Calling this method on a subclass should cause the
     * view to be updated with new data (ie. refresh() is called from this
     * method).
     *
     * @param Object object
     *   A model object.
     */
    bindTo : function (dataSource) {
      if (this.hasDataSource() && this._getDataSource() === dataSource) {
        return;
      }
      this._setDataSource(dataSource);
      this.refresh();
    },
    /**
     * @return Object dataSource
     * @throws
     *   Error if dataSource isn't set. If unsure, check with hasDataSource.
     */
    _getDataSource : function () {
      if (!this.dataSource) {
        throw new Error("AbstractTemplate:_getDataSource: dataSource is %s."
                        .format(this.dataSource));
      }
      return this.dataSource;
    },
    /**
     * @return boolean
     */
    hasDataSource : function () {
      return !!this.dataSource;
    },
    /**
     * @param Object dataSource
     */
    _setDataSource : function (dataSource) {
      this.dataSource = dataSource;
    },
    /**
     * Does a complete refresh of the WUI after the dataSource changes.
     */
    refresh : function () {
      // .
    }
  };

  m.AbstractTemplate = AbstractTemplate;
});
