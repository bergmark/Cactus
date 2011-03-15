module.exports = (function () {
  var Money = CactusJuice.Data.Money;
  var stringify = CactusJuice.Util.JSON.stringify;
  var assertException = CactusJuice.Dev.Assertion.exception;

  return {
    "test everything" : function () {
      var m = new Money(12, 34);
      assert.strictEqual(12, m.getDollars());
      assert.strictEqual(34, m.getCents());
      m = new Money(-12, 34);
      assert.strictEqual(-12, m.getDollars());
      assert.strictEqual(34, m.getCents());
      m = new Money(0, -10);
      assert.strictEqual(0, m.getDollars());
      assert.strictEqual(-10, m.getCents());

      m = Money._fromAmount(1234);
      assert.strictEqual(12, m.getDollars());
      assert.strictEqual(34, m.getCents());
      m = Money._fromAmount(-1234);
      assert.strictEqual(-12, m.getDollars());
      assert.strictEqual(34, m.getCents());
      m = Money._fromAmount(-10);
      assert.strictEqual(0, m.getDollars());
      assert.strictEqual(-10, m.getCents());

      assert.strictEqual("12.34", new Money(12, 34).toString());
      assert.strictEqual("-12.34", new Money(-12, 34).toString());
      assert.strictEqual("-0.85", new Money(0, -85).toString());
      assert.strictEqual("-0.02", new Money(0, -2).toString());

      assert.strictEqual("5.00", new Money(2, 30).add(new Money(2, 70)).toString());
      assert.strictEqual("2.13", new Money(4, 00).sub(new Money(1, 87)).toString());
      assert.strictEqual("-0.85", new Money(10, 00).sub(new Money(10, 85)).toString());
      assert.strictEqual("-12.85", new Money(20, 00).sub(new Money(32, 85)).toString());
      assert.strictEqual("10.24", new Money(5, 12).mult(2).toString());

      assertException(assert, /dollars is NaN/, function () { new Money(NaN, 13) });
      assertException(assert, /cents is NaN/, function () { new Money(13, NaN) });
      assertException(assert, /cents < 0/, function () { new Money(1, -1) });
      assertException(assert, /cents < 0/, function () { new Money(-1, -1) });

      assert.strictEqual(stringify({ dollars : 1, cents : 2 }),
                       stringify(new Money(1, 2).serialize()));

      new Money(-1, 0);
      assert.ok(new Money(0, 1).isPositive());
      assert.ok(!new Money(0, -1).isPositive());
      assert.ok(!new Money(-1, 0).isPositive());
      assert.ok(new Money(1, 0).isPositive());
      assert.ok(!new Money(0, 0).isPositive());
      assert.ok(new Money(-1, 0).isNegative());
      assert.ok(!new Money(0, 0).isNegative());
      assert.ok(!new Money(1, 0).isNegative());
      assert.ok(new Money(0, -1).isNegative());
      assert.ok(new Money(0, 0).isZero());
      assert.ok(!new Money(1, 0).isZero());
      assert.ok(!new Money(-1, 0).isZero());

      m = Money.fromString("12.34");
      assert.strictEqual(12, m.getDollars());
      assert.strictEqual(34, m.getCents());

      m = Money.fromString("12");
      assert.strictEqual(12, m.getDollars());
      assert.strictEqual(0, m.getCents());

      m = Money.fromString("-12");
      assert.strictEqual(-12, m.getDollars());
      assert.strictEqual(0, m.getCents());

      assertException(assert, /invalid format/i, Money.fromString.curry("1.5"));
      assertException(assert, /invalid format/i, Money.fromString.curry("1.123"));

      // Invalid arguments.
      assertException(assert, /string was empty/i, Money.fromString.curry(""));
      assertException(assert, /string was null/i, Money.fromString.curry(null));
      assertException(assert, /invalid format/i, Money.fromString.curry("12."));


      assert.ok(new Money(12, 34).equals(new Money(12, 34)));
      assert.ok(!new Money(12, 34).equals(new Money(12, 35)));

      var m12 = new Money(1, 2);
      var m13 = new Money(1, 3);
      var m21 = new Money(2, 1);

      assert.ok(m12.lt(m13));
      assert.ok(m13.gt(m12));
      assert.ok(m12.lt(m21));
      assert.ok(m21.gt(m12));

      assert.ok(m12.negate().negate().equals(m12));
      assert.ok(m12.equals(new Money(-1, 2).negate()));
      assert.ok(new Money(-1, 2).equals(new Money(1, 2).negate()));
      assert.ok(new Money(0, -1).equals(new Money(0, 1).negate()));
      assert.ok(new Money(0, 1).equals(new Money(0, -1).negate()));

      assert.ok(new Money(1, 2).equals(new Money(-1, 2).negate()));
    }
  };
})();
