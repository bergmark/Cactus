module.exports = (function () {
  var math = Cactus.Addon.Math;
  return {
    "rand" : function () {
      var a = [0, 0, 0, 0, 0];
      for (var i = 0; i < 5000; i++) {
        a[math.rand(0, 4)]++;
      }
      assert.ok(!("-1" in a), "lower boundary breached");
      assert.ok(!("5" in a), "upper boundary breached");
      for (i = 0; i < 5; i++) {
        assert.ok(a[i] > 900, i + " occured " + a[i] +" times");
      }
    },

    "middle" : function () {
      var a = [1, 2, 3];
      var middle = math.middle.apply.bind(math.middle).bind(null, null);

      var eq = assert.eql.bind();
      function eq2() {
        var m = middle(a);
        assert.eql(2, m, "middle(" + a.join(",") + ")=" + m);
      }

      eq2();
      a = [1, 3, 2];
      eq2();
      a = [2, 1, 3];
      eq2();
      a = [2, 3, 1];
      eq2();
      a = [3, 1, 2];
      eq2();
      a = [3, 2, 1];
      eq2();

      a = [1, 2, 2];
      eq2();
      a = [2, 1, 2];
      eq2();
      a = [2, 2, 1];
      eq2();
    },

    "odd and even" : function () {
      assert.ok(math.even(0));
      assert.ok(!math.odd(0));
      assert.ok(!math.even(1));
      assert.ok(math.odd(1));
    },

    "hexToDec" : function () {
      assert.strictEqual(0, math.hexToDec("0"));
      assert.strictEqual(10, math.hexToDec("A"));
      assert.strictEqual(15, math.hexToDec("F"));
      assert.strictEqual(16, math.hexToDec("10"));
      assert.strictEqual(255, math.hexToDec("FF"));

      // Invalid inputs should throw error.
      assert.throws(math.hexToDec.curry("X"), /hexToDec: invalid input/i);
    },
    "decToHex" : function () {
      assert.strictEqual("0", math.decToHex(0));
      assert.strictEqual("a", math.decToHex(10));
      assert.strictEqual("f", math.decToHex(15));
      assert.strictEqual("10", math.decToHex(16));
      assert.strictEqual("ff", math.decToHex(255));

      // Invalid inputs should throw error.
      assert.throws(math.decToHex.curry("X"), /decToHex: invalid input/i);
    },

    div : function () {
      assert.strictEqual(1, math.div(2, 2));
      assert.strictEqual(1, math.div(3, 2));
      assert.strictEqual(2, math.div(4, 2));
      assert.strictEqual(0, math.div(0, 2));

      assert.ok(!isFinite(math.div(1, 0)));
    }
  };
})();
