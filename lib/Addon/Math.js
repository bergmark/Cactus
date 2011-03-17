/**
 * @file
 *   Provides additional functionality for the Math object.
 */
Joose.Module("CactusJuice.Addon", function (m) {
  m.Math = {
    /**
     * Given three numbers, returns the one middle one.
     *
     * @param number a
     * @param number b
     * @param number c
     * @param number
     *   a, b or c.
     */
    middle : function (a, b, c) {
      if ((b <= a && a <= c) || (b >= a && a >= c)) {
          return a;
      }
      if ((a <= b && b <= c) || (a >= b && b >= c)) {
          return b;
      }
      return c;
    },
    /**
     * @param integer start
     * @param integer end
     * @return integer
     *   n where start <= n <= end.
     */
    rand : function (start, end) {
        return Math.floor((Math.random() * (end + 1 - start))) + start;
    },
    /**
     * @param integer i
     * @return boolean
     */
    even : function (i) {
      return i % 2 === 0;
    },
    /**
     * @param integer i
     * @return boolean
     */
    odd : function (i) {
      return !this.even(i);
    }
  };
});
