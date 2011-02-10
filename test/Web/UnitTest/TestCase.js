/**
 * @file
 * A TestCase instance contains an arbitrary amount of tests.
 * Setup and teardown methods are available through this class, to utilize them,
 * the class is first instantiated followed by either or both instance methods
 * being overridden. Setup is called before each Test, and teardown after each.
 *
 * TestCase uses EventIterator in order to wait for asynchronous tests to
 * finish. This allows tests that wait for user input (should rarely be used)
 * and remote calls. It needs to be used when objects pass out events to tell
 * that theyre finished.
 */
Cactus.Dev.UnitTest.TestCase = (function () {
  var Test = Cactus.Dev.UnitTest.Test;
  var EventSubscription = CactusJuice.Util.EventSubscription;
  var EventIterator = Cactus.Util.EventIterator;
  var log = Cactus.Dev.log;
  var CArray = CactusJuice.Addon.Array;

  Joose.Class("TestCase", {
    does : EventSubscription,
    has : {
      /**
       * @type integer
       */
      assertions : { init : 0, is : "ro" },
      /**
       * @type string
       */
      name : { init : "", is : "ro" },
      /**
       * @type boolean
       */
      success : null,
      /**
       * @type Array
       */
      tests : { init : function () { return []; } }
    },
    methods : {
      /**
       * @param string name
       *   The name of the testcase, used to identify which testcases failed.
       */
      BUILD : function (name) {
        this.name = name;
      },

      // Events.
      /**
       * Triggered when all tests have finished running
       */
      onFinish : Function.empty,
      /**
       * Called before every Test. This function is called in the scope of
       * that test. An empty function is provided by default to clean up the
       * code. Use it to set up data that is needed for all or several tests.
       * If only one test uses the data, it should probably be defined inside
       * that particular test function instead.
       *
       * @type Function
       */
      setup : Function.empty,
      /**
       * Called after every Test. This function is called in the scope of that
       * test. An empty function is provided by default tr clean up the code.
       * Use it to remove or reset data after a test is run.
       *
       * @type Function
       */
      teardown : Function.empty,
      /**
       * @throws Error  if called before the tests have finished
       * @return boolean
       */
      getSuccess : function () {
        if (this.success === null) {
          throw new Error("Called getSuccess before testCase ran");
        }
        return this.success;
      },
      /**
       * Whether all tests have finished running
       *
       * @return boolean
       */
      isFinished : function () {
        return this.success !== null;
      },
      /**
       * Add a test to the testcase. The method instatiates Test with the
       * function provided. If more than one test is to be added, it might be
       * easier to use addTests().
       *
       * @param Test/Function test
       *   The test do add, if a function is provided it's transformed into a Test.
       */
      add : function (test) {
        if (test instanceof Function) {
          this.tests.push(new Test(null, test));
        } else {
          this.tests.push(test);
        }
      },
      /**
       * Calls this.add() for every argument. Syntactic sugar for adding
       * several tests at once.
       *
       * @param Test *tests
       */
      addTests : function () {
        for (var i = 0; i < arguments.length; i++) {
          this.add(arguments [i]);
        }
      },
      /**
       * Accessor for tests. Copies the array to avoid breaking encapsulation.
       *  But the tests are NOT copied.
       *
       * @return Array  a shallow copy of the tests collection
       */
      getTests : function () {
        return CArray.clone(this.tests);
      },
      /**
       * Executes all tests in an arbitrary order. Setup is called
       * before a test is executed, and teardown afterwards.
       */
      run : function () {
        var ei = new EventIterator(this.tests, "run", "TestFinish");
        ei.subscribe("Finish", this);
        ei.setBeforeProcessing(this.setup);
        ei.setAfterProcessing(this.teardown);
        ei.startForward();
      },
      onFinishTriggered : function (ei) {
        for (var i = 0; i < this.tests.length; i++) {
          this.assertions += this.tests [i].getAssertions();
          if (!this.tests [i].getSuccess()) {
            this.success = false;
          }
        }
        if (this.success === null) {
          this.success = true;
        }

        ei.removeSubscriber(this, "Finish");
        this.onFinish();
      }
    }
  });
  return TestCase;
})();
