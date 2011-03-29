Cactus.UnitTest.DOM.tag = function () {
  var UT = Cactus.Dev.UnitTest;
  var Test = UT.Test;
  var tag = Cactus.Web.DOM.tag;
  var Browser = Cactus.Web.Browser;

  var tagTC = new UT.TestCase("DOM.tag");
  tagTC.add(new Test(function () {
    this.processResults();
  }, function () {
    var o = tag("p");
    o = tag("img", {
      className : "foo",
      id : "bar",
      height : "0",
      width : 5
    });
    // Don't test in IE.
    this.assert(Browser.jscript || o instanceof window.HTMLImageElement);
    this.assertEqual("foo", o.className);
    this.assertEqual("bar", o.id);
    this.assertEqual(0,     o.height);
    this.assertEqual(5,     o.width);

    o = tag("pre", null, "hello!");
    if (!Browser.jscript) {
      // this.assert(o instanceof window.HTMLPreElement);
    }
    this.assertEqual(1, o.childNodes.length,
                      "wanted 1, got " + o.childNodes.length + " hello! is supposed to be a childNode (textNode)");
    this.assertEqual("hello!", o.firstChild.nodeValue);

    var a = tag("a", null, "foo");
    this.assertEqual("foo", a.firstChild.nodeValue);

  }));

  // test adding a number as contents
  tagTC.add(new Test(null, function () {
    var e = tag("span", null, 1);

    this.assert(e.hasChildNodes())
    this.assertEqual("1", e.firstChild.nodeValue);
  }));

  // test making a select tag with a selected option
  tagTC.add(new Test(null, function () {
    var select = tag("select", null, [
      tag("option", { value : "1" }, "1"),
      tag("option", { value : "2", selected : "selected" }, "2"),
      tag("option", { value : "2" }, "3")
    ]);

    this.assertEqual(1, select.selectedIndex,
                      "selectedIndex=1 wanted but got =" +
                      select.selectedIndex);
    this.assertEqual("2", select.options [select.selectedIndex].value);
  }));

  tagTC.add(function () {
    tag("p", null, ["a string"]);
  });

  tagTC.add(function () {
    var checkbox = tag("input", { type : "checkbox" });
    this.assert(checkbox.value === null ||
                 checkbox.value === "" ||
                 checkbox.value === undefined,
                   "got value: " + checkbox.value);
  });

  // Make sure two radia buttons in a form can't be selected at once.
  tagTC.add(function () {
    var a = tag("input", {
      type : "radio",
      name : "foo",
      value : "a"
    });
    var b = tag("input", {
      type : "radio",
      name : "foo",
      value : "b"
    });
    var form = tag("form", null, [a, b]);

    a.checked = true;
    b.checked = true;

    this.assertFalse(a.checked && b.checked,
                     "Both a and b are checked.");
  });

  // Make sure the innerHTML of options are set.
  tagTC.add(function () {
    var option = tag("option", {
      value : "value"
    }, "text");
    this.assertEqual("text", option.innerHTML);
  });
  return tagTC;
};
