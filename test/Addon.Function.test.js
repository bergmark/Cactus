var Joose = require('Joose');
require('../CactusJuice.js');

module.exports = {
  "bind" : function (assert) {
    var t = this;
    var o = {};
    var f;

    // Call in scope of o.
    f = (function () {
      assert.eql(o, this);
    }).bind(o);

    // Call in scope of o passing args to bind.
    f = (function (a, b) {
      assert.eql(1, a);
      assert.eql(2, b);
      assert.strictEqual(o, this);
    }).bind(o, 1, 2);

    f();

    // Call in scope of o passing args to f.
    f = (function (a, b) {
      assert.eql(3, a);
      assert.eql(4, b);
      assert.strictEqual(o, this);
    }).bind(o);

    f(3, 4);

    // Call in scope of o passing args to bind and f.
    f = (function (a, b, c, d) {
      assert.eql(5, a);
      assert.eql(6, b);
      assert.eql(7, c);
      assert.eql(8, d);
      assert.eql(o, this);
    }).bind(o, 5, 6);

    f(7,8);

    // Make sure no extra arguments are passed.
    (function () {
      assert.eql(3, arguments.length);
    }).bind(null, 0, 1, 2)();

    // > Should pass along the scope from the bind call if first arg to bind
    // is null.
    var o = {};
    (function () {
      assert.eql(o, this);
    }).bind(null).call(o);
  },

  "curry" : function (assert) {
    var o = {};
    var test = this;

    // Curry arg.
    (function (a, b) {
      assert.eql("a", a);
      assert.eql("b", b);
    }).curry("a", "b")();

    // Call in scope of curry call.
    (function () {
      assert.eql(o, this);
    }).curry().call(o);

    // Pass along args to curried function.
    (function (c, d) {
      assert.eql("c", c);
      assert.eql("d", d);
    }).curry()("c", "d");

    // Combine curried arguments and passed arguments.
    (function (a, b, c, d) {
      assert.eql("a", a);
      assert.eql("b", b);
      assert.eql("c", c);
      assert.eql("d", d);
    }).curry("a", "b")("c", "d");
  },

  "extend instanceof" : function (assert) {
    function A() { }
    function B() { }
    B.extend(A);
    assert.ok(new A() instanceof A);
    assert.ok(new B() instanceof B);
    assert.ok(new B() instanceof A);
    assert.strictEqual(A, B.SuperClass);
    assert.strictEqual(A, new B().SuperClass);
  },

  // Test inheritance and overrides.
  "extend" : function (assert) {
    function A() { }
    A.prototype.x = 1;
    A.prototype.y = 2;
    function B() { }
    B.prototype.y = 3;
    B.prototype.z = 4;
    B.extend(A);

    var a = new A();
    var b = new B();
    assert.eql(1, a.x);
    assert.eql(2, a.y);
    assert.eql(1, b.x);
    assert.eql(3, b.y);
    assert.eql(4, b.z);
  },

  // Classes should be able to intervene when they are subclassed.
  "extend subclassing" : function (assert) {
    function A() {}
    A.__onExtend = function (SubClass) {
      SubClass.x = 1;
    };
    function B() {}
    B.extend(A);
    assert.eql(1, B.x);

    // Should propagate up the inheritance chain.
    B.__onExtend = function (SubClass) {
      SubClass.y = 2;
    };
    function C() {}
    C.extend(B);
    C.__onExtend = function (SubClass) {
      SubClass.y = 3;
    };
    function D() {}
    D.extend(C);
    assert.eql(1, D.x);
    assert.eql(3, D.y);
  },

  "empty" : function (assert) {
    assert.ok(Function.empty instanceof Function);
    Function.empty();
  },

  "returning" : function (assert) {
    assert.eql(2, (function () {
      return 1;
    }).returning(2)());
    assert.eql(3, Function.empty.returning(3)());
  },

  // Make sure that returning passes all arguments it gets through
  // to the inner function.
  "returning pass to inner" : function (assert) {
    var test = this;
    assert.eql(4, (function (a, b, c) {
      assert.eql(1, a);
      assert.eql(2, b);
      assert.eql(3, c);
    }).returning(4)(1, 2, 3));
  },

  // Should call the inner function in the scope of the outer.
  "returning scope" : function (assert) {
    var o = {};
    var test = this;
    (function () {
      assert.eql(o, this);
    }).returning(0).call(o);
  },

  "filter" : function (assert) {
    var called = false;
    function f() {
      called = true;
    }

    f.filter(1)(1);
    assert.ok(called, "filter(1)(1) did not call f");

    called = false;
    f.filter(2)(3);
    assert.ok(!called, "filter(2)(3) called f");

    called = false;
    f.filter(4, 5)(4, 5);
    assert.ok(called, "(4,5)(4,5) did not call f");

    called = false;
    f.filter(6, 7)(6);
    assert.ok(!called, "67 6 called f");

    called = false;
    f.filter(8)(8, 9);
    assert.ok(called, "8 89 did not call f");

    called = false;
    f.filter([])([]);
    assert.ok(!called, "[] [] called f");

    called = false;
    f.filter(undefined)(1);
    assert.ok(called, "undefined 1 called f");
    },

  "filter 2" : function (assert) {
    var t = this;
    var triggered = false;
    var f = function (a, b, c) {
      triggered = true;
      assert.eql(3, arguments.length);
      assert.eql("x", a);
      assert.eql("y", b);
      assert.eql("z", c);
    };

    f.filter("x")("x", "y", "z");
    assert.ok(triggered, "filter(x)(x, y, z) did not trigger");
  },

  // TODO: Refactor to expresso async tests.
  // Github issue #1.
  /*
  // wait.
  tc.addTest(new Test(function () {
    var t = new Date();
    this.processResults.bind(this, t).wait(50)();
  }, function (time) {
    var t = new Date();
    // Due to the inexact behavior of setTimeout, the diff may be lower than
    // the specified time.
    assert.ok(t - time >= 3,
              "t(%s) - time(%s) = %s".format(t.getMilliseconds(),
                                             time.getMilliseconds(),
                                             t - time));
  }));
  // The scope of wait's returned function should propagate to the delayed
  // function.
  tc.addTest(new Test(function () {
    this.processResults.bind(null).wait(20).call(this);
  }, function () {
    assert.ok(true);
  }));

  // Arguments should propagate from the function that executes the timeout
  // to the delayed function.
  (function () {
    var timeout;
    var arg0 = {};
    var arg1 = {};
    tc.addTest(new Test(function () {
      var that = this;
      timeout = setTimeout(this.processResults.bind(this, "timeout"),
                           1000);
      var f = this.processResults.bind(this).wait(0);
      f(arg0, arg1);
    }, function (a, b) {
      clearTimeout(timeout);
      assert.ok(a !== "timeout", "Test timed out.");
      assert.eql(arg0, a);
      assert.eql(arg1, b);
    }));
  })();
  */

  "once" : function (assert) {
    var executions = 0;

    var test = this;
    var f = function (a, b) {
      assert.eql("a", a);
      assert.eql("b", b);
      executions++;
      return "foo";
    }.once();

    assert.eql(0, executions);
    assert.eql("foo", f("a", "b"));
    assert.eql(1, executions);
    assert.eql(null, f());
    assert.eql(1, executions);
  },

  "skip" : function (assert) {
    var test = this;

    // Skip one argument.
    var triggered = false;
    (function (b, c) {
      triggered = true;
      assert.eql(2, arguments.length);
      assert.eql("b", b);
      assert.eql("c", c);
    }).skip(1)("a", "b", "c");
    assert.ok(triggered);

    // Skip two arguments.
    (function (c) {
      assert.eql(1, arguments.length, "Not 1 argument.");
      assert.eql("c", c);
    }).skip(2)("a", "b", "c");

    // Skip no arguments.
    (function (a, b) {
      assert.eql(2, arguments.length);
      assert.eql("a", a);
      assert.eql("b", b);
    }).skip(0)("a", "b");

    // Skip more arguments than are passed to the skipper.
    (function (a, b) {
      assert.eql(0, arguments.length);
    }).skip(2)();

    // Keep scope.
    var o = {};
    (function () {
      assert.eql(o, this);
    }).skip().call(o);
  },

  "none" : function (assert) {
    var test = this;
    var o = {};
    var triggered = false;
    (function () {
      triggered = true;
      assert.eql(0, arguments.length);
      assert.eql(o, this);
    }).none().call(o, "a", "b", "c");
    assert.ok(triggered, "Inner function did not trigger.");

    triggered = false;
    (function () {
      triggered = true;
      assert.eql(2, arguments.length);
    }).curry(1, 2).none()(3,4);
    assert.ok(triggered, "Inner function did not trigger.");
  },

  "exec" : function (assert) {
    var test = this;
    var triggers = 0;
    function f() {
      triggers++;
      return "foo";
    }
    assert.eql(f, f.exec());
    assert.eql(1, triggers);
    assert.eql("foo", f.exec()());
    assert.eql(3, triggers);
  },

  "partial" : function (assert) {
    var scope;
    var got;
    var f = function () {
      scope = this;
      got = arguments;
    };
    var o = {};
    f.partial(o, 0, undefined, 2)(1,3,4);
    assert.eql("0,1,2,3,4", Array.prototype.join.call(got, ","));
    assert.ok(o === scope);
    f.partial(o, 0, undefined)(1,2);
  },

  "id" : function (assert) {
    assert.eql(1, Function.id(1));
    var o = {};
    assert.eql(o, Function.id({}));
  }
};
