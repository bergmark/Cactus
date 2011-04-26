/**
 * @file
 * Money is a value object representing a monetary value. It does not use
 * floating point numbers, so it avoids rounding errors.
 * The only operation that may cause stray cents is split, it assures that no
 * cents vanish by distributing as evenly as possible among the parts it splits into.
 *
 * Money has no notion of currency, so working in a single currency -- no matter
 * which one -- is appropriate usage.
 *
 * In lack of better terminology, Money uses "dollars" and "cents".
 *
 * One dollar is assumed to be 100 cents.
 *
 * The cent number is guaranteed to be below 100.
 */
Module("Cactus.Data", function (m) {

  /**
   * @param natural dollars
   * @param natural cents
   *   if > 100 then dollars are added until cents < 100.
   */
  var Money = Class("Money", {
    has : {
      /**
       * @type int
       */
      amount : null
    },
    methods : {
      BUILD : function (dollars, cents) {
        var dollars = parseInt(dollars, 10);
        var cents = parseInt(cents, 10);

        if (dollars !== 0 && cents < 0) {
          throw new Error("Money: cents < 0");
        }
        if (isNaN(dollars)) {
          throw new Error("Money: dollars is NaN");
        }
        if (isNaN(cents)) {
          throw new Error("Money: cents is NaN");
        }

        return {
          amount : dollars * 100 + (dollars < 0 ? -1 * cents : cents)
        };
      },
      /**
       * @return int
       */
      _getAmount : function () {
        return this.amount;
      },
      /**
       * @return natural
       */
      getDollars : function () {
        if (this.amount < 0) {
          return Math.ceil(this.amount / 100);
        } else {
          return Math.floor(this.amount / 100);
        }
      },
      /**
       * @return natural
       */
      getCents : function () {
        if (this.amount < 0 && this.getDollars() === 0) {
          return this.amount % 100;
        } else {
          return Math.abs(this.amount % 100);
        }
      },
      /**
       * The value with zero padded cents if < 100, and . used as the decimal
       * separator.
       *
       * @return string
       */
      toString : function () {
        if (this.isNegative()) {
          if (this.gt(new Money(-1, 0))) {
            var cents = (-this.getCents()) < 10
              ? "0" + (-this.getCents()) : (-this.getCents());
            return "-0." + cents;
          }
        }
        var cents = this.getCents() < 10
          ? "0" + this.getCents() : this.getCents();
        return this.getDollars() + "." + cents;
      },
      /**
       * @param Money money
       * @return Money
       */
      add : function (money) {
        return Money._fromAmount(this._getAmount() + money._getAmount());
      },
      /**
       * @param Money money
       * @return Money
       */
      sub : function (money) {
        return Money._fromAmount(this._getAmount() - money._getAmount());
      },
      /**
       * @param number multiplier
       * @return Money
       */
      mult : function (multiplier) {
        return Money._fromAmount(this._getAmount() * multiplier);
      },
      /**
       * @return Boolean
       */
      isPositive : function () {
        return this._getAmount() > 0;
      },
      /**
       * @return Boolean
       */
      isNegative : function () {
        return this._getAmount() < 0;
      },
      /**
       * @return Boolean
       */
      isZero : function () {
        return this._getAmount() === 0;
      },
      /**
       * @param Money money
       * @return Boolean
       */
      equals : function (money) {
        return this._getAmount() === money._getAmount();
      },
      /**
       * @param Money money
       * @return Boolean
       */
      gt : function (money) {
        return this._getAmount() > money._getAmount();
      },
      /**
       * @param Money money
       * @return Boolean
       */
      lt : function (money) {
        return money.gt(this);
      },
      /**
       * @param Money money
       * @return Money
       */
      negate : function () {
        return Money._fromAmount(-this._getAmount());
      },
      /**
       * Splits the object into parts, the remaining cents are distributed from
       * the first element of the result and onward.
       *
       * @param int divisor
       * @return Array<Money>
       */
      split : function (divisor) {
        var dividend = this._getAmount();
        var quotient = Math.floor(dividend / divisor);
        var remainder = dividend - quotient * divisor;
        var res = [];
        var moneyA = Money._fromAmount(quotient + 1);
        var moneyB = Money._fromAmount(quotient);
        for (var i = 0; i < remainder; i++) {
          res.push(moneyA);
        }
        for (i = 0; i < divisor - remainder; i++) {
          res.push(moneyB);
        }
        return res;
      },
      /**
       * @return Hash{
       *   dollars : int,
       *   cents : int
       * }
       */
      serialize : function () {
        return {
          dollars : this.getDollars(),
          cents : this.getCents()
        };
      }
    }
  });

  /**
   * @param String s
   * @return Money
   */
  Money.fromString = function (s) {
    if (s === null) {
      throw new Error("Money.fromString: String was null.");
    }
    if (s === "") {
      throw new Error("Money.fromString: String was empty.");

    }

    if (!/^-?\d+(?:\.\d{2})?$/.test(s)) {
      throw new Error("Money.fromString: Invalid format, got: " + s);
    }

    var a = s.split(".");
    if (a.length === 1) {
      return new Money(parseInt(a[0], 10), 0);
    } else if (a.length === 2) {
      return new Money(parseInt(a[0], 10), parseInt(a[1], 10));
    } else {
      throw new Error("Money:fromString: BUG: RegExp should have prevent this from happening.");
    }
  };

  /**
   * @param int amount
   * @return Money
   */
  Money._fromAmount = function (amount) {
    if (amount > 0) {
      return new Money(Math.floor(amount / 100), amount % 100);
    } else {
      return new Money(Math.ceil(amount / 100), Math.abs(amount) < 100 ? (amount % 100) : -(amount % 100));
    }
  };
  /**
   * @param Array<Money> ms
   * @return Money
   */
  Money.sum = function (ms) {
    var sum = new Money(0, 0);
    for (var i = 0; i < ms.length; i++) {
      sum = sum.add(ms[i]);
    }
    return sum;
  };

  m.Money = Money;
});
