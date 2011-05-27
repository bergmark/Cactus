(function () {
  var A = Cactus.Addon.Array;
  var EventManager = Cactus.Web.EventManager;
  var $f = Cactus.Web.selectFirst;

  var EventBinding = Class({
    has : {
      bindings : { init : A.new },
      rootElement : { is : "ro" },
      bindingEventManager : { init : function () { return new EventManager(); } }
    },
    methods : {
      BUILD : function (rootElement) {
        return {
          rootElement : rootElement
        };
      },
      _getDataSource : function () {
        if (!this.dataSource) {
          throw new Error("EventBinding_getDataSource: dataSource is %s."
                          .format(this.dataSource));
        }
        return this.dataSource;
      },
      hasDataSource : function () {
        return !!this.dataSource;
      },
      _setDataSource : function (dataSource) {
        this.dataSource = dataSource;
      },
      bindTo : function (dataSource) {
        if (this.hasDataSource() && this._getDataSource() === dataSource) {
          return;
        }
        this._setDataSource(dataSource);
        this.refresh();
      },
      refresh : function () {
        this._detach();
        this._attach();
      },
      setBindings : function (bindings) {
        this.bindings = bindings;
        if (this.hasDataSource()) {
          this.refresh();
        }
      },
      /**
       * Removes all events added by _attach.
       */
      _detach : function () {
        this.bindingEventManager.detach();
      },
      /**
       * Attaches the events to the current data source.
       */
      _attach : function () {
        for (var i = 0; i < this.bindings.length; i++) {
          var binding = this.bindings [i];

          if (!binding.callback && !binding.method) {
            throw new Error("callback or method has to be specified");
          }

          // The element to add the event to.
          //
          // Special case, if "root" is the selector the root element of
          // the template is the chosen element.
          var element;
          if (binding.selector === "root") {
            element = this.getRootElement();
          } else {
            element = $f(binding.selector, this.getRootElement());
          }

          if (element === null) {
            throw new Error("MVC.View.Template:_attachEventBindings: There is no element with " +
                            "the selector " + binding.selector);
          }

          // The type of event.
          if (!binding.event) {
            binding.event = "click";
          }
          var callback;
          if (binding.callback) {
            // Use a function as callback.
            callback = binding.callback;
          } else if (binding.method) {
            // Use a method on the dataSource as callback.
            var dataSource = this._getDataSource();
            var func = dataSource.getValue (binding.method);
            if (!(func instanceof Function)) {
              throw new Error(
                "The dataSource has no method by the name "
                  + binding.method);
            }

            callback = func.bind (dataSource);
          } else {
            throw new Error ("Unreachable code");
          }

          this.bindingEventManager.add(element, binding.event, callback);
        }
      },
      clone : function (rootElement) {
        var clone = new EventBinding(rootElement);
        clone.setBindings(A.clone(this.bindings));
        return clone;
      }
    }
  });
  Cactus.Web.Template.EventBinding = EventBinding;
})();
