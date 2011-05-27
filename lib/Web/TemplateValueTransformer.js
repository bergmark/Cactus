/**
 * @file
 *
 */
Module("Cactus.Web", function (m) {
  var Collection = Cactus.Data.Collection;
  var $ = Cactus.Web.select;

  function TemplateValueTransformer(rootElement) {
    this.keyPathTransformers = {};
    this.selectorTransformers = [];
    this.rootElement = rootElement;
  } TemplateValueTransformer.prototype = {
    /**
     * @type Hash<KeyPath,Hash>
     *   The keys are key paths for setting or getting a value, used for
     *   quickly looking up elements. See setValueTransformer documentation.
     */
    keyPathTransformers : null,
    /**
     * @type Array<Hash>
     *   Stores information regarding added value transformers for
     *   specific selectors.
     */
    selectorTransformers : null,
    bindTo : function (dataSource) {
      this.dataSource = dataSource;
    },
    _getDataSource : function () {
      return this.dataSource;
    },
    _getRootElement : function () {
      return this.rootElement;
    },
    /**
     * Forward transforms a value by using the value transformer
     * assigned to a specific key path. If none is defined
     * the given value is simply returned.
     *
     * @param string keyPath
     * @param mixed value
     */
    forwardForKeyPath : function (keyPath, value) {
      if ((keyPath in this.keyPathTransformers)
          && this.keyPathTransformers[keyPath].forward) {
        return this.keyPathTransformers[keyPath].forward(value, this._getDataSource());
      } else {
        return value;
      }
    },
    /**
     * Forward transforms a value for a specific element. The value should
     * already have been transformed by the key path transformer.
     *
     * @param HTMLElement element
     * @param mixed value
     * @return mixed
     *   The new transformed value, or the old value if no transformer
     *   existed.
     */
    forwardForElement : function (element, value) {
      var transformer = this._getSelectorTransformerForElement(element);
      if (!transformer) {
        return value;
      }
      if (transformer.forward) {
        return transformer.forward(value);
      }
      return value;
    },
    /**
     * Does a backward transformation, from the element to a kvc value.
     * It first goes through any backward selector transformer, and then
     * through any backward value transformer.
     *
     * @param string keyPath
     *   The keyPath the element is observing.
     * @param HTMLElement element
     * @param mixed value
     *   The value of the element.
     */
    backwardTransform : function (keyPath, element, value) {
      var transformer = this._getSelectorTransformerForElement(element);
      if (transformer && transformer.backward instanceof Function) {
        value = transformer.backward(value);
      }

      if ((keyPath in this.keyPathTransformers) &&
          (this.keyPathTransformers[keyPath].backward)) {
        value = this.keyPathTransformers[keyPath].backward(value);
      }

      return value;
    },
    _getSelectorTransformerForElement : function (element) {
      for (var i = 0; i < this.selectorTransformers.length; i++) {
        var h = this.selectorTransformers[i];
        for (var j = 0; j < h.elements.length; j++) {
          if (element === h.elements[j]) {
            return h;
          }
        }
      }
      return null;
    },
    clone : function (rootElement) {
      var clone = new TemplateValueTransformer(rootElement);

      // Clone value transformers.
      for (var p in this.keyPathTransformers) {
        if (this.keyPathTransformers.hasOwnProperty(p)) {
          var v = this.keyPathTransformers[p];
          clone.add({
            keyPath : p,
            forward : v.forward,
            backward : v.backward
          });
        }
      }
      for (var p in this.selectorTransformers) {
        if (this.selectorTransformers.hasOwnProperty(p)) {
          var v = this.selectorTransformers[p];
          clone.add({
            selector : v.selector,
            forward : v.forward,
            backward : v.backward
          });
        }
      }
      return clone;
    },
    /**
     * Adds a value transformer for the given key path, or css selector.
     * A value transformer maps a value from a KVC property onto a string
     * that is to be displayed in the view. A value transformer can either
     * be set for a key path, in which case every HTML element displaying
     * the property will receive the transformed value. The other case is
     * where the transformation is restricted to one or more, but perhaps
     * not all, elements. This is accomplished by using the selector
     * property.
     *
     * Both types of transformers can be combined, and if they are, the
     * first replacement will be the global one (KVC -> a) and the
     * selector transformer will then do a second transformation
     * (a -> string).
     *
     * @param Hash{
     *   optional keyPath : string,
     *     The key path to add the transformer to.
     *   optional selector : string,
     *     If a key path isn't specified, a selector that matches one or
     *     more elements that have a corresponding key path in the KVC.
     *   forward : Function
     *                 @param mixed value
     *                 @return string value
     *   backward : Function
     *               @param string value
     *               @return mixed value
     * }
     */
    add : function (option) {
      var keyPath = option.keyPath || option.selector;
      if (option.selector) {
        var selectorTransformers = Collection.select(
          this.selectorTransformers,
          function (v) {
            return v.selector === option.selector;
          });
        var elements;

        // Overriding any old transformer for this key path.
        if (selectorTransformers.length > 0) {
          selectorTransformers[0].forward = option.forward;
          elements = selectorTransformers[0].elements;
        } else {
          if (option.selector === "root") {
            elements = [this._getRootElement()];
          } else {
            elements = $(option.selector, this._getRootElement());
          }
          this.selectorTransformers.push({
            selector : option.selector,
            forward : option.forward,
            backward : option.backward,
            elements : elements
          });
        }
      } else if (option.keyPath) {
        this.keyPathTransformers[option.keyPath] = {
          keyPath : option.keyPath,
          forward : option.forward,
          backward : option.backward
        };
      } else {
        throw new Error("TemplateValueTransformer:add: keyPath or selector must be specified.");
      }
    }
  };

  m.TemplateValueTransformer = TemplateValueTransformer;
});
