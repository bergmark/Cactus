var Joose = require('Joose');
var Assertion = require('Dev/Assertion');
require('Util/EventPool');

module.exports = (function () {
  var EventPool = CactusJuice.Util.EventPool;
  return {
    // Create a new event, subscribe, trigger.
    newEvent : function (assert) {
      var pool = new EventPool();
      pool.createEvent("Foo");
      var triggered = false;
      assert.ok("onFoo" in pool);
      pool.subscribe("Foo", function () {
        triggered = true;
      });
      pool.onFoo();
      assert.ok(triggered);
    },

    // Shall not be able to create an event that already exists.
    "existing event" : function (assert) {
      var pool = new EventPool();
      pool.createEvent("Foo");
      Assertion.assertException(assert, /EventPool.+Foo.+exists/, pool.createEvent.bind(pool, "Foo"));
    },

    // Object owning event should get the onEventName function.
    "onEventName" : function (assert) {
      var pool = new EventPool();
      var o = {};
      pool.createEvent("Foo", o);
      assert.ok("onFoo" in o, "Object creating event lacks onFoo method.");
      var receivedArg;
      pool.subscribe("Foo", function (arg, foo) {
        receivedArg = foo;
      });
      o.onFoo("foo");
      assert.eql("foo", receivedArg);
    }
  };
})();
