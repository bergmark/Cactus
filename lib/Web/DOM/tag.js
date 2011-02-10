require('Task/Joose/NodeJS');
/**
 * @file
 * This is a wrapper function that shortens the amount of code needed to
 * dynamically create elements.
 *
 * Example usage:
 * tag("div", {
 *   id : "foo",
 *   className : "bar",
 *   events : {
 *     mouseover : function () {},
 *     mouseout : function () {}
 *   },
 *   style : {
 *     position : "absolute",
 *     left : "100px"
 *   }
 *   },
 *   "myText"
 * );
 *
 * This would produce a DOM representation of <div id="foo" class="bar"
 * style="postion:absolute; left:100px;">myText</div> with the events attached.
 *
 * You can also specify an array of children ("myText" being an only child in
 * the previous example.)
 *
 * With Templates introduced, this function should be used less and less by
 * client programmers.
 *
 */

Joose.Module("CactusJuice.Web.DOM", function (m) {
  var Events = CactusJuice.Web.DOM.Events;
  var Collection = CactusJuice.Data.Collection;
  var Browser = CactusJuice.Web.Browser;

  function append(o, contents) {
    if (typeof(contents) === "string" || typeof contents === "number") {
      o.appendChild(document.createTextNode(contents));
    } else if (Collection.isCollection(contents)) {
      if (o.tagName.toLowerCase() === "select") {
        for (var i = 0, option; i < contents.length; i++) {
          option = contents[i];
          o.appendChild(option);
          if (option._selected) {
            option._selected = undefined;
            o.selectedIndex = i;
          }
        }
      } else {
        for (var j = 0; j < contents.length; j++) {
          append(o, contents[j]);
        }
      }
    } else if (contents) {
      o.appendChild(contents);
    }
  }

  /**
   * @param string name
   *   The tag name of the element created.
   * @param optional Hash attributes
   *   Contains html attributes to assign to the elements, among other things.
   * @param optional mixed contents
   *    string: a text node with the value is appended to the element.
   *    HTMLElement: the element is appended to the new element
   *    Array<HTMLElement>: all elements are appended.
   */
  function tag(name, attributes, contents) {
    if (!attributes) {
      var attributes = {};
    }

    // Due to an IE bug the name attribute won't be set unless we
    // create the element like this.
    var o;
    if (attributes.name && (Browser.ie || Browser.opera)) {
      o = document.createElement("<" + name + ' name="' + attributes.name + '">');
      delete attributes.name;
    } else {
      o = document.createElement(name);
    }

    var events = attributes.events;
    if (events) {
      for (var p in events) if (events.hasOwnProperty(p)) {
        Events.add(o, p, events [p]);
      }
    }
    delete attributes.events;

    var style = attributes.style;
    if (style) {
      for (var p in style) if (style.hasOwnProperty(p)) {
        o.style [p] = style [p];
      }
    }
    delete attributes.style;


    if (name.toLowerCase() === "input" && !("value" in attributes)) {
      attributes.value = "";
    }

    for (var p in attributes) if (attributes.hasOwnProperty(p)) {
      // Opera will set selected=undefined if it's set on an
      // option that isn't appended to a select so we set
      // _selected instead and then check for the value when we
      // append to another tag().
      if (p === "selected") {
        o._selected = attributes [p];
      } else {
        o [p] = attributes [p];
      }
    }

    if (contents !== undefined && contents !== null) {
      append(o, contents);
    }

    // There is a bug in opera 9.5 (and a similar bug in 9.25) that will
    // let two radios be checked even if they share a name and belong to
    // the same form if the form hasn't been appended to the DOM.
    // The appending needs to take place here, after any append() calls for
    // the workaround to work.
    //
    // This snippet prevents the bugs from appearing in 9.5 and probably
    // also in 9.25.
    if (name === "form") {
      var displayValue = o.style.display;
      o.style.display="none";
      document.body.appendChild(o);
      document.body.removeChild(o);
      o.style.display = displayValue;
    }

    return o;
  };
  m.tag = tag;
});
