/**
 * @file
 * Provides a cross browser event for when the DOM has finished loading on a
 * given page. Ready should usually be used over window.onload since it
 * doesn't wait for external resources such as images to finish loading.
 *
 * This module is not part of the test suite since it's hard to verify this
 * functionality.
 */
Joose.Module("Cactus.Web.DOM", function (m) {
  var Browser = Cactus.Web.Browser;
  var Events = Cactus.Web.DOM.Events;

  function Ready() {
    if (Browser.ie) {
      document.write('<script id=__ie_onload defer ' +
                     'src=javascript:void(0)><\/script>');
      var scriptElement = document.getElementById("__ie_onload");
      scriptElement.onreadystatechange = (function (scriptElement) {
        if (scriptElement.readyState === "complete") {
          this._execute();
        }
      }).bind(this, scriptElement);
    } else if (Browser.op || Browser.gecko || Browser.sf3) {
      document.addEventListener("DOMContentLoaded",
                                this._execute.bind(this), false);
      // Safari 2.0
    } else if ("readyState" in document) {
      this.interval = setInterval((function () {
        if (/loaded|complete/.test(document.readyState)) {
          this._execute();
        }
      }).bind(this), 10);
    } else {
      Events.add(window, 'load', this._execute, this);
    }
  } Ready.prototype = {
    /**
     * @type boolean
     *   If the DOM has loaded.
     */
    DOMLoaded : false,
    /**
     * @type Array
     *   Container for all functions that are to be executed.
     */
    functions : [],
    /**
     * Adds a function `f` to the array of functions that are to be executed
     * when Ready occurs. They are called in the scope of `scope`.
     * If Ready has already occured when add is called, `f` is instantly
     * executed.
     *
     * @param Function f
     *   The function to register.
     */
    add : function (f) {
      if (this.DOMLoaded) {
        f();
      } else {
        this.functions.push(f);
      }
    },
    /**
     * Executes all functions that were added.
     */
    _execute : function () {
      this.DOMLoaded = true;
      var func;
      // Go through  all added functions in the  order they were
      // added and then delete the array reference.
      while ((func = this.functions.shift())) {
        func();
      }
      delete this.functions;
      // If an interval was set, clear it and delete the reference.
      if (this.interval) {
        clearInterval(this.interval);
        delete this.interval;
      }
    }
  };
  m.Ready = new Ready();
});
