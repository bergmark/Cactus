/**
 * @file
 * A testsuite holds an arbitrary amount of testcases that it can execute.
 * After or during execution, data can be retrieved from the suite in order to
 * display it.
 */
Cactus.Dev.UnitTest.TestSuite = (function () {
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var EventIterator = Cactus.Util.EventIterator;
  var EventSubscription  = Cactus.Util.EventSubscription;

  function TestSuite() {
  } TestSuite.prototype = {
    // Events.
    /**
     * Triggered when all testcases have finished running.
     */
    onFinish : Function.empty,
    /**
     * @param TestCase testCase
     */
    onBeforeTestCaseStart : Function.empty,
    /**
     * @param TestCase testCase
     */
    onTestCaseFinished : Function.empty,

    /**
     * Adds a testcase to the suite.
     *
     * @param TestCase testCase
     */
    addTestCase : function (testCase) {
        this.testCases.push(testCase);
    },
    /**
     * Accessor for testCases, clones testCases before returning.
     *
     * @return Array
     *   A shallow copy of the collection of test cases.
     */
    getTestCases : function () {
        return Array.clone(this.testCases);
    },
    /**
     * Runs every attached test case.
     */
    run : function () {
        var ei = new EventIterator(this.testCases, "run", "Finish");
        // Call onfinish for the suite when all testcases have been iterated
        // through.
        ei.subscribe("Finish", function (ei) {
            this.onFinish(this);
        }.bind(this), true);
        // Call onTestCaseStarted before the EI processes an item.
        ei.subscribe("BeforeItemProcess", function (ei) {
            this.onBeforeTestCaseStart(ei.getCurrentItem());
        }.bind(this));
        // Call onTestCaseFinished after each item the EI processes.
        ei.subscribe("ItemProcessed", function (ei) {
            this.onTestCaseFinished(ei.getCurrentItem());
        }.bind(this));
        ei.startForward();
    }
  };
  Joose.Class("TestSuite2", {
    does : EventSubscription,
    has : {
      /**
       * @type Array
       *   All testcases used in the suite.
       */
      testCases : { init : function () { return []; } }
    },
    methods : TestSuite.prototype
  });

  return TestSuite2;
})();
