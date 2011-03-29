/*
 * @file
 * The unit test controller is an ugly excuse of a component. It was written
 * before major components were implemented (such as templates) and it has not
 * been decided if it should stay this way in order to keep dependencies at a
 * minimum.
 *
 * UTC is instantiated with a TestSuite and will display the data for testcases
 * as tests finish.
 */
Cactus.Dev.UnitTest.UnitTestController = (function () {
  var tag = Cactus.Web.DOM.tag;

  /**
   * @param TestSuite testSuite  the testSuite to display
   */
  function UnitTestController(testSuite) {
    this.testSuite = testSuite;
    testSuite.subscribe("TestCaseFinished",
                        this.printResults.bind(this));
    testSuite.subscribe("BeforeTestCaseStart",
                        this.printStarted.bind(this));
    this.constructHTML();

  } UnitTestController.prototype = {
    constructHTML : function () {
      this.sandbox = tag("div", { id : "sandbox" });
      document.body.appendChild(this.sandbox);
      this.testResults = tag("div", { id : "test-results" });
      document.body.appendChild(this.testResults);
    },
    runTests : function () {
      this.testSuite.run();
    },
    _testCaseLink : function (testCase) {
      var name = testCase.getName();
      return tag("a", { href : "./runTests.html?%s".format(name) }, name);
    },
    printStarted : function (testSuite, testCase) {
      this.testResults.appendChild(tag("div", {
        className : "testCase running"
      }, [this._testCaseLink(testCase), tag("span", null, name + " is running")]));
    },
    printResults : function (testSuite, testCase) {
      var TestSuite = Cactus.Dev.UnitTest.TestSuite;
      var TestCase = Cactus.Dev.UnitTest.TestCase;

      var test;
      var tests;
      var div;
      var h3;
      var assertions;
      var messages;
      var messagesArray;
      var messagesUL;
      var messageLI;

      messages = [];
      messagesArray = [];

      // Remove the "running" message.
      this.testResults.removeChild(this.testResults.lastChild);

      div = document.createElement("div");
      div.className = "testCase";
      div.className += " " + (testCase.getSuccess() ?
                              "succeeded" : "failed");
      h3 = document.createElement("h5");
      h3.className = "title";
      h3.appendChild(this._testCaseLink(testCase));
      tests = document.createElement("ul");
      tests.className = "tests";

      for (var j = 0, testColl = testCase.getTests();
           j < testColl.length; j++) {

        test = document.createElement("li");
        test.className = "testAssertions";
        test.appendChild(
          document.createTextNode(String(
            testColl [j].getAssertions())));
        if (!testColl [j].getSuccess()) {
          messagesArray.push(testColl [j].getMessage());
        }
        tests.appendChild(test);
      }

      messagesUL = document.createElement("ul");
      messagesUL.className = "messages";
      for (var j = 0; j < messagesArray.length; j++) {
        messageLI = document.createElement("li");
        messageLI.innerHTML += messagesArray [j];
        messagesUL.appendChild(messageLI);
      }

      assertions = document.createElement("div");
      assertions.className = "assertions";
      assertions.appendChild(
        document.createTextNode("Assertions: " +
                                testCase.getAssertions()));

      div.appendChild(h3);
      div.appendChild(tests);
      div.appendChild(assertions);
      div.appendChild(messagesUL);
      this.testResults.appendChild(div);
    }
  };

  return UnitTestController;
})();
