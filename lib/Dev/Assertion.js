/**
 * Asserts that a given exception is thrown when executing the given
 * function.
 *
 * @param Error/RegExp expectedException
 *   Error: The constructor of the error expected, or a superclass
 *          constructor.
 *   RegExp: A RegExp supposed to match the message of the exception.
 * @param Function func
 *   The function to execute.
 * @param optional string message
 *   An error message to save if the assertion fails.
 */
var assertException = function (assert, expectedException, func, message) {
  var returnValue = "*not available*";
  var exception = null;
  try {
    returnValue = func();
  } catch (err) {
    exception = err;
  }
  if (message === undefined) {
    if (exception === null) {
      if (expectedException instanceof RegExp) {
        message = "expected an exception matching " +
          expectedException +
          ", but no exception was thrown." +
          "Function return value: +" + returnValue + "+";
      } else {
        message = "expected to catch +" +
          getFunctionName (expectedException)  + "+," +
          " but no exception was thrown." +
          "Function return value: +" + returnValue + "+";
      }
    } else {
      if (expectedException instanceof RegExp) {
        message = "expected an exception message matching " +
          expectedException + ", but got: " +
          exception.message;
      } else {
        message = "expected to catch +" +
          expectedException.name +
          "+, but caught +" +
          exception.constructor.name + "+";
      }
    }
  }
  var exceptionThrown = !!exception;
  // Match regexp =~ error message if regexp is specified, otherwise
  // check the instance of the exception.
  var condition;
  if (expectedException instanceof RegExp) {
    if (!exception) {
      condition = false;
    } else {
      condition = expectedException.test(exception.message);
    }
  } else {
    condition = exception instanceof expectedException;
  }
  assert.ok(exceptionThrown && condition, message);
};

module.exports = {
  assertException : assertException
};
