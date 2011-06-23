Cactus.UnitTest.Web.stringToDom = (function () {
  var UT = Cactus.Dev.UnitTest;
  var Test = UT.Test;
  var stringToDom = Cactus.Web.stringToDom;

  var tc = new UT.TestCase("Web.stringToDom");

  tc.add(function () {
    var s = '<span id="a">1</span>';
    var d = stringToDom(s);
    this.assertEqual("span", d.tagName.toLowerCase());
    this.assertEqual("1", d.innerHTML);

    s = '<option>1</option>';
    d = stringToDom(s);
    this.assertEqual("option", d.tagName.toLowerCase());
    this.assertEqual("1", d.innerHTML);

    s = '<tr><td>1</td></tr>';
    d = stringToDom(s);
    this.assertEqual("tr", d.tagName.toLowerCase());
    this.assertEqual("<td>1</td>", d.innerHTML.toLowerCase());
  });

  return tc;
});
