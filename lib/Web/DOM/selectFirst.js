require('Task/Joose/NodeJS');
/**
 * @file
 * A wrapper for DOM.select that only returns the first element found.
 * By convention, the shorthand for DOM.select is $, DOM.selectFirst's is $f.
 *
 * You should probably only use selectFirst if there can be exactly zero or one
 * matching elements.
 *
 * Also see documentation of DOM.select.
 */
Joose.Module("CactusJuice.Web.DOM", function (m) {
  var $ = CactusJuice.Web.DOM.selectFirst;

  /**
   * @param string selector
   * @param optional HTMLElement parent
   * @return HTMLElement
   *   An arbitrary element of the elements found by DOM.select, or null
   *   if none is found.
   */
  function selectFirst(selector, parent) {
    return $(selector, parent)[0] || null;
  }

  m.selectFirst = selectFirst;
});
