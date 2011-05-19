module.exports = {
  "bind" : function () {
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

  "curry" : function () {
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

  "extend instanceof" : function () {
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
  "extend" : function () {
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
  "extend subclassing" : function () {
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

  "empty" : function () {
    assert.ok(Function.empty instanceof Function);
    Function.empty();
  },

  "returning" : function () {
    assert.eql(2, (function () {
      return 1;
    }).returning(2)());
    assert.eql(3, Function.empty.returning(3)());
  },

  // Make sure that returning passes all arguments it gets through
  // to the inner function.
  "returning pass to inner" : function () {
    var test = this;
    assert.eql(4, (function (a, b, c) {
      assert.eql(1, a);
      assert.eql(2, b);
      assert.eql(3, c);
    }).returning(4)(1, 2, 3));
  },

  // Should call the inner function in the scope of the outer.
  "returning scope" : function () {
    var o = {};
    var test = this;
    (function () {
      assert.eql(o, this);
    }).returning(0).call(o);
  },

  "filter" : function () {
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

  "filter 2" : function () {
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

  wait : function () {
    var t = new Date();
    (function () {
      var t2 = new Date();
      // due to the inexact behavior of setTimeout, the diff may be lower than
      // the specified time.
      assert.ok(t2 - t >= 3,
                "t(%s) - time(%s) = %s".format(t2.getMilliseconds(),
                                               t.getMilliseconds(),
                                               t2 - t));
    }).wait(50)();
  },
  // The scope of wait's returned function should propagate to the delayed
  // function.
  "wait scope" : function () {
    var o = {};
    (function () {
      assert.strictEqual(o, this);
    }).wait(20).call(o);
  },

  // Arguments should propagate from the function that executes the timeout
  // to the delayed function.
  "wait arg propagation" : function () {
    var timeout;
    var arg0 = {};
    var arg1 = {};
    (function (a, b) {
      assert.strictEqual(arg0, a);
      assert.strictEqual(arg1, b);
    }).wait(0)(arg0, arg1);
  },

  "once" : function () {
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

  "skip" : function () {
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

  "none" : function () {
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

  "exec" : function () {
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

  "partial" : function () {
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

  "id" : function () {
    assert.eql(1, Function.id(1));
    var o = {};
    assert.eql(o, Function.id({}));
  },

  freeze : function () {
    var triggered = false;
    var o = {};
    (function () {
      triggered = true;
      assert.strictEqual(1, arguments.length);
      assert.strictEqual(0, arguments[0]);
      assert.ok(this !== o);
    }).curry(0).freeze().call(o, 1, 2, 3);
    assert.ok(triggered);
  },
  "take/drop" : function () {
    var f = function () {
      assert.eql([1,2,3], arguments);
    };
    f.drop(0)(1,2,3);
    f.drop(1)(0,1,2,3);
    f.drop(2)(-1,1,2,3);

    f.take(3)(1,2,3);
    f.curry(1,2,3).take(0)(4);
    f.take(3)(1,2,3,4);
   }
};
