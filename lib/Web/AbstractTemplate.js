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
    getView : function () {
      return this.rootElement;
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
    attach : function (dataSource) {
      if (this.hasModel() && this._getModel() === dataSource) {
        return;
      }
      this._setDataSource(dataSource);
      this.refresh();
    },
    /**
     * @return Object dataSource
     * @throws
     *   Error if dataSource isn't set. If unsure, check with hasModel.
     */
    _getModel : function () {
      if (!this.dataSource) {
        throw new Error("AbstractTemplate:_getModel: dataSource is %s."
                        .format(this.dataSource));
      }
      return this.dataSource;
    },
    /**
     * @return boolean
     */
    hasModel : function () {
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
