/**
 * @file
 *  An abstract role for a mediator class synchronizing Model and View.
 *
 *  Both Model and View must be completely independent of the Mediator.
 *  This is important for separation, but it requires that both Model and
 *  View has support for notifying the Mediator of changes (ala Observer
 *  pattern).
 *
 *  The Mediator is attached to a static view on construction and can later
 *  be bound to a model. The view will persist but the model may be changed
 *  by calling attach/detach.
 *
 *  Mediators may have other mediator aggregates that handle either parts of
 *  the behavior (There may be one mediator for binding a plain JS object to
 *  a HTML form, delegating rendering of input fields to other CheckboxMediator
 *  and so on.
 *
 *  The first use case for the Mediator was to synchronize KeyValueObjects with
 *  the DOM with the Template class. Each KVO has KeyValuePaths for its
 *  properties which are then matched against HTML class names in the DOM in
 *  a 1-to-1 mapping.
 *
 *  The Template then has Mediator aggregates for various functionality, such as
 *  transforming values between the two representations (Model and View) and
 *  adding HTML class names for CSS styling.
 */
Module("Cactus.Web", function (m) {
  var A = Cactus.Addon.Array;
  var EventManager = Cactus.Web.EventManager;

  Role("Mediator", {
    does : m.ViewHandler,
    /**
     * _modelAttached:
     *   Called when the model is set. Subclasses should refresh the
     *   view at this point. Call occurs after detach if model was already set.
     *
     * _modelDetached:
     *   Called before the model is unset or replaced. Subclasses should remove
     *   any bindings to the model and remove any object specific bindings to the
     *   View. Call occurs before attach if model is to be set again.
     */
    requires : ["_modelAttached", "_modelDetached"],
    my : {
      has : {
        modelEventNames : { init : A.new }
      }
    },
    has : {
      /**
       * @type Model
       *   The data that should be presented in the View.
       */
      model : null,
      modelEventManager : { init : function () { return new EventManager(); } }
    }, methods : {
      /**
       * Replaces the model object and calls refresh() to redraw the view.
       *
       * @param Model model
       */
      attach : function (model) {
        if (this.hasModel() && this._getModel() === model) {
          return;
        }
        if (this.hasModel()) {
          this.detach();
        }
        this.model = model;
        this._addSubscriptions();
        this._modelAttached();
      },
      _addSubscriptions : function () {
        for (var i = 0; i < this.my.modelEventNames.length; i++) {
          this.modelEventManager.add(this._getModel(), this.my.modelEventNames[i], this);
        }
      },
      __checkModel : function () {
        if (!this.hasModel()) {
          throw new Error("Mediator: Model is not set");
        }
      },
      detach : function () {
        this.__checkModel();
        this.modelEventManager.detach();
        this.model = null;
        this._modelDetached();
      },
      /**
       * This method is protected since the Mediators client should itself
       * keep track of which object is bound, if that's important.
       *
       * Throws an Error if the model isn't set.
       *
       * @return Model
       */
      _getModel : function () {
        this.__checkModel();
        return this.model;
      },
      /**
       * @return boolean
       */
      hasModel : function () {
        return !!this.model;
      }
    }
  });
});
