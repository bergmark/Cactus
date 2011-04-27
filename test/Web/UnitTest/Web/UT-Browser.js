Cactus.UnitTest.Web.Browser = function () {
  var UT = Cactus.Dev.UnitTest;
  var Test = UT.Test;
  var Browser = Cactus.Web.Browser;
  var C = Cactus.Data.Collection;

  var tc = new UT.TestCase("Web.Browser");
  tc.add(function () {
    var matches = 0;
    C.each(["gecko", "webkit", "op", "ie", "chrome"], function (p) {
      if (Browser[p]) {
        matches++;
      }
    });
    console.log(Browser);
    this.assertEqual(1, matches, "Matched more than one browser.");
  });
  return tc;
};