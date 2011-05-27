/**
 * @file
 * Equality checks.
 *
 * If you want to compare values using their equals method and the LHS may be null
 * then use this equals method instead.
 */
Module("Cactus.Data", function () {
  var Equality = Role("Equality", {
    requires : ["equals"]
  });
  /**
   * @param Equality a
   *   null is allowed.
   * @param Equality b
   *   null is allowed
   * @return boolean
   */
  Equality.equals = function (a, b) {
    var aEmpty = a === null || a === undefined;
    var bEmpty = b === null || b === undefined;
    if (aEmpty && bEmpty) {
      return true;
    }
    if (aEmpty && !bEmpty) {
      return false;
    }
    if (!bEmpty && aEmpty) {
      return false;
    }
    return a.equals(b);
  };
});
