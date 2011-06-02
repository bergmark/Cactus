Module("Cactus.Web", function (m) {
  var $f = Cactus.Web.selectFirst;
  var tag = Cactus.Web.tag;
  /**
   * Converts a string into a DOM structure. Expects completely valid html
   * without any initial white space.
   *
   * @param string s
   * @return HTMLElement
   */
  m.stringToDom = function (s) {
    var el = tag("div");
    var selector;
    if (/^<tr/.test(s)) {
      el.innerHTML = "<table><tbody>%s</tbody></table>".format(s);
      selector = "tr";
    } else if (/^<option/.test(s)) {
      el.innerHTML = "<select>%s</select>".format(s);
      selector = "option";
    } else {
      el.innerHTML = s;
      selector = "*";
    }
    return $f(selector, el);
  };
});
