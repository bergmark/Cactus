/**
 * @file
 *
 * ClassNames provides static methods for accessing CSS class names for
 * HTML Elements.
 */
Module("Cactus.Web", function (m) {

  var CArray = Cactus.Addon.Array;

  function ClassNames() {

  } ClassNames.prototype = {
    /**
     * Adds a class to an object. But only if the class doesn't already
     * exist on the object.
     *
     * @param HTMLElement o
     * @param string className
     */
    add : function (o, className) {
      // Only add if the className isn't already added.
      if (!this.has(o, className)) {
        if (!o.className) {
          // If the className property is empty, we can simply
          // overwrite it.
          o.className = className;
        } else {
          // If it isn't empty, we have to insert a space so that
          // "a" and "b" becomes "a b".
          o.className += " " + className;
        }
      }
    },
    /**
     * Checks if a given className is as a className of o. It assumes that
     * class names are separated by spaces and all other characters will be
     * counted as part of class names.
     *
     * @param HTMLElement o
     * @param string className
     * @return boolean
     */
    has : function (o, className) {
      if (!o.className) {
        return false;
      }
      var classNames = o.className.split(" ");
      for (var i = 0; i < classNames.length; i++) {
        if (className === classNames[i]) {
          return true;
        }
      }
      return false;
    },
    /**
     * Removes a class from o. Does nothing if the class name doesn't exist.
     *
     * @param HTMLElement o
     * @param string className
     */
    remove : function (o, className) {
      if (this.has(o, className)) {
        var classNames = this.get(o);
        CArray.remove(classNames, className);
        o.className = classNames.join(" ");
      }
    },
    /**
     * Returns an array containing all classnames of an element.
     *
     * @param HTMLElement o
     * @return Array[string]
     */
    get : function (o) {
      var chars = o.className.split("");
      var classNames = [];
      var className = "";
        for (var i = 0; i < chars.length; i++) {
          if (chars[i] === " ") {
            classNames.push(className);
            className = "";
          } else {
            className += chars[i];
          }
        }
      classNames.push(className);
      return classNames;
    },
    /**
     * If a class name exists on the element it's removed, otherwise it's added.
     *
     * @param HTMLElement o
     * @param string className
     */
    toggle : function (o, className) {
      if (this.has(o, className)) {
        this.remove(o, className);
      } else {
        this.add(o, className);
      }
    },
    /**
     * Adds the className to the element if cond is truthy, otherwise removes it.
     *
     * @param HTMLElement o
     * @param string className
     * @param boolean cond
     */
    toggleCond : function (el, cn, cond) {
      if (cond) {
        this.add(el, cn);
      } else {
        this.remove(el, cn);
      }
    }
  };
  m.ClassNames = new ClassNames();
});
