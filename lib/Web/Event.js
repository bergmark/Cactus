/**
 * @file
 * Provides a wrapper for the events object.
 */
Module("Cactus.Web", function (m) {
  var Browser = Cactus.Web.Browser;

  function Event(e) {
    this.e = e || window.event;
  } Event.prototype = {
    /**
     * @type Object
     *   A DOM event object.
     */
    e : null,
    /**
     * @return HTMLElement
     *   The innermost element where the event triggered.
     */
    getTarget : function () {
      // event.srcElement for IE and e.target for the rest.
      return this.e.target || this.e.srcElement;
    },
    // How to retrieve the mouse position:
    //        | x/y | clientX/clientY
    // IE6    | Y   | Y
    // IE7    | Y   | Y
    // OP9.50 | Y   | Y
    // FF2    | N   | Y
    // FF3    | N   | Y
    // SF3    | Y   | Y
    /**
     * Scrolling may or may not be taken into account.
     *
     * @return natural
     */
    getMouseX : function () {
      return this.e.clientX;
    },
    /**
     * Scrolling may or may not be taken into account.
     *
     * @return natural
     */
    getMouseY : function () {
      return this.e.clientY;
    },
    __getScroll : function () {
      // /C=standards compliance mode
      // Otherwise quirks mode.
      //
      // Y=Correct value.
      // N=null/undefined.
      // I=Is always 0.
      //                                  | FF | FF/C | OP | OP/C | SF |  SF/C | IE6 | IE6/C | IE7 | IE7/C |
      // window.pageX/YOffset             |  Y |  Y   | Y  |  Y   | Y  |   Y   |  N  |   N   |  N  |   N   |
      // document.body.scrollLeft/Top     |  Y |  I   | Y  |  I   | Y  |   Y   |  Y  |   I   |  Y  |   I   |
      // d.documentElement.scrollLeft/Top |  I |  Y   | I  |  Y   | I  |   I   |  I  |   Y   |  I  |   Y   |
      var x;
      var y;

      if (Browser.ie) {
        x = Math.max(document.documentElement.scrollLeft || 0,
                     document.body.scrollLeft || 0);
        y = Math.max(document.documentElement.scrollTop || 0,
                     document.body.scrollTop || 0);
      } else {
        x = window.pageXOffset;
        y = window.pageYOffset;
      }

      return {
        x : x,
        y : y
      };
    },
    getScrollX : function () {
      return this.__getScroll().x;
    },
    getScrollY : function () {
      return this.__getScroll().y;
    }
  };

  m.Event = Event;
});
