Cactus.UnitTest.Web.selectFirst = function () {
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var Test = Cactus.Dev.UnitTest.Test;
  var $f = Cactus.Web.selectFirst;
  var tag = Cactus.Web.tag;

  var tc = new TestCase("Web.selectFirst");

  tc.add(function () {
    var span = tag("span", { id : "the-span" }, "Foo");
    var em = tag("em", { id : "the-em" }, "Bar");
    var root = tag("div", { id : "root" }, [
      span,
      em
    ]);

    this.assertEqual(span, $f("#the-span", root));
    this.assertEqual(em, $f("em", root));
    this.assertEqual(null, $f("#random", root));
  });

  return [tc];
};
