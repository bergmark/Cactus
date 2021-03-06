/**
 * @file
 *
 * A List Template uses an array controller with KVC objects, a template
 * prototype and a HTML list. It displays the KVC objects through template
 * instances and reacts on changes to the array controller.
 *
 * So, use it to display several objects of the same type.
 *
 * ListTemplate restricts the type of the dataSource to
 * ArrayController<KeyValueCoding>.
 *
 * You can use the list templates with any element that can contain several
 * child elements. The most obvious examples would be lists (OL and UL) and
 * tables. It's also possible to use selects, but note that each option will
 * expect its key path to be a hash of value and text to display in the option.
 *
 * Event bindings exist for ListTemplates also. Events are bound to each list
 * item and when an event triggers on one of them, the callback passes the AC
 * along with the index of the object associated with the list item that was
 * clicked. Event bindings for ListTemplates allows the client to manipulate the
 * list itself. An example is if a list contains a "remove" button, that when
 * clicked should remove the object from the list/AC. This cannot be done
 * in a smooth manner if using only Template event bindings.
 * Therefore, use Template event bindings when manipulating the object itself,
 * and use ListTemplate event bindings when manipulating the collection.
 *
 * For styling purposes, three classnames exist for list items,
 * ".first" and ".last" is placed on the first and last element, respectively.
 * ".single" is placed on a list item when it is the only item in the list.
 * Therefore, a single element will also have the first and last classnames.
 */
Module("Cactus.Web", function (m) {
  var $ = m.select;
  var A = Cactus.Addon.Array;
  var AbstractTemplate = m.AbstractTemplate;
  var ClassNames = m.ClassNames;
  var Collection = Cactus.Data.Collection;
  var Event = m.Event;
  var EventManager = Cactus.Web.EventManager;
  var Events = m.Events;
  var JSON = Cactus.Util.JSON;
  var KVC = Cactus.Data.KeyValueCoding;
  var M = Cactus.Addon.Math;
  var Mediator = m.Mediator;
  var O = Cactus.Addon.Object;
  var Template = m.Template;
  var TypeChecker = Cactus.Util.TypeChecker;
  var tag = m.tag;

  var classNameDefinitions = {
    first : {
      className : "first",
      elementPredicate : function (view, item, index) { return index === 0; }
    },
    last : {
      className : "last",
      elementPredicate : function (view, item, index) { return index === view.childNodes.length - 1; }
    },
    single : {
      className : "single",
      shouldApply : function (view) { return view.childNodes.length === 1; },
      elementPredicate : function (view, item, index) { return true; }
    },
    even : {
      className : "even",
      elementPredicate : function (view, item, index) { return M.even(index); }
    },
    odd : {
      className : "odd",
      elementPredicate : function (view, item, index) { return M.odd(index); }
    }
  };

  var ListTemplate = Class("ListTemplate", {
    does : Mediator,
    my : {
      has : {
        modelEventNames : { init : function () { return ["Added", "Removed", "Swapped", "Replaced", "Rearranged"]; } }
      }
    },
    has : {
      /**
       * @type Array[Template] templates
       *   Currently used templates.
       */
      templates : A.new,
      /**
       * @type Collection[Hash{
       *     constructor : constructor,
       *     template : Template
       * }]
       *   The prototypes used for creating new template instances.
       */
      templatePrototypes : null,
      /**
       * @type Array[Hash]
       *   Holds event types, the subscribed object along with the
       *   subscription ID's in order to be able to remove them.
       */
      subscriptions : null,
      classNames : { required : true }
    },
    methods : {
      /**
       * @param Template templatePrototypes
       *   The template to clone to show the KVC objects in the array controller.
       *        Collection[Hash{constructor : constructor , template : Template }]
       *   Allows you to provide different templates for different KVC subclasses.
       * @param HTMLListElement view
       */
      BUILD : function (templatePrototypes, view, settings) {
        var tc = new TypeChecker({
          defaultValueFunc : O.new,
          type : {
            classNames : {
              defaultValueFunc : A.new,
              type : [{
                type : {
                  type : { type : "string" },
                  className : { type : "string", required : false }
                }
              }]
            },
            eventBindings : { type : Array, defaultValueFunc : A.new }
          }
        });
        settings = tc.parse(settings);

        settings = settings || {};
        if (templatePrototypes instanceof Array) {
          // Check the array for well-formedness.
          for (var i = 0; i < templatePrototypes.length; i++) {
            var setting = templatePrototypes[i];
            if (!(setting instanceof Object)
                || !("constructor" in setting)
                || !("template" in setting)
                || !(setting.constructor instanceof Function)
                || !(setting.template instanceof Template)) {
              throw new Error("ListTemplate: templatePrototype setting "
                              + "is malformed, got: "
                              + JSON.stringify(setting));
            }
          }

          this.templatePrototypes = templatePrototypes;
        } else if (!(templatePrototypes instanceof Template)) {
          throw new Error("ListTemplate: templatePrototypes argument should "
                          + "be a Hash or Template.");
        } else {
          this.templatePrototypes = [{
            constructor : KVC,
            template : templatePrototypes
          }];
        }
        var h = {
          view : view,
          classNames : [],
          eventBindings : settings.eventBindings
        };
        for (var i = 0; i < settings.classNames.length; i++) {
          var type = settings.classNames[i].type;
          var className = settings.classNames[i].className;
          var def = classNameDefinitions[type];
          h.classNames.push(new ListTemplate.ClassName({
              view : view,
              className : className || def.className,
              shouldApply : def.shouldApply,
              elementPredicate : def.elementPredicate
          }));
        }
        return h;
      },
      initialize : function (args) {
        // If the LT contains anything initially, remove it.
        this._clearView();

        this._createEventBindings(args.eventBindings);
      },
      clone : function () {
        throw "Not implemented";
      },
      _clearView : function () {
        var root = this.getView();
        while (root.firstChild) {
          root.removeChild(root.firstChild);
        }
      },
      /**
       * Removes all templates and clears the HTML list.
       */
      _clear : function () {
        A.empty(this.templates);
        this._clearView();
      },
      _modelDetached : function () {
        this._clear();
      },
      _modelAttached : function () {
        var model = this._getModel();
        for (var i = 0, ii = model.size(); i < ii; i++) {
          var template = this._createTemplateForObject(model.get(i));
          this.templates.push(template);
          this.getView().appendChild(template.getView());
        }
        for (i = 0; i < this.classNames.length; i++) {
          this.classNames[i].attach(model);
        }
      },
      /**
       * Clears the templates and creates new ones.
       */
      refresh : function () {
        this._modelDetached();
        this._modelAttached();
      },
      /**
       * Attaches .first and .last class names to the first and last element
       * of the HTML List, respectively. Also makes sure no other LI's have
       * this class name.
       */
      _updateClassNames : function () {
        for (var i = 0; i < this.classNames.length; i++) {
          this.classNames[i].update();
        }
      },
      /**
       * @param natural controllerIndex
       *   The index of an object in the array controller.
       * @return HTMLLIElement
       *   The LI at the specified index.
       */
      getListItem : function (controllerIndex) {
        if (controllerIndex < 0) {
          throw new Error("controllerIndex negative.");
        }
        if (controllerIndex >= this.getView().childNodes.length) {
          throw new Error("controllerIndex too high.");
        }
        return this.getView().childNodes [controllerIndex];
      },
      onAddedTriggered : function (arrayController, object, index) {
        var template = this._createTemplateForObject(this._getModel().get(index));
        this.templates.splice(index, 0, template);

        var append = index === this._getModel().size() - 1;

        if (append) {
          this.getView().appendChild(template.getView());
        } else {
          this.getView().insertBefore(template.getView(), this.getListItem(index));
        }
        this._updateClassNames();
      },
      onRearrangedTriggered : function (arrayController) {
        this.refresh();
      },
      onRemovedTriggered : function (arrayController, object, controllerIndex) {
        var item = this.getListItem(controllerIndex);
        this.getView().removeChild(item);
        this._updateClassNames();
      },
      onSwappedTriggered : function (arrayController, indexA, indexB) {
        var a = this.getListItem(indexA);
        var b = this.getListItem(indexB);
        this.getView().insertBefore(b, a);

        if (indexB === this.getView().childNodes.length - 1) {
          this.getView().appendChild(a);
        } else {
            var after = this.getListItem (indexB);
          this.getView().insertBefore(a, after);
        }
        this._updateClassNames();
      },
      onReplacedTriggered : function (arrayController, index, oldObject, newObject) {
        var template = this._createTemplateForObject (newObject);
        var li = template.getView();
        this.templates[index] = newObject;
        this.getView().replaceChild(li, this.getListItem(index));
        this._updateClassNames();
      },
      /**
       * Clones a template and binds it to the object.
       *
       * @param KeyValueCoding object
       * @return Template
       */
      _createTemplateForObject : function (object) {
        var settings = this.templatePrototypes;
        var setting;
        for (var i = 0; i < settings.length; i++) {
          setting = settings[i];
          // KVC isn't a superclass of any of the classes implementing its
          // interface. But setting KVC as the constructor should match
          // any of these object.
          if (setting.constructor === KVC) {
            return Template.create(setting.template, {
              kvcBinding : object
            });
          }
          if (object instanceof setting.constructor) {
            return Template.create(setting.template, {
              kvcBinding : object
            });
          }
        }
        throw new Error("ListTemplate:_createTemplateForObject: "
                        + "Could not find appropriate constructor for KVC: "
                        + JSON.stringify(object));
      },
      /**
       * Event Bindings on a ListTemplate operates by catching propagating
       * events from the inner templates. The method calls invoke methods
       * on the ListTemplate, passing along the index of the template where
       * the event occured, and the event object. The same arguments are
       * passed to callbacks.
       */
      _createEventBindings : function (bindings) {
        var that = this;
        var view = that.getView();
        Collection.each (bindings, function (binding) {
          binding.event = binding.event || "click";

          Events.add(that.getView(), binding.event, function (e) {
            var ev = new Event(e);

            // Traverse up to the root of the sub template so we know
            // which list item had its event triggered.
            var el = ev.getTarget();
            while (el.parentNode !== view) {
              el = el.parentNode;

              // The template has been removed from the list template,
              // cancel.
              if (!el) {
                return;
              }
            }

            // Check the index of this list item.
            var elIndex = 0;
            for (;elIndex < view.childNodes.length; elIndex++) {
              if (view.childNodes [elIndex] === el) {
                break;
              }
            }

            // Make sure the element that the event triggered on matches
            // the given selector.
            if ($(binding.selector,
                  that.getView().childNodes[elIndex])[0]
                !== ev.getTarget()) {
              return;
            }

            if (binding.callback) {
              binding.callback(that._getModel(), elIndex, e);
            } else {
              that._getModel()[binding.method](elIndex);
            }
          });
        });
      }
    }
  });

  ListTemplate.create = function (template, view, settings) {
    settings = settings || {};

    var listTemplate = new ListTemplate(template, view, {
      eventBindings : settings.eventBindings,
      classNames : [
        { type : "first", className : settings.firstClassName },
        { type : "last", className : settings.lastClassName },
        { type : "single", className : settings.singleClassName },
        { type : "even", className : settings.even },
        { type : "odd", className : settings.odd }
      ]
    });

    if (settings.arrayController) {
      listTemplate.attach(settings.arrayController);
    }

    return listTemplate;
  };
  ListTemplate.extend(AbstractTemplate);

  m.ListTemplate = ListTemplate;
});
