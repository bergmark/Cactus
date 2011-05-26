/**
 * @file
 *   Provides additional functionality for the Math object.
 */
Module("Cactus.Addon", function (m) {
  var math = {
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
      return !math.even(i);
    },
    /**
     * @param string hex
     * @return number
     */
    hexToDec : function (hex) {
      if (!/^[0-9A-F]+$/i.test(hex)) {
        throw new Error("Math:hexToDec: Invalid input, got: " + hex);
      }
      return parseInt(hex, 16);
    },
    /**
     * @param int dec
     * @return string
     */
    decToHex : function (dec) {
      if (typeof dec != "number") {
        throw new Error("Math:decToHex: Invalid input, expected number but got: " + dec);
      }
      return dec.toString(16);
    },
    /**
     * Integer division.
     *
     * @param int a
     * @param int b
     * @return int
     *   Infinity if b is 0.
     */
    div : function (a, b) {
      return Math.floor(a / b);
    },
    xor : function (a, b) {
      if (arguments.length === 0) {
        return false;
      }
      if (arguments.length === 1) {
        return a;
      }
      if (a && b) {
        return false;
      }
      return math.xor.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  };
  m.Math = math;
});
