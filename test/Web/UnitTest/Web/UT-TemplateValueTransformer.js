Cactus.UnitTest.Web.TemplateValueTransformer = function () {
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var Test = Cactus.Dev.UnitTest.Test;
  var ValueTransformer = Cactus.Web.ValueTransformer;
  var KVC = Cactus.Data.KeyValueCoding;
  var Template = Cactus.Web.Template;
  var $ = Cactus.Web.select;
  var $f = Cactus.Web.selectFirst;
  var Element = Cactus.Web.Element;

  var tc = new TestCase("Web.TemplateValueTransformer");

  var O = Class({
    does : KVC,
    has : {
      x : null,
      y : null
    },
    methods : {
      BUILD : function (x, y) {
        return {
          x : x || 1,
          y : y || 2
        };
      },
      setY : function (y) {
        this.y = y + 1;
      },
      getY : function () {
        return this.y * -1;
      }
    }
  });

  function get(template, selector) {
    return $f(selector, template.getRootElement());
  }
  function valueOf(template, selector) {
    return parseInt(Element.getValue(get(template, selector)), 10);
  }

  // Test value transformers.
  tc.add (new Test (null, function () {
    var o = new O();

    var t = Template.create('<div>'
                            +  '<h1 class="x"></h1>'
                            +  '<h2 class="y"></h2>'
                            + '</div>');
    t.bindTo(o);
    var root = t.getRootElement();

    var h1 = $f("h1", root);
    var h2 = $f("h2", root);

    t.setValueTransformer({
      keyPath : "x",
      forward : function (v) {
        return v * 2;
      }
    });
    o.setValue ("x", 10);
    this.assertEqual ("20", Element.getValue(h1)); // String(10*2) => "20"

    t.setValueTransformer ({
      keyPath : "y",
      forward : function (v) {
        return v * 3;
      }
    });
    o.setValue ("y", 20);
    // (20 + 1) * -1 * 3 = 21*-3 = -63.
    this.assertEqual ("-63", Element.getValue(h2));
  }));

  // Value transformers should be able to be set based on the selector the
  // data is displayed in as well as by key path.
  tc.add(function () {
    var t = Template.create('\
      <div class="root">\
      <div class="foo"><div class="x"></div></div>\
      <div class="bar"><div class="x"></div></div>\
      </div>\
      ');

    var o = new O(5);

    // This test tries set different value transformers for .foo .x and
    // .bar .x.
    t.setValueTransformer({
      selector : ".foo .x",
      forward : function (v) {
        return v * 10;
      }
    });
    t.bindTo(o);
    var root = t.getRootElement();
    this.assertEqual("50", Element.getValue($f(".foo .x", root)));
    this.assertEqual("5", Element.getValue($f(".bar .x", root)));

    // Set after binding.
    t.setValueTransformer({
      selector : ".bar .x",
      forward : function (v) {
        return v * 5;
        }
    });
    this.assertEqual("25", Element.getValue($f(".bar .x", root)));
  });

  // If both key path transformers and selector transformers exist for an
  // element, they should both be performed, and in that order.
  tc.add(function () {
    var t = Template.create('<div><div class="x"></div></div>');
    t.setValueTransformer({
      keyPath : "x",
      forward : function (v) {
        return Math.abs(v);
      }
    });
    t.setValueTransformer({
      selector : ".x",
      forward : function (v) {
        return Math.sqrt(v);
      }
    });
    var o = new O(-4);
    t.bindTo(o);

    this.assertEqual("2", Element.getValue($f(".x", t.getRootElement())));
  });

  // All selectors should be able to include the root.
  tc.add(function () {
    var t = Template.create('<div class="x"></div>');
    t.setValueTransformer({
      selector : "root",
      forward : Math.sqrt
    });
    var o = new O(4);
    t.bindTo(o);
    this.assertEqual("2", Element.getValue(t.getRootElement()));
  });


  // Selector transformers should be cloned, too.
  tc.add(function () {
    var t = Template.create('<div><div class="x"></div></div>');
    t.setValueTransformer({
      selector : ".x",
      forward : Math.sqrt
    });
    var o = new O(4);
    var t2 = Template.create(t);
    t2.bindTo(o);
    this.assertEqual("2", Element.getValue($f(".x", t2.getRootElement())));
  });

  // Several transformers should not be able to exist for the same
  // keyPath/selector, and later modifications should overwrite previous ones.
  tc.add(function () {
    var t = Template.create(
      '<div><h1 class="x"></h1></div>', {
        valueTransformers : [{
          selector : ".x",
          forward : function (v) {
            return v + "b";
          }
        }, {
          keyPath : "x",
          forward : function (v) {
            return v + "a";
          }
        }],
        kvcBinding : new O("_")
      });
    t.setValueTransformer({
      selector : ".x",
      forward : function (v) {
        return v + "d";
      }
    });
    t.setValueTransformer({
      keyPath : "x",
      forward : function (v) {
        return v + "c";
      }
    });
    this.assertEqual("_cd", Element.getValue($f(".x", t.getRootElement())));
  });

  // Create syntax for both selector and keypath.
  tc.add(function () {
    var t = Template.create(
      '<div><h1 class="x"></h1><h2 class="y"></h2></div>', {
        valueTransformers : [{
          selector : ".y",
          forward : Math.sqrt
        }, {
          keyPath : "x",
          forward : Math.sqrt
        }],
        kvcBinding : new O(4, -9)
      });
    var root = t.getRootElement();
    this.assertEqual("2", Element.getValue($f(".x", root)));
    this.assertEqual("3", Element.getValue($f(".y", root)));
  });

  // key path transformers should be applied before selector transformers.
  tc.add(function () {
    var t = Template.create(
      '<div><h1 class="x"></h1><h2 class="y"></h2></div>', {
        valueTransformers : [{
          selector : ".x",
          forward : Math.sqrt
        }, {
          keyPath : "x",
          forward : Math.abs
        }],
        kvcBinding : new O(-4)
      });
    this.assertEqual("2", Element.getValue($f(".x", t.getRootElement())));
  });

  // Value transformers should be cloned when the template is cloned.
  tc.add(function () {
    var o = new O(10);

    var t = Template.create(
      '<div><h1 class="x"></h1><h2 class="y"></h2></div>');
      t.bindTo(o);
    t.setValueTransformer({
      keyPath : "x",
      forward : function (v) {
        return v * 2;
      }
    });
    this.assertEqual("20",
                     Element.getValue($("h1", t.getRootElement())[0]));

    var t2 = Template.create(t);
    t2.bindTo(o);
    this.assertEqual(String(10 * 2),
                     Element.getValue($("h1", t2.getRootElement())[0]));
  });

  // Value transformers should be able to be set before the template is bound
  // to a KVC.
  tc.add (function () {
    var t = Template.create(
      '<div><h1 class="x"></h1><h2 class="y"></h2></div>');
    t.setValueTransformer({
      keyPath : "x",
      forward : function (v) {
        return v * 2;
      }
    });
    var o = new O();
    t.bindTo(o);
    o.setValue("x", 10);
    this.assertEqual("20",
                     Element.getValue($(".x", t.getRootElement())[0]));
  });

  // Transformations should be reversible.
  tc.add(function () {
    var o = new KVC();
    o.x = -4;
    o.y = -9;
    o.z = 1;
    o.w = 16;
    var t = Template.create('\
      <div>\
      <input class="x" type="text">\
      <input class="y" type="text">\
      <input class="z" type="text">\
      <input class="w" type="text">\
      </div>', {
        valueTransformers : [{
          keyPath : "x",
          forward : Math.abs,
          backward : Math.sqrt
        }, {
          selector : ".y",
          forward : Math.abs,
          backward : function (v) {
            return Math.sqrt(v);
          }
        }, {
          selector : ".z"
          // Omitting both transformers.
        }, /* Both types of backward transformers. */ {
          keyPath : "w",
          backward : function (v) {
            return -v;
          }
        }, {
          selector : ".w",
          backward : Math.sqrt
        }],
        kvcBinding : o
      });

    // Key path transformer.
    this.assertEqual(4, valueOf(t, ".x"));
    get(t, ".x").onchange();
    this.assertEqual(2, valueOf(t, ".x"));
    // Selector transformer.
    this.assertEqual(9, valueOf(t, ".y"));
    get(t, ".y").onchange();
    this.assertEqual(3, valueOf(t, ".y"));
    // Omitting the regular transformer (the `transform` property).
    this.assertEqual(1, valueOf(t, ".z"));
    // Selector transformers should be executed before
    // key path transformers.
    this.assertEqual(16, valueOf(t, ".w"));
    get(t, ".w").onchange();
    this.assertEqual(-4, o.getValue("w"), "keyPath w not set to -4");
    this.assertEqual(-4, valueOf(t, ".w"), "selector .w not sot to -4");

    // Cloning of backward transformers,
    // checking both selector and value transformers.
    var t2 = Template.create(t);
    t2.bindTo(o);
    o.setValue("w", 16);
    this.assertEqual(16, valueOf(t2, ".w"));
    get(t2, ".w").onchange();
    this.assertEqual(-4, o.getValue("w"));
    this.assertEqual(-4, valueOf(t2, ".w"));
  });

  // Regression test for a bug that caused the backward transformer's value
  // to be set to the event object.
  tc.add(function () {
    var o = new KVC();
    o.foo = "";
    var value;
    var t = Template.create('<div><input type="text" class="foo"></div>', {
      kvcBinding : o,
      valueTransformers : [{
        keyPath : "foo",
        backward : function (v) {
          value = v;
        }
      }]
    });
    var input = get(t, ".foo");
    input.value = "bar";
    input.onchange("baz");
    this.assertEqual("bar", value);
  });

  return [tc];
};
