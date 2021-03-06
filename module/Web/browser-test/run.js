(function () {
  var UT = Cactus.Dev.UnitTest;
  var TestCase = UT.TestCase;
  var TestSuite = UT.TestSuite;
  var UnitTestController = UT.UnitTestController;
  var Events = Cactus.Web.Events;

  var tests = [
    "Web.Events",
    "Web.Element",
    "Web.Event",
    "Web.Events",
    "Web.select",
    "Web.selectFirst",
    "Web.tag",
    "Web.EventManager",
    "Web.Validation",
    "Web.TemplateValueTransformer",
    "Web.Template",
    "Web.ListTemplate",
    "Web.ListTemplate.ClassName",
    "Web.stringToDom"
  ];

  // If GET parameters are specified, only those tests are run.
  if (location.search) {
    tests = location.search.substr(1).split("&");
  }

  // Load all unit test files.
  for (var i = 0; i < tests.length; i++) {
    var utFile = "./browser-test/test/" + tests[i] + ".test";
    require(utFile);
  }

  // Add all testcases to the testSuite.
  function recursiveAddTS(testSuite, object) {
    var test;
    for (var i = 0; i < tests.length; i++) {
      test = tests[i];

      var utPath = "Cactus.UnitTest." + test.replace(/\//g, ".");
      var testFunc = eval(utPath);
      if (!testFunc) {
        throw new Error("Missing UT path for: %s".format(utPath));
      }
      var testCases = testFunc();
      if (testCases instanceof TestCase) {
        testSuite.addTestCase(testCases);
      } else {
        if (testCases.length === 0) {
          throw new Error("An empty collection of testcases for "
                          + utPath);
        }
        for (var p in testCases) if (testCases.hasOwnProperty(p)) {
          testSuite.addTestCase(testCases[p]);
        }
      }
    }
  }

  Events.add(window, "load", function () {
    var ts = new TestSuite();
    recursiveAddTS(ts, Cactus.UnitTest);
    var controller = new UnitTestController(ts);
    controller.runTests();
  });
})();
