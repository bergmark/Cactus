require('Task/Joose/NodeJS');
/**
 * @file
 * Browser sniffer.
 */
Joose.Module("CactusJuice.Web", function (m) {
  // Only run on client side.
  if (typeof window === "undefined") {
    return;
  }

  var Browser = {};
  Browser.op = "opera" in window;

  Browser.jscript = false /*@cc_on || true @*/;
  Browser.jscriptVersion = /*@cc_on @_jscript_version; @*/ null;
  Browser.ie = Browser.jscript;
  Browser.ie3 = Browser.jscriptVersion === 1;
  Browser.ie4 = Browser.jscriptVersion === 3;
  Browser.ie500 = Browser.jscriptVersion === 5;
  Browser.ie501 = Browser.jscriptVersion === 5.1;
  Browser.ie50 = Browser.ie500 || Browser.ie501;
  Browser.ie55 = Browser.jscriptVersion === 5.5;
  Browser.ie6 = Browser.jscriptVersion === 5.6;
  Browser.ie7 = Browser.jscriptVersion === 5.7;

  // Only exists in ff2, not ff3.
  Browser.gecko = "getBoxObjectFor" in document;
  /**
   * @type string
   *   null if engine is not gecko.
   */
Browser.geckoVersion = null;
if (Browser.gecko) {
// Only set in FF2.
Browser.geckoVersion = navigator.userAgent.match(/rv:([\d.]+)/)[1];
}
  /**
   * @type boolean
   *   Whether the browser is compatible with ff2.
   */
  Browser.ff2 = /^1\.8/.test(Browser.geckoVersion);
  /**
   * @type boolean
   *   Whether the browser is compatible with ff3.
   */
  Browser.ff3 = /Firefox\/3/.test(navigator.userAgent);
  Browser.gecko = Browser.gecko || Browser.ff3;

  Browser.webkit = /AppleWebKit/.test(navigator.appVersion);
  Browser.sf = Browser.webkit;

  // ie <= 6 leaks memory when having circular references including DOM
  // objects. This has been fixed in IE7, and in there is a fix available for
  // IE 6.
  Browser.hasDOMMemoryLeaks = Browser.ie && Browser.jscriptVersion < 5.7;

  /**
   * @type boolean
   *   Firefox 2 does not trigger blur events for file input fields.
   */
  Browser.fileInputNoBlur = Browser.gecko && Browser.ff2;

  m.Browser = Browser;
}.bind(null));
