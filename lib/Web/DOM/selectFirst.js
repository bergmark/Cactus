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
Module("Cactus.Web.DOM", function (m) {
  var $ = Cactus.Web.DOM.select;

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
