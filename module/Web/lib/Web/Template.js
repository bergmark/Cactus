/**
 * @file

A template is a collection of HTMLElements that is bound to an object
implementing KeyValueCoding so that any changes in the object is
reflected in the DOM. A template has a reference to a root node and
realizes the bindings to the KVC object by transforming class names of
HTMLElements into keyPaths. For example, when the class name "a_b"
occurs in the html it will check if the key path "a.b" exists on the
object, if it does the value will be fetched and inserted
appropriately (depending on what kind of element and value type we are
working with.) A listener is added to the root object, and every time
it changes, the view (template) will be notified and will try to update
itself.

Templates can be constructed in three different ways,
by:
* Cloning an existing template (Prototype pattern)
* Getting an existing DOM structure, which is then directly used to display
  data. Clone it using cloneNode(true) if you want a new structure to operate
  on.
* Getting a string of HTML, which is then converted to DOM nodes

Implementation notes:
Template restricts the type of bound objects to KeyValueCoding.

Here's an example:

We want to print some text for each article written by our users, the
information we need to display is
* The title of the article
* The name of the author

We create a template from a string of HTML (note that create should be
used over the regular constructor):

var template = Template.create('<div><h1 class="title"></h1><p>Hello\
there, <span class="user_name"></span></p></div>');

A few things are important here:
* A root element has to exist, here the div acts as one

* We have marked the elements we want to give dynamic values with
  class names

* We could assign class names only for css styling. As long as they
  don't match key paths on our KVC object, they won't interfere with
  our KVO (Key Value Observing).

* Several class names may be assigned to an element, but if several
  key paths are assigned, the behavior is undefined. That said, if
  there are several class names but only one matches a key path, it
  will work as expected.

Now the variable `template` holds a reference to our template, but
since we might want to use it again in other places we will consider
it to be our prototypical instance, and we clone it if we wan't to use
it to display data.

Let's consider the KVC-object, we have articles and authors. We could
consider both articles and authors to be immutable value objects for
this simple example. So the relation could be a one-way aggregation
where an Article has an Author. Code:

Class("Author", {
  does : KVC,
  has : { name : null }
})
Class("Article", {
  does : KVC,
  has : { title : null, author : null }
});

Let's create an article now:

var article = new Article({ title : "The Title", author : new Author({ name : "Adam" }) });


now we have a template along with a data structure to display, let's
append the template's DOM structure to our document and bind the
article to it:

template.attach(article);
document.body.appendChild(template.getView());

if we extract the html from the template we will ge the following:
template.getView().innerHTML
=> "<div><h1 class="title">The Title</h1><p>Hello\
there, <span class="user_name">Adam</span></p></div>"

Only  this  functionality  would  surely  be easy  to  implement  from
scratch, but what happens when we change the article object?

article.setValue("author.name", "Burt");
template.getView().innerHTML
=> "<div><h1 class="title">The Title</h1><p>Hello
there, <span class="user_name">Burt</span></p></div>"


= Event Bindings =

Event bindings is an easy way to bind events to your template.

Some of them are added implicitly, if your KVC object has a method name `foo`
and you give a button class="foo" its onclick will be bound to the foo method.

Bindings are also added for form elements. For instance, onchange handlers are
added to input text fields and when triggered the corresponding KVC value is
updated as well.

If you want to add an event that isn't added implicitly you can do so by using
the createEventBindings method:

template.createEventBindings([{
    selector : ".x",
    event : "click",
    callback : function () {
        alert(".x was clicked");
    }
},{
    selector : ".y",
    event : "mouseover",
    method : "doSomething"
}]);

This will set the onclick of .x to the specified function and the mouseover of
.y will trigger the doSomething method on the bound KVC object.


Common for all event bindings is that they are cloned when templates are created
out of a prototype and that they are updated (if appropriate) when the bound KVC
object is exchanged.

An error will be thrown if you create an event binding with a selector that does
not exist below the root element. This error will however not be thrown until a
KVC is bound to the template.

= Widgets =

A widget is assigned a key path and takes up the first DOM node
matching the key path's class name. It takes ownership of the node and
any changed key values are forwarded to it. This allows widgets to
provide a richer view of properties. As an example, you may implement a Slider
Widget that let's the user drag a bar to select enumerated values. Any change
in the KVC will be displayed in the widget, and vice versa. But note that
Widgets updating the KVC object hasn't been implemented yet.

Note: To create a Widget, start by subclassing MVC.View.Widget.
Further documentation is available in its source file.

= Modes =

A mode restricts how HTML elements associated with keypaths behave,
there are three different modes (all expressed from the point of view
of the view):

* "read":
    The field is read-only and changes to the model propagates to the
    element, but not vice versa.
* "write":
    The field is writable, changes in the view will propagate to the
    model, but not vice versa.
* "both":
    Model can write to view, and view can write to model.

If no mode is specified, "both" is used.

If you want no communication between model and view, don't specify a
mode, but add the keypath to skipKeyPaths (or change the class name of
the HTML element).

= Handling null values =

It's usually a bad idea to be able to set a value to null, this can
break keypath traversal among other things. For convenience, null
values are printed to the UI as "".  If you wish to change this
behavior, add a value transformer (transformers will be called with
the null value, before the transformation has taken place.)

*/
Module("Cactus.Web", function (m) {
  var $ = m.select;
  var $f = m.selectFirst;
  var A = Cactus.Addon.Array;
  var ArrayController = Cactus.Data.ArrayController;
  var C = Cactus.Data.Collection;
  var ClassNames = m.ClassNames;
  var Dictionary = Cactus.Data.Dictionary;
  var Element = m.Element;
  var EventManager = m.EventManager;
  var Events = Cactus.Web.Events;
  var KVC = Cactus.Data.KeyValueCoding;
  var O = Cactus.Addon.Object;
  var TypeChecker = Cactus.Util.TypeChecker;
  var Widget = m.TemplateWidget;
  var stringToDom = Cactus.Web.stringToDom;
  var tag = m.tag;
  var Mediator = Cactus.Web.Mediator;

  var Template = Class("Template", {
    does : Mediator,
    my : {
      has : {
        modelEventNames : { init : function () { return ["ValueChanged"]; } }
      }
    },
    has : {
      valueTransformers : { required : true },
      /**
       * @type Dictionary<KeyPath,[HTMLElement]>
       *   Stores references between keypaths and their respective elements.
       */
      elements : { init : function () { return new Dictionary(); } },
      /**
       * @type EventManager
       *   Keeps track of events bound as Write Events.
       */
      writeEventManager : { init : function () { return new EventManager(); } },
      /**
       * @type Array
       *   Stores the associations between selectors and widgets.
       */
      widgets : { init : A.new },
      /**
       * @type Array<KeyPath>
       *   All keypaths found in the view that existed in the model
       */
      keyPaths : { init : A.new },
      skipKeyPaths : { init : A.new },
      mode : { init : function () { return new Template.Mode(); } },
      classNameConditions : { required : true },
      eventBindings : { required : true },
      /**
       * @type string
       * The delimeter used to separate class names into key paths.
       * Default is "_", meaning class name "a_b" would translate to the key
       * path "a.b".
       * May not be changed after Template creation.
       */
      classNameDelimiter : "_",
      /**
       * @type string
       *  This prefix is expected on all class names.
       */
      classNamePrefix : ""
    },
    before : {
      attach : function (model) {
        if (!KVC.implementsInterface(model)) {
          throw new Error("Supplied data source is not KVC compliant.");
        }
      }
    },
    methods : {
      BUILD : function (view, settings) {
        if (!view) {
          throw new Error("view was: %s".format(view));
        }
        return {
          view : view,
          classNameConditions : new Template.ClassNameConditions(view),
          eventBindings : new Template.EventBinding(view),
          valueTransformers : new Template.Transformer(view),
          classNameDelimiter : settings.classNameDelimiter || "_",
          classNamePrefix : settings.classNamePrefix || "",
          skipKeyPaths : settings.skipKeyPaths || []
        };
      },
      initialize : function () {
        this.allElements = [];
        var elements = C.toArray($("*", this.getView())).concat(this.getView());
        for (var i = 0; i < elements.length; i++) {
          var classNames = C.select(ClassNames.get(elements[i]), this._classNameIsPossibleKeyPath.bind(this));
          // Fetch all possible key paths, key paths not having the
          // specified class name prefix are excluded.
          var keyPaths = C.map(classNames, this._classNameToKeyPath.bind(this));
          keyPaths = C.reject(keyPaths, this.__shouldSkipKeyPath.bind(this));
          this.allElements.push({
            element : elements[i],
            classNames : classNames,
            keyPaths : keyPaths
          });
        }
      },
      /**
       * Turns a class name into its corresponding key path.
       *
       * @param string className
       * @return string
       */
      _classNameToKeyPath : function (className) {
        className = className.replace(this.classNamePrefix, "");
        return className.replace(this.classNameDelimiter, ".", "g");
      },
      /**
       * Turns a key path into its corresponding CSS class name.
       *
       * @param string keyPath
       * @return string
       */
      _keyPathToClassName : function (keyPath) {
        return this.classNamePrefix + keyPath.replace(".", this.classNameDelimiter, "g");
      },
      /*
       * @param string className
       */
      _classNameIsPossibleKeyPath : function (className) {
        if (!this.classNamePrefix) {
          return true;
        }
        // Assumption: prefix has no characters regex considers special.
        return new RegExp("^" + this.classNamePrefix).test(className);
      },
      /**
       * Clears elements and keyPaths and iterates through all elements under
       * the root and sets any values that can be found by getting key paths
       * from the class names of the nodes.
       */
      refresh : function () {
        // Loop through all elements.
        for (var el, i = 0; el = this.allElements[i]; i++) {
          var element = el.element;
          var keyPaths = el.keyPaths;

          // Loop through all key paths for the current element.
          for (var j = 0; j < keyPaths.length; j++) {
            var keyPath = keyPaths [j];

            // If the KVC object has a KP that matches the one
            // found in the template, the HTML element is
            // given the value of that key path.
            if (keyPath && this._getModel().hasKeyPath(keyPath)) {

              // Store the key path along with the HTML element.
              this._addBindingData(keyPath, element);

              this._addWriteEvent(element, keyPath);

              // Set the value.
              this._setValue(keyPath, this._getModel().getValue (keyPath));
            }

          }
        }

        this.eventBindings.attach(this._getModel());
      },
      /**
       * Adds information that signifies which elements listen to which
       * key paths. The method may be called several times for the same
       * key path.
       *
       * @param string keyPath
       * @param HTMLElement element
       */
      _addBindingData : function (keyPath, element) {
        this.elements.add(keyPath, element);
      },
      /**
       * Adds event bindings for form elements so changes in them are
       * propagated to the KVC object and then back to the for element.
       *
       * @param HTMLElement element
       *   The form element to add the binding to.
       * @param string keyPath
       *   The keyPath to bind changes to.
       */
      _addWriteEvent : function (element, keyPath) {
        var template = this;
        var model = this._getModel();

        var addEvent = this.writeEventManager.add.bind(this.writeEventManager);

        function addButtonEvent () {
          addEvent(element, "click", model.getValue(keyPath).bind(model).returning(false));
        }

        var setValue = function (value) {
          if (!this.mode.mayWriteToModel(keyPath)) {
            return;
          }
          if (value === undefined) {
            value = Element.getValue(element);
          }
          value = this.valueTransformers.backwardTransform(keyPath, element, value);
          template._getModel().setValue(keyPath, value);
        }.bind(this);
        var setValueNone = setValue.none();


        switch (element.tagName.toLowerCase()) {
          case "input":
          switch (element.type) {
            case "checkbox":

            // If the key value is a bool the checkbox should
            // present that bool, instead of expecting an
            // array of values.
            if (typeof template._getModel().getValue(keyPath) === "boolean") {
              addEvent(element, "click", function () {
                setValue(this.checked);
              });
            } else {
              addEvent(element, "click", setValueNone);
            }
            break;

            case "radio":
            var elements = [element];
            if (element.form) {
              elements = element.form[element.name];
            }
            function f() {
              setValue(Element.getValue(this));
            }
            for (var i = 0; i < elements.length; i++) {
              addEvent(elements[i], "click", f);
            }
            break;

            case "text":
            case "password":
            var f = element.onchange;
            addEvent(element, "change", setValueNone);
            break;

            case "button":
            case "submit":
            addButtonEvent();
            break;
          }
          break;
          case "select":
          addEvent(element, "change", setValueNone);
          break;

          case "button":
          addButtonEvent();
          break;

          case "textarea":
          addEvent(element, "change", setValueNone);
          break;
        }
      },
      /**
       * Adds a value transformer or replaces an existing one.
       */
      setValueTransformer : function (option) {
        this.valueTransformers.add(option);

        // If a value transformer is added/modified when a data source
        // binding exists the value is updated immediately.
        if (!this.hasModel()) {
          return;
        }
        if (option.selector) {
          this._updateElements($(option.selector, this.getView()));
        } else if (option.keyPath) {
          this.update(option.keyPath);
        }
      },
      _modelDetached : function () {
        this.writeEventManager.detach();
      },
      _modelAttached : function () {
        this.classNameConditions.attach(this._getModel());
        this.eventBindings.attach(this._getModel());
        this.elements = new Dictionary();
        this.refresh();
        this._triggerOnBound();
      },
      /**
       * Updates the DOM for a specific key path.
       *
       * @param string keyPath
       */
      update : function (keyPath) {
        this._setValue(keyPath, this._getModel().getValue(keyPath));
      },
      /**
       * Sets the given value to the given key path in the DOM. Uses
       * DOM.Element to support different kinds of elements.
       * If the template does not have the given key path, no action is taken.
       * Does not set the value if the key path contains a function.
       *
       * @param string keyPath
       * @param mixed value
       */
      _setValue : function (keyPath, value) {
        // > Why does this have to be at the top of the method body?
        this.classNameConditions.set(keyPath);

        if (!this.elements.hasKey(keyPath)) {
          return;
        }

        if (value instanceof Function) {
          return;
        }

        if (!this.mode.mayWriteToView(keyPath)) {
          return;
        }

        var transformedValue = this.valueTransformers.forwardForKeyPath(keyPath, value);

        for (var i = 0, elements = this.elements.get(keyPath); i < elements.length; i++) {
          var element = elements[i];
          var selectorTransformedValue = this.valueTransformers.forwardForElement(element, transformedValue);

          // null will be printed as the empty string, to make the behavior
          // consistent between browsers (IE prints as "null", others print as "").
          if (selectorTransformedValue === null) {
            selectorTransformedValue = "";
          }
          if (this._elementHasWidget(element)) {
            this._getWidgetByElement(element).setValue(selectorTransformedValue);
          } else {
            Element.setValue(element, selectorTransformedValue);
          }
        }
      },
      /**
       * The template must be bound to a data source for this method to work.
       *
       * @param HTMLElement element
       *   An element in the template that has a matching key path.
       * @return string
       *   The matching key path.
       */
      _findKeyPathForElement : function (element) {
        if (!this.hasModel()) {
          throw new Error("Template:_findKeyPathForElement: "
                          + "Template not bound to a data source.");
        }
        // Look up the value in the dictionary.
        // > Dictionary:hasValue when implemented.
        var keyPath = this.elements.findKey(element);
        if (keyPath !== null) {
          return keyPath;
        }
        throw new Error("Template:_findKeyPathForElement: "
                        + "Could not find key path for element "
                        + "&lt;%s class=\"%s\"&gt;".format(element.tagName, element.className));
      },
      /**
       * @param Array[HTMLElement] elements
       *   Elements in the table to update values for, using both key path
       *   transformers and selector transformers.
       */
      _updateElements : function (elements) {
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];

          var vt = this.valueTransformers;

          var keyPath = this._findKeyPathForElement(element);
          var value = this._getModel().getValue(keyPath);
          value = vt.forwardForKeyPath(keyPath, value);
          value = vt.forwardForElement(element, value);
          Element.setValue(element, value);
        }
      },
      /**
       * Updates the html element correspending to
       * an updated value in the KVC structure.
       *
       * @param KeyValueCoding object
       *   The updated object.
       * @param string keyPath
       *   The path to the value that changed
       */
      onValueChangedTriggered : function (object, keyPath) {
        this._setValue(keyPath, object.getValue(keyPath));

        // Find all keypaths that have keyPath as their prefix and update
        // them as well.
        for (var i = 0, keys = this.elements.keys(); i < keys.length; i++) {
          // If keys[i] is a prefix of keyPath it needs to be updated.
          if (keys[i].hasPrefix(keyPath)) {
            this.update(keys[i]);
          }
        }
      },
      /**
       * Copies the template and returns the new instance.
       * The new instance will not be bound to any data object.
       *
       * @return Template
       */
      clone : function () {
        var view = this.getView().cloneNode(true);
        var newTemplate = new Template(view, {
          classNameDelimiter : this.classNameDelimiter,
          classNamePrefix : this.classNamePrefix,
          skipKeyPaths : A.clone(this.skipKeyPaths)
        });

        // Value transformers.
        newTemplate.valueTransformers = this.valueTransformers.clone(view);

        // Modes.
        newTemplate.mode = this.mode.clone();

        // Widgets.
        for (var i = 0; i < this.widgets.length; i++) {
          var settings = this.widgets[i];
          newTemplate.addWidget(settings.selector, settings.widget.clone());
        }


        newTemplate.classNameConditions = this.classNameConditions.clone(view);

        // Event bindings.
        newTemplate.eventBindings = this.eventBindings.clone(view);

        newTemplate.setOnBound(this.onBound);

        return newTemplate;
      },
      createEventBindings : function (bindings) {
        if (!(bindings instanceof Array)) {
          throw new Error("MVC.View.Template:createEventBindings:" +
                          "Argument to createEventBindings is not an array.");
        }
        this.eventBindings.setBindings(bindings);
      },

      // Widgets.
      /**
       * Adds a widget to the template. It will take control over the
       * specified key path (or selector and the associated DOM node.
       *
       * Cloning the template will clone the widgets as well.
       *
       * @param string selector
       * @param Widget widget
       */
      addWidget : function (selector, widget) {
        var widgetRoot = $f(selector, this.getView());

        if (!widgetRoot) {
          throw new Error("Template:addWidget: Need a selector %s."
                          .format(selector));
        }

        widget.attach(widgetRoot);
        this.widgets.push({
          selector : selector,
          widget : widget,
          element : widgetRoot
        });

        if (this.hasModel()) {
          var keyPath = this._findKeyPathForElement(widgetRoot);
          widget.setValue(
            this._getModel().getValue(keyPath));
        }
      },
      /**
       * @param HTMLElement element
       * @return boolean
       *   Whether an element is owned by a widget.
       */
      _elementHasWidget : function (element) {
        for (var i = 0; i < this.widgets.length; i++) {
          var widgetElement = this.widgets[i].element;
          if (element === widgetElement) {
            return true;
          }
        }
        return false;
      },
      /**
       * Finds the widget that owns the specified element, throws an error
       * if the element isn't found, you can check if it exists by using
       * _elementHasWidget.
       *
       * @param HTMLElement element
       * @return Widget
       */
      _getWidgetByElement : function (element) {
        for (var i = 0; i < this.widgets.length; i++) {
          var widgetElement = this.widgets[i].element;
          var widget = this.widgets[i].widget;
          if (element === widgetElement) {
            return widget;
          }
        }
        throw new Error("Template:_getWidgetByElement: The specified " +
                        "element has no widget associated with it.");
      },

      __shouldSkipKeyPath : function (keyPath) {
        return C.hasValue(this.skipKeyPaths, keyPath);
      },
      onBound : Function.empty,
      _triggerOnBound : function () {
        this.onBound(this, this._getModel());
      },
      setOnBound : function (func) {
        this.onBound = func;
      },
      addClassNameCondition : function (keyPath, className, negate) {
        this.classNameConditions.add(keyPath, className, negate);
      }
    }
  });

  /**
   * A cleaner way of setting up templates.
   *
   * @param HTMLElement/string/Template
   * @param optional Hash settings = {}
   *   See Options defintion below.
   * @return Template
   */
  Template.create = function (source, settings) {
    if (!source) {
      throw new Error("Template source is null or undefined");
    }
    var options = new TypeChecker({
      defaultValueFunc : function () { return {}; },
      type : {
        classNameDelimiter : { type : "string", required : false },
        eventBindings : {
          defaultValueFunc : function () { return []; },
          type : [{
            type : {
              event : { defaultValue : "click", type : "string" },
              selector : { type : "string" },
              method : { required : false, type : "string" },
              callback : { required : false, type : Function }
            }
          }]
        },
        classNameConditions : {
          defaultValueFunc : function () { return []; },
          type : [{
            type : {
              keyPath : { type : "string" },
              className : { type : "string" },
              negate : { type : "boolean", defaultValue : false }
            }
          }]
        },
        classNamePrefix : { type : "string", required : false },
        modes : {
          defaultValueFunc : function () { return []; },
          type : [{
            type : {
              keyPath : { type : "string" },
              mode : { type : "string" }
            }
          }]
        },
        valueTransformers : {
          defaultValueFunc : A.new,
          type : [{
            type : {
              // Must specify keyPath xor selector.
              keyPath : { required : false, type : "string" },
              selector : { required : false, type : "string" },
              forward : { required : false, type : Function },
              backward : { required : false, type : Function }
            }
          }]
        },
        onBound : { type : Function, required : false },
        skipKeyPaths : { type : [{ type : "string" }], required : false },
        kvcBinding : { type : Object, required : false },
        widgets : {
          defaultValueFunc : A.new,
          type : [{
            type : {
              selector : { type : "string" },
              widget : { type : Widget }
            }
          }]
        }
      }
    });
    settings = options.parse(settings);

    var template;
    if (source instanceof Template) {
      template = source.clone();
    } else if (typeof source === "string") {
      template = new Template(stringToDom(source), {
        classNameDelimiter : settings.classNameDelimiter,
        classNamePrefix : settings.classNamePrefix,
        skipKeyPaths : settings.skipKeyPaths
      });
    } else if ("tagName" in source) {
      template = new Template(source, {
        classNameDelimiter : settings.classNameDelimiter,
        classNamePrefix : settings.classNamePrefix,
        skipKeyPaths : settings.skipKeyPaths
      });
    }

    if (!template) {
      throw new Error("Invalid template source specified");
    }

    var v = settings.valueTransformers;
    for (var i = 0; i < v.length; i++) {
      if ("keyPath" in v[i]) {
        template.setValueTransformer({
          keyPath : v[i].keyPath,
          forward : v[i].forward,
          backward : v[i].backward
        });
      } else if ("selector" in v[i]) {
        template.setValueTransformer({
          selector : v[i].selector,
          forward : v[i].forward,
          backward : v[i].backward
        });
      } else {
        throw new Error("Value transformers must have a key path or selector.");
      }
    }
    v = settings.classNameConditions;
    for (i = 0; i < v.length; i++) {
      template.addClassNameCondition(v[i].keyPath, v[i].className, v[i].negate);
    }
    v = settings.widgets;
    for (i = 0; i < v.length; i++) {
      template.addWidget(v[i].selector, v[i].widget);
    }
    if (settings.eventBindings.length > 0) {
      template.createEventBindings(settings.eventBindings);
    }
    if (settings.onBound) {
      template.setOnBound(settings.onBound);
    }
    for (i = 0; i < settings.modes.length; i++) {
      template.mode.set(settings.modes[i].keyPath, settings.modes[i].mode);
    }
    // Note: Binding has to occur last if all options should
    // be immediately taken into account.
    if (settings.kvcBinding) {
      v = settings.kvcBinding;
      template.attach(v);
    }

    return template;
  };
});
