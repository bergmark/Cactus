Module("Cactus.Web.Template", function () {
  var A = Cactus.Addon.Array;
  var EventManager = Cactus.Web.EventManager;
  var $f = Cactus.Web.selectFirst;
  var Mediator = Cactus.Web.Mediator;

  var EventBinding = Class("EventBinding", {
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
      /**
       * Stores settings for binding events.
       *
       * Note: The event bindings are not attached until the template is bound
       * to a KVC object.
       *
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
});

