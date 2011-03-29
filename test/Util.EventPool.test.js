require('../Cactus');
module.exports = (function () {
  var EventPool = Cactus.Util.EventPool;
  var assertException = Cactus.Dev.Assertion.exception;

  return {
    "create new event, subscribe, trigger" : function () {
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
    "Shall not be able to create an evente that already exists." : function () {
      var pool = new EventPool();
      pool.createEvent("Foo");
      assertException(assert, /EventPool.+Foo.+exists/, pool.createEvent.bind(pool, "Foo"));
    },
    "Object owning event should get the onEventName function." : function () {
      var pool = new EventPool();
      var o = {};
      pool.createEvent("Foo", o);
      assert.ok("onFoo" in o, "Object creating event lacks onFoo method.");
      var receivedArg;
      pool.subscribe("Foo", function (arg, foo) {
        receivedArg = foo;
      });
      o.onFoo("foo");
      assert.strictEqual("foo", receivedArg);
    }
  };
})();
