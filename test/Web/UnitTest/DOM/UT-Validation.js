Cactus.UnitTest.DOM.Validation = function () {
  var log = Cactus.Dev.log;
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var Test = Cactus.Dev.UnitTest.Test;
  var Validation = Cactus.Web.Validation;
  var tag = Cactus.Web.DOM.tag;
  var $ = Cactus.Web.DOM.select;
  var Element = Cactus.Web.DOM.Element;
  var Collection = Cactus.Data.Collection;
  var setValue = Element.setValue.bind(Element);
  var getValue = Element.getValue.bind(Element);
  var $f = Cactus.Web.DOM.selectFirst;
  var JSON = Cactus.Util.JSON;
  var stringify = JSON.stringify;
  var Events = Cactus.Web.DOM.Events;
  var object = Cactus.Addon.Object;

  var tc = new TestCase("DOM.Validation");

  tc.setup = function () {
    this.validationData = {
      "bar" : {
        bar_foo : [{
          regex : /^\d+$/,
          violationMsg : "Should be all numbers."
        }, {
          regex : /^.{4}$/,
          violationMsg : "Should be 4 characters long."
        }],
        bar_baz : [{
          regex : /^[a-z]+$/,
          violationMsg : "Should be all letters."
        }]
      }
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" name="foo" class="foo" id="bar_foo" value="1234">\
      <div id="bar_foo_error"></div>\
      <input type="text" name="baz" class="baz" id="bar_baz" value="aoeu">\
      </form>\
      ';
    this.form = $f("form", div);
    this.validation = new Validation(this.validationData.bar, this.form);
    this.foo = $f(".foo", this.form);
    this.baz = $f(".baz", this.form);
  };

  tc.add(function () {
    var form = this.form;
    var v = this.validation;
    var foo = this.foo;
    var baz = this.baz;

    // Validate a text field.
    this.assert(v.isValid("bar_foo"), "foo is not valid.");
    setValue(foo, "aoeu");
    this.assertFalse(v.isValid("bar_foo"), "foo is valid.");

    // Validate a second text field.
    this.assert(v.isValid("bar_baz"), "baz is not valid.");
    setValue(baz, "1234");
    this.assertFalse(v.isValid("bar_baz"), "baz is valid.");
    // Validate all fields.
    this.assertFalse(v.allValid(), "All fields are valid.");
    setValue(foo, "1234");
    setValue(baz, "aeou");
    this.assert(v.allValid(), "Not all fields are valid.");
    // Validate foo with two constraints.

    // Valid.
    setValue(foo, "1234");
    this.assert(v.isValid("bar_foo"), "foo is not valid.");
    // Not all digits.
    setValue(foo, "aoeu");
    this.assertFalse(v.isValid("bar_foo"), "foo is valid.");
    // Too long.
    setValue(foo, "12345");
    this.assertFalse(v.isValid("bar_foo"), "foo is valid.");
    // Not all digits and too long.
    setValue(foo, "aoeuaoeu");
    this.assertFalse(v.isValid("bar_foo"), "foo is valid.");

  });

  // Validation errors should be retrievable.
  tc.add(function () {
    var v = this.validation;
    var form = this.form;

    var foo = $f(".foo", form);
    var baz = $f(".baz", form);
    var violationMessages;

    setValue(foo, "aoeuaoeu");
    setValue(baz, "aoeu");

    v.validateVisible("bar_foo");
    violationMessages = v.getViolationMessagesFor("bar_foo");

    this.assertEqual(2, violationMessages.length);
    this.assert(Collection.hasValue(violationMessages,
                                    "Should be all numbers."),
                  "\"Should be all numbers.\" was not included as a " +
                "validation error");
    this.assert(Collection.hasValue(violationMessages,
                                    "Should be 4 characters long."));

    setValue(foo, "1234");

    v.validateVisible("bar_foo");
    this.assertEqual(0, v.getViolationMessagesFor("bar_foo").length,
                     "Validation of foo returned violation messages.");

    this.assert(v.allValid(), "Not all fields are valid");

    var violationMessages = v.validateAll();
    this.assert(object.isEmpty(v.getViolationMessages()),
                "violationMessages is not empty.");
    this.assert(v.allValid());

    setValue(foo, "aoeuaoeu");
    setValue(baz, "1234");

    v.validateAll();
    var violationMessages = v.getViolationMessages();

    this.assert("bar_foo" in violationMessages,
                "foo not in violationMessages.");
    this.assert("bar_baz" in violationMessages,
                "baz not in violationMessages.");
    this.assertEqual(2, violationMessages.bar_foo.length);
    this.assertEqual(1, violationMessages.bar_baz.length);

  });

  // Validating all fields twice shouldn't change anything.
  tc.add(function () {
      setValue(this.foo, "1");
    this.assertFalse(this.validation.allValid());
    this.assertFalse(this.validation.allValid());
  });

  // Attach onblur events to all validation fields.
  tc.add(function () {
    var v = this.validation;
    var foo = this.foo;
    this.assert(v.isValid("bar_foo"));
    foo.value = "aoeu";
    foo.onblur();
    this.assertEqual(1, v.getViolationMessagesFor("bar_foo").length);
  });

  // Should be able to validate without the elements being attached to a form.
  tc.add(function () {
    var validationData = {
      bar_foo : [{
        regex : /^\d+$/,
        violationMsg : "Should be all numbers."
      }, {
        regex : /^.{4}$/,
        violationMsg : "Should be 4 characters long."
      }],
      bar_baz : [{
        regex : /^[a-z]+$/,
        violationMsg : "Should be all letters."
      }]
    };
    var div = tag("div");
    div.innerHTML = '\
      <input type="text" name="foo" class="foo" id="bar_foo" value="1234">\
      <div id="bar_foo_error"></div>\
      <input type="text" name="baz" class="baz" id="bar_baz" value="aoeu">\
      ';
    var root = div;
    var v = new Validation(validationData, root);
    //var foo = $f(".foo", root);
    //var baz = $f(".baz", root);

    //v.validateVisible("bar_foo");

    //this.assert(v.isValid("bar_foo"));
  });

  // Show error message in #fieldID_error if it exists and violation messages
  // exist.
  // Error messages should be printed in an UL.
  tc.add(function () {
    var form = this.form;
    var foo = this.foo;
    var baz = this.baz;
    var bar_foo_error = $f("#bar_foo_error", form);

    foo.value = "aoeu";
    foo.onblur();
    var ul = bar_foo_error.firstChild;
    this.assertEqual("ul", ul.tagName.toLowerCase());
    var li = ul.firstChild;
    this.assertEqual("li", li.tagName.toLowerCase());
    this.assertEqual("Should be all numbers.", getValue(li));

    // Don't break if error container doesn't exist.
    baz.value = "1234";
    baz.onblur();

    // Make sure error messages are removed after the validation succeeds.
    foo.value = "1234";
    foo.onblur();
    this.assertEqual("", getValue(bar_foo_error));
  });

  // Calling validate should update the view.
  tc.add(function () {
    var form = this.form;
    var foo = this.foo;
    var baz = this.baz;
    var bar_foo_error = $f("#bar_foo_error", form);
    var v = this.validation;

    foo.value = "aoeu";
    v.validateVisible("bar_foo");
    this.assert(/all numbers/.test(bar_foo_error.innerHTML),
                "Error message was not added to view error container.");
  });

  // Multiple validations should only add one error per violation.
  tc.add(function () {
    var form = this.form;
    var foo = this.foo;
    var baz = this.baz;
    var bar_foo_error = $f("#bar_foo_error", form);
    var v = this.validation;

    foo.value = "aoeu";
    v.validateVisible("bar_foo");
    v.validateVisible("bar_foo");
    this.assertEqual(1, bar_foo_error.childNodes.length);
  });

  // If a field isn't mandatory, other validation errors should not occur if
  // the field is left blank.
  tc.add(function () {
    var validationData = {
      // Marked as not mandatory.
      bar_foo : [{
        mandatory : false,
        violationMsg : ""
      }, {
        regex : /^.{4}$/,
        violationMsg : "Should be 4 characters long."
      }],

      // Marked as mandatory.
      bar_baz : [{
        mandatory : true,
        violationMsg : "Field is mandatory"
      }, {
        regex : /^.{4}$/,
        violationMsg : "Should be 4 characters long."
      }],

      // Not marked, so mandatory=false is assumed
      bar_bax : [{
        regex : /^.{4}$/,
        violationMsg : "Should be 4 characters long."
      }]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" name="foo" class="foo" id="bar_foo" value="1234">\
      <input type="text" name="baz" class="baz" id="bar_baz" value="1234">\
      <input type="text" name="bax" class="bax" id="bar_bax" value="1234">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    var foo = $f(".foo", form);

    foo.value = "";
    this.assert(validation.isValid("bar_foo"), "Empty foo is not valid.");
    foo.value = "x";
    this.assertFalse(validation.isValid("bar_foo"));
    foo.value = "xxxx";
    this.assert(validation.isValid("bar_foo"));

    var baz = $f(".baz", form);
    baz.value = "";
    validation.validateVisible("bar_baz");
    this.assertEqual(1,
                     validation.getViolationMessagesFor("bar_baz").length);
    this.assert(/mandatory/.test(
      validation.getViolationMessagesFor("bar_baz")[0]));

    baz.value = "aoeu";
    this.assert(validation.isValid("bar_baz"));

    baz.value = "ao";
    validation.validateVisible("bar_baz");
    this.assertEqual(1,
                     validation.getViolationMessagesFor("bar_baz").length);
    this.assert(/Should be 4 characters/.test(
      validation.getViolationMessagesFor("bar_baz")[0]));

    var bax = $f(".bax", form);
    bax.value = "";
    this.assert(validation.isValid("bar_bax"),
                "Validation failed: " +
                validation.getViolationMessagesFor("bar_bax").join(", "));
  });

  // Validations should be able to be based on functions as well.
  tc.add(function () {
    var validationData = {
      // Marked as not mandatory.
      bar_foo : [{
        func : function (s) {
          return s.length === 4;
        },
        violationMsg : "Should be 4 characters long."
      }]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" name="foo" class="foo"\
      id="bar_foo" value="1234">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    var foo = $f(".foo", form);

    foo.value = "";
    this.assert(validation.isValid("bar_foo"), "Empty foo is not valid.");
    foo.value = "x";
    this.assertFalse(validation.isValid("bar_foo"));
    foo.value = "xxxx";
    this.assert(validation.isValid("bar_foo"));

  });

  // It should be possible to validate that a checkbox is checked.
  // One common usage for this would be functionality for asserting that the
  // user accepts the terms of service agreement.
  tc.add(function () {
    var validationData = {
      "bar_foo" : [
        { mandatory : true, violationMsg : "Mandatory." }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="checkbox" name="foo" class="foo"\
      id="bar_foo" value="1234">\
      </form>\
      ';
    var form = $f("form", div);

    var validation = new Validation(validationData, form);
    var foo = $f(".foo", form);

    foo.checked = false;
    this.assertFalse(validation.isValid("bar_foo"),
                     "Foo should not be valid.");
    foo.checked = true;
    this.assert(validation.isValid("bar_foo"),
                "Foo should be valid.");

  });

  // If a validation exists for a non-existant element a descriptive error
  // should be thrown.
  tc.add(function () {
    var validationData = {
      "bar_foo" : [
        { mandatory : true, violationMsg : "Mandatory." }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      </form>\
      ';
    var form = $f("form", div);
    this.assertException(/could not find.+bar_foo/i, function () {
      new Validation(validationData, form);
    });

  });

  // Should send out onValidChanged.
  tc.add(function () {
    var validationData = {
      "bar_foo" : [
        { mandatory : true, violationMsg : "Mandatory."}
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo = form.elements.bar_foo;
    var validation = new Validation(validationData, form);
    var test = this;


    var triggered = false;
    validation.subscribe("ValidChanged", function (_, isValid) {
      triggered = true;
      test.assertFalse(isValid, "reported all valid");
    }, true);

    setValue(bar_foo, "");
    bar_foo.onblur();
    this.assert(triggered, "did not trigger 1");

    var triggered2 = false;
    validation.subscribe("ValidChanged", function (_, isValid) {
      triggered2 = true;
      test.assert(isValid, "all not valid reported");
    });

    setValue(bar_foo, "bar");
    bar_foo.onblur();
    this.assert(triggered2, "did not trigger 2");

    triggered2 = false;
    bar_foo.onblur();
    this.assertFalse(triggered2);

  });

  // Only send out onValidated after all elements have been validated
  // at least once.
  tc.add(function () {
    var validationData = {
      bar_foo : [{mandatory:true, violationMsg:"Mandatory"}],
      bar_baz : [{mandatory:true, violationMsg:"Mandatory"}]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      <input type="text" id="bar_baz" value="">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    var triggered = false;
    validation.subscribe("ValidChanged", function () {
      triggered = true;
    });
    this.assertFalse(triggered);
    form.elements.bar_foo.onblur();
    this.assertFalse(triggered);
    form.elements.bar_baz.onblur();
    this.assert(triggered);
  });

  // Should be able to choose if the form should be considered valid at first.
    tc.add(function () {
      var validationData = {
          bar_foo : [{mandatory:true, violationMsg:"Mandatory"}],
        bar_baz : [{mandatory:true, violationMsg:"Mandatory"}]
      };
      var div = tag("div");
      div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      <input type="text" id="bar_baz" value="">\
      </form>\
      ';
      var form = $f("form", div);
        var validation = new Validation(validationData, form, false);
      var triggered = false;
      var test = this;
      validation.subscribe("ValidChanged", function (_, isValid) {
        test.assert(isValid);
        triggered = true;
      });

      form.elements.bar_foo.value = "foo";
      form.elements.bar_foo.onblur();
      form.elements.bar_baz.value = "foo";
      form.elements.bar_baz.onblur();

      this.assert(triggered);
    });

  // If an element is added but has no validations, allValidated should still
  // be able to return true, and the field should be able to be validated.
  tc.add(function () {
    var validationData = {
      bar_foo : []
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    this.assert(validation.allValidated());

      validation.validateVisible("bar_foo");
    });

  // It should be possible to specify a custom mandatory function.
  tc.add(function () {
    var b;
    var valueOfV;
    var validationData = {
      bar_foo : [{mandatory:true, func:function(v){
        valueOfV = v;
        return b;
      }}]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      </form>\
      ';
    var form = $f("form", div);
    var bar = form.elements.bar_foo;
    var validation = new Validation(validationData, form);

    setValue(bar, "");
    b = true;
    this.assert(validation.isValid("bar_foo"), "valid");
    b = false;
    this.assertFalse(validation.isValid("bar_foo"), "invalid");
    this.assertEqual("", valueOfV);

    setValue(bar, "bar");
    b = true;
    this.assert(validation.isValid("bar_foo"), "valid2");
    b = false;
    this.assertFalse(validation.isValid("bar_foo"), "invalid2");
  });

  // Allow silent validations
  tc.add(function () {
    var validationData = {
        bar_foo : [{ mandatory : true, violationMsg : "Mandatory." }]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar = form.elements.bar_foo;
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    function getUIErrors() {
      if (!bar_foo_error.firstChild) {
        return "";
      }
      var lis = $("li", bar_foo_error);
      var errors = [];
      for (var i = 0; i < lis.length; i++) {
        errors.push(getValue(lis[i]));
      }
      return errors.join(",");
    }

    this.assertEqual("", getValue(bar));
    this.assertEqual("", getUIErrors());

    this.assertFalse(validation.validateHidden("bar_foo"));
    this.assertEqual("", getUIErrors());

    this.assertFalse(validation.validateVisible("bar_foo"));
    this.assertEqual("Mandatory.", getUIErrors());
  });

  // Custom validations that need to be triggered manually and are not bound
  // to a form element.
  tc.add(function () {
    var value = "";
      var validationData = {
          bar_foo : [{
            custom : true,
            func : function () {
              // Retrieve data lexically.
              var v = value;
              return v !== "";
            },
            violationMsg : "Mandatory."
          }]
      };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    this.assertFalse(validation.allValidated());
    validation.validateVisible("bar_foo");
    this.assert(validation.allValidated());
    this.assertFalse(validation.allValid());
    value = "x";
    validation.validateAll();
    this.assert(validation.allValid());
  });

  // Attach blur events even if custom events are present, but don't
  // if all are custom.
  tc.add(function () {
    var validationData = {
      bar_foo : [
        { func : Function.empty.returning(false),
          violationMsg : "1" },
        { custom : true, func : Function.empty.returning(true),
          violationMsg : "2" }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="bar">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo = $f("#bar_foo", form);
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    this.assertInstance(Function, bar_foo.onblur);
  });
  tc.add(function () {
    var validationData = {
      bar_foo : [
        { custom : true, func : Function.empty.returning(true),
          violationMsg : "3" }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="bar">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo = $f("#bar_foo", form);
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    this.assertFalse(bar_foo.onblur instanceof Function);
  });

  // Fail with a visible or hidden custom error message without having to add
  // a validation constraint.
  tc.add(function () {
    var validationData = {
      bar_foo : [
          { func : function (v) {
            return v == "";
          }, violationMsg : "Required." }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    validation.failHidden("bar_foo", "hidden");

    this.assertEqual(stringify(["hidden"]), stringify(
      validation.getViolationMessagesFor("bar_foo")));
      this.assertEqual("", getValue(bar_foo_error));

      // Clear the validation error.
    validation.validateVisible("bar_foo");

    validation.failVisible("bar_foo", "visible");
    this.assertEqual(stringify(["visible"]), stringify(
      validation.getViolationMessagesFor("bar_foo")));
    this.assertEqual(stringify(["visible"]),
                     stringify(getValue($f("ul", bar_foo_error))));
  });

  // A mandatory validation should fail if the value is null/undefined as well.
  tc.add(function () {
    var validationData = {
      bar_foo : [
        { mandatory : true, violationMsg : "Required." }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="radio" id="bar_foo">\
      <div id="bar_foo_error"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var bar_foo = $f("#bar_foo", form);
    var bar_foo_error = $f("#bar_foo_error", form);
    var validation = new Validation(validationData, form);

    validation.validateVisible("bar_foo");
    this.assertFalse(bar_foo.checked);
    this.assert(!validation.isValid("bar_foo"));
  });

  // A validation should be able to be marked with requireElement, which if false means the
  // validation will be removed if the element does not exist.
  tc.add(function () {
    var validationData = {
      bar_foo : [
          { mandatory : true, violationMsg : "Required.", requireElement : false }
      ]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    this.assert(validation.allValid());
  });

  // Validation func properties should be called in the scope of the validation object in order
  // to allow isValid calls.
  tc.add(function () {
    var validationData = {
        bar_foo : [{
          custom : true,
          func : function () {
            return this.isValid("bar_bax");
          },
          violationMsg : "foo"
        }],
      bar_baz : [{
        func : function () {
          return this.isValid("bar_bax");
        },
        violationMsg : "bar"
      }],
      bar_bax : []
      };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_baz" value="">\
      <input type="text" id="bar_bax" value="">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    this.assert(validation.isValid("bar_foo"));
    this.assert(validation.isValid("bar_baz"));
  });

  // Throw error message when missing func property for custom constraint.
    tc.add(function () {
      var validationData = { x : [{ custom : true }] };
      this.assertException(/constraint x\[0\]/, function () {
        return new Validation(validationData, tag("div"));
      });
    });

  // Public method to fetch value of an element.
  tc.add(function () {
    var validationData = {
      bar_foo : []
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="x">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    this.assertEqual("x", validation.getElementValue("bar_foo"));
  });

  // Enable modifications of the error container id suffix.
  tc.add(function () {
    var validationData = {
      bar_foo : [{ mandatory : true, violationMsg : "Mandatory." }]
    };
    var div = tag("div");
      div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      <div id="bar_foo_error"></div>\
      <div id="bar_foo_warning"></div>\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    validation.setErrorContainerSuffix("warning");
    validation.validateVisible("bar_foo");
    this.assertEqual(stringify(["Mandatory."]),
                     stringify(validation.getViolationMessagesFor("bar_foo")));
      this.assertEqual("", Element.getValue($f("#bar_foo_error", form)));
    this.assertEqual(stringify(["Mandatory."]),
                     stringify(Element.getValue($f("#bar_foo_warning ul", form))));
  });

  // Throw error if a validation constraint is null.
  tc.add(function () {
    this.assertException(/constraint for "a" was undefined/i,
                         function () {
                           new Validation({ a : [{mandatory:true,violationMsg:""},undefined] },
                                          tag("div", null, [tag("div", { id : "a" })]));
                         });
  });

  // violationMsg should be able to be a function returning a string.
  tc.add(function () {
    var validationData = {
        bar_foo : [{ mandatory : true, violationMsg : Function.empty.returning("foo mandatory.") }],
      bar_baz : [{ func : Function.returning(false), violationMsg : Function.empty.returning("baz mandatory.") }]
    };
    var div = tag("div");
    div.innerHTML = '\
      <form id="bar" action="/">\
      <input type="text" id="bar_foo" value="">\
      <input type="text" id="bar_baz" value="1">\
      </form>\
      ';
    var form = $f("form", div);
    var validation = new Validation(validationData, form);
    validation.validateAll();
    this.assertEqual(stringify(["foo mandatory."]), stringify(validation.getViolationMessagesFor("bar_foo")));
    this.assertEqual(stringify(["baz mandatory."]), stringify(validation.getViolationMessagesFor("bar_baz")));
  });

  // The delayed blur event should not cause failVisible to disappear after
  // that delay.
  tc.add(new Test(function () {
    Events.add(this.foo, "blur", this.validation.failVisible.bind(this.validation, "bar_foo", "Temporary message."));
    this.foo.onblur();
      // Same delay as validation should cause this call to be queued up after.
    setTimeout(this.processResults.bind(this, this.validation, this.form), 1100);
  }, function (validation, form) {
    this.assertEqual(stringify(["Temporary message."]), stringify(validation.getViolationMessagesFor("bar_foo")));
  }));

  // Store last value for fields so that a validation won't trigger again until the value changes.
  tc.add(function () {
    setValue(this.foo, "1234");
    this.foo.onblur();
    this.validation.failVisible("bar_foo", "Temporary message.");
      this.assertEqual(stringify(["Temporary message."]),
                       stringify(this.validation.getViolationMessagesFor("bar_foo")));
    this.foo.onblur();
    this.assertEqual(stringify(["Temporary message."]),
                       stringify(this.validation.getViolationMessagesFor("bar_foo")));
  });

  return [tc];
};
