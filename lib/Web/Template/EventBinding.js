(function () {
  var A = Cactus.Addon.Array;
  var EventManager = Cactus.Web.EventManager;
  var $f = Cactus.Web.selectFirst;
  var Mediator = Cactus.Web.Mediator;

  var EventBinding = Class({
    does : Mediator,
    has : {
      bindings : { init : A.new },
      bindingEventManager : { init : function () { return new EventManager(); } }
    },
    methods : {
      BUILD : function (view) {
        return {
          view : view
        };
      },
      setBindings : function (bindings) {
        this.bindings = bindings;
        if (this.hasModel()) {
          this._modelDetached();
          this._modelAttached();
        }
      },
      /**
       * Removes all events.
       */
      _modelDetached : function () {
        this.bindingEventManager.detach();
      },
      /**
       * Attaches the events to the current view.
       */
      _modelAttached : function () {
        for (var i = 0; i < this.bindings.length; i++) {
          var binding = this.bindings[i];

          if (!binding.callback && !binding.method) {
            throw new Error("callback or method has to be specified");
          }

          // The element to add the event to.
          //
          // Special case, if "root" is the selector the root element of
          // the template is the chosen element.
          var element;
          if (binding.selector === "root") {
            element = this.getView();
          } else {
            element = $f(binding.selector, this.getView());
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
            // Use a method on the model as callback.
            var model = this._getModel();
            var func = model.getValue(binding.method);
            if (!(func instanceof Function)) {
              throw new Error("The model has no method by the name " + binding.method);
            }

            callback = func.bind(model);
          } else {
            throw new Error("Unreachable code");
          }

          this.bindingEventManager.add(element, binding.event, callback);
        }
      },
      clone : function (view) {
        var clone = new EventBinding(view);
        clone.setBindings(A.clone(this.bindings));
        return clone;
      }
    }
  });
  Cactus.Web.Template.EventBinding = EventBinding;
})();
