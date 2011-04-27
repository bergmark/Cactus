/**
 * Provides simple CSS selector functionality. The selector works similarily to
 * other js libraries implementations. Selectors are often named $, and by
 * convention this is also the case when using Web.select.
 *
 * Usage:
 * The selector is always a string, depending on the prefix
 * character, different behavior occurs:
 * # - gets an element with the id specified
 * . - gets all elements with the class name (uses Web.ClassNames)
 * none - treats the substring as a tag name.
 *
 * You can chain selectors like in css, for instance "#foo div .bar" first gets
 * the element with id "foo", then all children of foo that are divs, and
 * finally all children of the divs that have "bar" as their class name.
 * The .bar elements are then returned.
 *
 * Note: A list is always returned, even if an element is fetched by ID.
 * Also see selectFirst.
 *
 * If the Sizzle library is included (either directly or through jQuery),
 * select will use it instead. Client code inside the framewrok may not make any
 * assumptions regarding the selector interface that aren't explicitly
 * documented here.
 */
Module("Cactus.Web", function (m) {
  var ClassNames = Cactus.Web.ClassNames;
  var Collection = Cactus.Data.Collection;

  // Use Sizzle or jQuery if available.
  if ("Sizzle" in window) {
    m.select = Sizzle;
    return;
  }
  if ("jQuery" in window) {
    m.select = jQuery;
    return;
  }

  /**
   * @param string selector
   * @param optional HTMLElement/Array<HTMLElement> parent = document.body
   * @return Array
   */
  function select(selector, parent) {
    parent = parent || document.documentElement;
    var elements = [];
    var parents;
    if (Collection.isCollection(parent)) {
      parents = Collection.toArray(parent);
    } else {
      parents = [parent];
    }
    var selectors = selector.split(" ");
    selector = selectors.shift();

    var prefix = selector.charAt(0);
    var text   = selector.substr(1);
    for (var i = 0; i < parents.length; i++) {
      var parent = parents[i];
      switch (prefix) {
      // Fetch by ID.
      case "#":
        if (parent === document
          || parent === document.documentElement) {
          var element = document.getElementById(text);
          if (element) {
            elements = [element];
          } else {
            elements = [];
          }
        } else {
          var all = parent.getElementsByTagName("*");
          for (var j = 0; j < all.length; j++) {
            if (all[j].id === text) {
              elements.push(all[j]);
            }
          }
        }
        break;
      // Fetch by class name.
      case ".":
        var all = parent.getElementsByTagName("*");
        for (var j = 0; j < all.length; j++) {
          if (ClassNames.has(all[j], text)) {
            elements.push(all[j]);
          }
        }
        break;
      // Fetch by tag name.
      default:
        var coll = parent.getElementsByTagName(selector);
        elements = elements.concat(Collection.toArray(coll, true));
        break;
      }
    }

    if (!selectors.length) {
      return elements;
    }

    return select(selectors.join(" "), elements);
  }

  m.select = select;
});
