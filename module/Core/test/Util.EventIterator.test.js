var EventIterator = Cactus.Util.EventIterator;
var EventSubscription = Cactus.Util.EventSubscription;
var C = Class({
  does : EventSubscription,
  has : {
    v : null
  },
  methods : {
    BUILD : function (v) {
      this.value = v;
    },
    onFinish : Function.empty,
    funcCalled : false,
    beforeCalled : false,
    afterCalled : false
  }
});
module.exports = {
  forwardIteration : function (done) {
    var test = this;
    var v = -1;
    var a = [];
    C.prototype.f = function () {
      assert.ok(v < this.value, "v >= this.value");
      v = this.value;
      setTimeout(this.onFinish.bind(this), 0);
    };
    for (var i = 0; i < 10; i++) {
      a.push(new C(i));
    }

    var ei = new EventIterator(a, "f", "Finish");

    ei.subscribe("Finish", function () {
      delete C.prototype.f;
      done();
    });
    ei.startForward();
  },
  backwardIteration : function (done) {
    var test = this;
    var v = 10;
    var a = [];
    for (var i = 0; i < 10; i++) {
      a.push(new C(i));
    }
    C.prototype.f = function () {
      assert.ok(v > this.value, "v <= this.value");
      v = this.value;
      setTimeout(this.onFinish.bind(this), 0);
    };

    var ei = new EventIterator(a, "f", "Finish");

    ei.subscribe("Finish", function () {
      delete C.prototype.f;
      done();
    });

    ei.startBackward();
  },
  "before/afterProcessing" : function (done) {
    var test = this;
    var a = [];
    for (var i = 0; i < 10; i++) {
      a.push(new C(i));
    }
    C.prototype.f = function () {
      this.funcCalled = true;
      setTimeout(this.onFinish.bind(this), 1);
    };

    var ei = new EventIterator(a, "f", "Finish");
    ei.setBeforeProcessing(function () {
      this.beforeCalled = true;
    });
    ei.setAfterProcessing(function () {
      this.afterCalled = true;
    });
    ei.subscribe("Finish", function () {
      delete C.prototype.f;
      var v;
      for (var i = 0; i < a.length; i++) {
        v = a [i];
        assert.ok(v.funcCalled, "func was not called");
        assert.ok(v.beforeCalled, "before was not called");
        assert.ok(v.afterCalled, "after was not called");
      }
      done();
    });
    ei.startForward();
  },
  // Check the order of the events and make sure they trigger.
  "onItemProcessed and onBeforeItemProcess" : function (done) {
    var log = [];
    var test = this;
    var a = [];
    for (var i = 0; i < 2; i++) {
      a.push(new C(i));
    }
    C.prototype.f = function () {
      log.push("process: " + this.value);
      setTimeout(this.onFinish.bind(this), 1);
    };

    var ei = new EventIterator(a, "f", "Finish");
    ei.subscribe("ItemProcessed", function (ei, item) {
      log.push("processed: " + item.value);
    });
    ei.subscribe("BeforeItemProcess", function (ei, item) {
      log.push("before: " + item.value);
    });
    ei.subscribe("Finish", function () {
      assert.strictEqual("before: 0, process: 0, processed: 0, "
                         + "before: 1, process: 1, processed: 1",
                         log.join(", "));
      done();
    });
    ei.startForward();
  },

  stop : function (done) {
    var test = this;
    var a = [];
    for (var i = 0; i < 10; i++) {
      a.push(new C(i));
      a[a.length - 1].stopTest = true;
    }
    C.prototype.f =  function () {
      this.funcCalled = true;
      setTimeout(this.onFinish.bind(this), 1);
    };
    assert.ok(!a[9].funCalled, "last element started out as called");

    var ei = new EventIterator(a, "f", "Finish");
    ei.setBeforeProcessing(function () {
      this.beforeCalled = true;
    });
    ei.setAfterProcessing(function () {
      this.afterCalled = true;
    });
    ei.subscribe("Finish", function () {
      assert.ok(false, "onFinish triggered.");
    });
    ei.subscribe("Stop", function () {
      delete C.prototype.f;

      // Loop through and check that the last 4-6 objects haven't
      // run  and that no objects are in an inconsistent state.
      // (funcCalled, beforeCalled, afterCalled) should all have the
      // same value.
      assert.ok(a[0].funcCalled, "first element was not called");
      assert.ok(!a[9].funCalled, "last element was called");
      for (var i = 0; i < a.length; i++) {
        assert.ok(this.funcCalled === this.beforeCalled);
        assert.ok(this.funcCalled === this.afterCalled);
      }
      done();
    });
    ei.startForward();
    setTimeout(ei.stop.bind(ei), 1);
  },

  // Methods should be called polymorphically by name and not be specified as
  // functions.
  "polymorphic names" : function (done) {
    var a = [new C(0), new C(1)];
    a[0].f = function () {
      this.triggeredA = true;
      setTimeout(this.onFinish.bind(this), 1);
    };
    a[1].f = function () {
      this.triggeredB = true;
      setTimeout(this.onFinish.bind(this), 1);
    };
    var ei = new EventIterator(a, "f", "Finish");
    ei.subscribe("Finish", function () {
      assert.ok(a[0].triggeredA, "triggeredA did not trigger for a[0]");
      assert.ok(a[1].triggeredB, "triggeredB did not trigger for a[1]");
      done();
    }.bind(this, a));
    ei.startForward();
  }
};
