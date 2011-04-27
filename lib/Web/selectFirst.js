/**
 * @file
 * A wrapper for Web.select that only returns the first element found.
 * By convention, the shorthand for Web.select is $, Web.selectFirst's is $f.
 *
 * You should probably only use selectFirst if there can be exactly zero or one
 * matching elements.
 *
 * Also see documentation of Web.select.
 */
Module("Cactus.Web", function (m) {
  var $ = Cactus.Web.select;

  /**
   * @param string selector
   * @param optional HTMLElement parent
   * @return HTMLElement
   *   An arbitrary element of the elements found by Web.select, or null
   *   if none is found.
   */
  function selectFirst(selector, parent) {
    return $(selector, parent)[0] || null;
  }

  m.selectFirst = selectFirst;
});
