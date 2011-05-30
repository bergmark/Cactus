/**
 * @file
 *
 * Assertion  is  a simple  data  structure,  it  has two  properties:
 * success  and  message.  Success  indicates if  the  assertion  that
 * created the object succeeded. In the case that the assertion failed,
 * failed() will return true, and message  can be viewed to get a clue
 * about what went wrong.
 */
Cactus.Dev.UnitTest.Assertion = (function () {
  /**
   * @param boolean success
   * @param string message
   */
  function Assertion(success, message) {
    this.success = success;
    this.message = message;
  } Assertion.prototype = {
    /**
     * @type boolean
     */
    success : null,
    /**
     * @type string
     */
    message : null,
    /**
     * Negated accessor for success, indicates whether an assertion failed.
     *
     * @return boolean
     */
    failed : function () {
      return !this.success;
    },
    /**
     * @return boolean
     */
    succeeded : function () {
      return this.success;
    },
    /**
     * @return string
     */
    getMessage : function () {
      return this.message;
    }
  };

  return Assertion;
})();
