require('Task/Joose/NodeJS');

/**
 * @file
 *
 * ClassNames provides static methods for accessing CSS class names for
 * HTML Elements.
 */
Joose.Module("CactusJuice.Web.DOM", function (m) {

  var CArray = CactusJuice.Addon.Array;

  function ClassNames () {

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
    del : function (o, className) {
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
    }
  };
  m.ClassNames = new ClassNames();
});
