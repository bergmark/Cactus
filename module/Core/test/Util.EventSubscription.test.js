module.exports = (function () {
  var EventSubscription = Cactus.Util.EventSubscription;

  var C = Class({
    does : EventSubscription,
    methods : {
      onFoo : Function.empty,
      onBar : Function.empty
    }
  });

  function S() {
  } S.prototype = {
    onFooTriggered : Function.empty,
    onBarTriggered : Function.empty
  };

  return {
    init : function () {
      var c = new C();

      c.onFoo();

      assert.ok(!c._hasEvent("Foo"));
      assert.ok(!c._hasEvent("onFoo"));
      assert.ok(c.implementsEvent("Foo"), "Foo is not implemented");
      assert.ok(!c.implementsEvent("onFoo"));
    },

    // Whitebox.
    "_createEvent and _hasEvent." : function () {
      var c = new C();

      assert.ok(!c._hasEvent("Foo"));
      assert.ok(!c._hasEvent("onFoo"));

      c._createEvent("Foo");

      assert.ok(c._hasEvent("Foo"), "does not have event Foo");
      assert.ok(!c._hasEvent("onFoo"));
    },

    subscribe : function () {
      var c = new C();
      var s = new S();
      var test = this;

      c.subscribe("Foo", s);

      assert.eql(s, c._subscribers.Foo[0].getSubscriber());

      var triggered = false;
      s.onFooTriggered = function (o) {
        triggered = true;
        assert.eql(c, o);
        assert.eql(s, this);
      };
      c.onFoo();
      assert.ok(triggered, "not triggered");
    },

    // Make sure different events don't interfere with each other.
    "no interference" : function () {
      var c = new C();
      var s = new S();
      var test = this;

      c.subscribe("Foo", s);
      c.subscribe("Bar", s);

      var triggeredFoo = false;
      var triggeredBar = false;
      s.onFooTriggered = function () {
        triggeredFoo = true;
      };
      s.onBarTriggered = function () {
        triggeredBar = true;
      };
      c.onFoo();
      assert.ok(triggeredFoo, "foo not triggered");
      assert.ok(!triggeredBar, "bar was not triggered");

      triggeredFoo = false; triggeredBar = false;
      c.onBar();
      assert.ok(!triggeredFoo, "foo was triggered");
      assert.ok(triggeredBar, "bar was not triggered");
    },

    "notify observers" : function () {
      var c = new C();
      var s1 = new S();
      var s2 = new S();

      var s1triggered = false;
      var s2triggered = false;
      s1.onFooTriggered = function () {
        s1triggered = true;
      };
      s2.onFooTriggered = function () {
        s2triggered = true;
      };
      c.subscribe("Foo", s1);
      c.subscribe("Foo", s2);
      c.onFoo();

      assert.ok(s1triggered);
      assert.ok(s2triggered);
    },

    // Test subscribing with a function.
    "function subscription" : function () {
      var c = new C();

      var triggered = false;
      c.subscribe("Foo", function () {
        triggered = true;
      });
      c.onFoo();
      assert.ok(triggered, "subscriber function was not triggered");
    },

    "automatic subscription removal" : function () {
      var c = new C();
      var o = { onFooTriggered : Function.empty };
      var p = { onFooTriggered : Function.empty };
      c.subscribe("Foo", o, true);
      c.subscribe("Foo", p);
      assert.eql(o, c._subscribers.Foo[0].getSubscriber());
      assert.eql(p, c._subscribers.Foo[1].getSubscriber());
      assert.eql(2, c._subscribers.Foo.length);
      c.onFoo();
      assert.eql(1, c._subscribers.Foo.length,
                 "Subscription was not removed");
      assert.eql(p, c._subscribers.Foo[0].getSubscriber());

      var oFooTriggered = false;
      o.onFooTriggered = function () {
        oFooTriggered = true;
      };
      var pFooTriggered = false;
      p.onFooTriggered = function () {
        pFooTriggered = true;
      };
      c.onFoo();
      assert.ok(!oFooTriggered);
      assert.ok(pFooTriggered);

      // Create and remove only one subscription.
      c = new C();
      o = { onFooTriggered : Function.empty };
      c.subscribe("Foo", o, true);
      c.onFoo();
      assert.eql(0, c._subscribers.Foo.length);

      // Removal when the subscriber is a function.
      c = new C();
      var triggers = 0;
      c.subscribe("Foo", function () {
        triggers++;
      }, true);
      c.onFoo();
      c.onFoo();
      assert.eql(1, triggers);
    },

    // Make sure all arguments passed to the event by the observable
    // are passed along to the subscribers.
    "pass along args to subscribers" : function () {
      var c = new C();
      var args;
      c.subscribe("Foo", function (object, arg1, arg2) {
        args = arguments;
      });
      c.onFoo("bar", "baz");
      assert.eql(c, args[0]);
      assert.eql("bar", args[1]);
      assert.eql("baz", args[2]);
    },

    "throw errors for undefined events" : function () {
      var c = new C();
      assert.ok(!c.implementsEvent("Bax"));
      assert.ok(c.implementsEvent("Foo"));
      exception(Error, c.subscribe.bind(null, "Bax", Function.empty));
    },

    "throw error immediately if subscriber doesn't implement onTriggered method" : function () {
      var c = new C();
      exception(/does not implement onFooTriggered/i, c.subscribe.bind(c, "Foo", {}));
    },

    // Test hasSubscriber method.
    "hasSubscriber" : function () {
      var c = new C();
      var o = new S();
      assert.ok(!c.hasSubscriber(o, "Foo"),
                "hasSubscriber false positive");
      c.subscribe("Foo", o);
      assert.ok(c.hasSubscriber(o, "Foo"),
                "hasSubscriber false negative");

      c.removeSubscriber(o, "Foo");
      assert.ok(!c.hasSubscriber(o, "Foo"),
                "hasSubscriber false positive after removal");
    },

    // subscribe should return the subscription ID.
    "subscribe return id" : function () {
      var c = new C();
      var id1 = c.subscribe("Foo", new S());
      var id2 = c.subscribe("Foo", new S());
      assert.ok(id1 !== id2,
                "ID's were equal (%s)".format(id1));
    },

    implementsInterface : function () {
      var p = EventSubscription.implementsInterface;
      assert.ok(p(new C()));
      assert.ok(!p({}));
    },

    // Allow a client to subscribe to all events sent out.
    subscribeAll : function () {
      var c = new C();
      var s = new S();

      var ids = c.subscribeAll(s);
      assert.eql(2, ids.length);
      var fooTriggered = false;
      s.onFooTriggered = function () {
        fooTriggered = true;
      };
      var barTriggered = false;
      s.onBarTriggered = function () {
        barTriggered = true;
      };

      c.onFoo();
      assert.ok(fooTriggered);
      c.onBar();
      assert.ok(barTriggered);

      var eventsTriggered = 0;
      c.subscribeAll(function (_, eventName) {
        eventsTriggered++;
      });
      c.onFoo();
      c.onBar();
      assert.eql(2, eventsTriggered);
    },

    // Should work properly with Joose classes.
    "joose compat" : function () {
      var Foo = Class("Foo", {
        does : EventSubscription,
        has : {
          val : {
            is : "ro",
            init : function () { return []; }
          }
        },
        methods : {
          onBar : Function.empty
        }
      });
      // This breaks if we just copy the prototype.
      assert.ok((new Foo()).getVal() instanceof Array);
      var foo = new Foo();
      var triggered = false;
      foo.subscribe("Bar", function () {
        triggered = true;
      });
      foo.onBar();
      assert.ok(triggered);
    }
  };
})();
