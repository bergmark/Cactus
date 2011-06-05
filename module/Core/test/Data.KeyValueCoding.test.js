module.exports = (function () {
  var KVC = Cactus.Data.KeyValueCoding;
  return {
    // Test setting and getting values for simple key paths. Reading
    // values right of the properties and using accessor methods.
    a : function () {
      var o = new KVC();
      o.a = 1;

      assert.eql(1, o.getValue("a"));
      o.setValue("a", 2);
      assert.eql(2, o.getValue("a"));

      o.setX = function (v) {
        this.x = v + 1;
      };
      o.getX = function (v) {
        return this.x * -1;
      };
      o.x = 5;

      assert.eql(-5, o.getValue("x"));
      o.setValue("x", 7); // Sets to -8.
      assert.eql(-8, o.getValue("x"));
    },

    "nested paths" : function () {
      var o = new KVC();
      o.p = new KVC();
      o.p.q = new KVC();
      o.a = 1;
      o.p.b = 2;
      o.p.q.c = 3;

      equal(1, o.getValue("a"));
      equal(2, o.getValue("p.b"));
      equal(3, o.getValue("p.q.c"));

      o.setValue("a", 4);
      o.setValue("p.b", 5);
      o.setValue("p.q.c", 6);

      assert.eql(4, o.getValue("a"));
      assert.eql(5, o.getValue("p.b"));
      assert.eql(6, o.getValue("p.q.c"));
    },
    "b" : function () {
      var o   = new KVC();
      o.p     = new KVC();
      o.p.q   = new KVC();
      o.a     = 1;
      o.p.b   = 2;
      o.p.q.c = 3;

      // existing keyPaths
      ok(o.hasKeyPath("a"));
      ok(o.hasKeyPath("p"));
      ok(o.hasKeyPath("p.b"));
      ok(o.hasKeyPath("p.q"));
      ok(o.hasKeyPath("p.q.c"));

      // non-existing keyPaths
      assert.ok(!o.hasKeyPath("b"));
      assert.ok(!o.hasKeyPath("a.q"));
      assert.ok(!o.hasKeyPath("p.q.b"));
      assert.ok(!o.hasKeyPath("p.q.p"));
      assert.ok(!o.hasKeyPath("q.p"));
    },

    "onValueChanged" : function () {
      var o = new KVC();
      o.p = null;
      o.setValue("p", new KVC());
      o.p.q = null;
      o.setValue("p.q", new KVC());
      o.p.q.r = null;
      o.setValue("p.q.r", new KVC());
      var triggered = false;
      var objectArg;
      var keyPathArg;
      o.subscribe("ValueChanged", function (object, keyPath) {
        triggered = true;
          objectArg = object;
        keyPathArg = keyPath;
      }, true);

      o.setValue("p.q.r", 5);

      assert.ok(triggered, "onValueChanged was not triggered for o");
      assert.eql(o, objectArg);
      assert.eql("p.q.r", keyPathArg);
    },

    // Throw an error if trying to set/get value of KP "value" or
    // checking if "value" exists as a KP.
    "c" : function () {
      var o = new KVC();
      o.value = 1;

      exception(/value.+reserved/, o.setValue.bind(o, "value", "bar"));
      exception(/value.+reserved/, o.getValue.bind(o, "value"));
    },

    // Naming a property "isX" should not interfere with properties named "X".
    e : function () {
      var o = new KVC();
      o.isX = 3;
      o.x = 2;
      assert.eql(2, o.getValue("x"));
      assert.eql(3, o.getValue("isX"));
    },

    // A root should listen to its aggregates for changes, so that
    // onValueChanged can be triggered for it (along with compounds).
    f : function () {
      var O = Class({
        does : KVC,
        has : {
          p : null,
          p2 : null,
          _compounds : { init : function () { return { p : ["p2"] }; } }
        },
        methods : {
          getP2 : function () {
            return this.p;
          }
        }
      });

      var P = Class({
        does : KVC,
        has : {
          q : null
        }
      });

      var o = new O();
      var valueChanges = {};
      o.subscribe("ValueChanged", function (_, keyPath) {
        if (!(keyPath in valueChanges)) {
          valueChanges[keyPath] = 0;
        }
        valueChanges[keyPath]++;
      });
      var p = new P();
      o.setValue("p", p);

      assert.eql(1, valueChanges.p, "p");
      assert.eql(1, valueChanges.p2, "p2");

      p.setValue("q", "r");
      assert.eql(1, valueChanges.p);
      assert.eql(1, valueChanges["p.q"]);

      var p2 = new P();
      o.setValue("p", p2);
      assert.eql(2, valueChanges.p);
      p.setValue("q", "r2");
      assert.eql(1, valueChanges["p.q"]);
      p2.setValue("q", "r3");
      assert.eql(2, valueChanges["p.q"]);

      // Keypaths more than one level down should not be subscribed to,
      // since these event will propagate.
      var p3 = new P();
      p2.setValue("q", p3);
      assert.eql(3, valueChanges["p.q"]);
      o.setValue("p.q.q", "r4");
      assert.eql(1, valueChanges["p.q.q"]);
    },

    // Setters should not prevent events from occurring.
    g : function () {
      var Q = Class({
        does : KVC,
        has : {
          y : {
            init : 2
          }
        },
        methods : {
          setY : function (y) {
            this.y = y + 1;
          },
          getY : function () {
            return this.y * -1;
          }
        }
      });
      var o = new Q();

      var valueChanges = {};
      o.subscribe("ValueChanged", function (_, keyPath) {
        if (!(keyPath in valueChanges)) {
          valueChanges[keyPath] = 0;
        }
        valueChanges[keyPath]++;
      });
      assert.eql(-2, o.getValue("y"));
      o.setValue("y", 9);
      assert.eql(-10, o.getValue("y"));
      assert.eql(1, valueChanges.y);
    },

    // Should not trigger onValueChanged if a value is set to the same
    // as an old value.
    h : function () {

      var R = Class({
        has : {
          x : null
        },
        does : KVC
      });
      var o = new R();
      var changes = [];
      o.subscribe("ValueChanged", function (o, kp) {
        changes.push([kp, o.getValue(kp)]);
      });
      o.setValue("x", 1);
      assert.eql(1, changes.length);
      o.setValue("x", 2);
      assert.eql(2, changes.length);
      o.setValue("x", 2);
      assert.eql(2, changes.length,
                       "Triggered event when value did not change.");

      o = new KVC();
      o.p = new KVC();
      o.p.q = 1;
      changes = [];
      o.subscribe("ValueChanged", function (o, kp) {
        changes.push([o, kp, o.getValue(kp)]);
      });
      o.setValue("p.q", 1);
      assert.eql(0, changes.length);
    },

    // get should concatenate its arguments into a keypath.
    i : function () {
      var o = new KVC();
      o.p = new KVC();
      o.p.q = new KVC();
      o.p.q.r = 1;
      assert.eql(1, o.getValue("p","q","r"));
      assert.eql(1, o.getValue("p.q","r"));
      assert.eql(1, o.getValue("p","q.r"));
    },

    addToInstance : function () {
      var o = KVC.addToInstance({ x : 1, y : { z : 2 } });

      // Getting.
      equal(1, o.getValue("x"));
      equal(o.y, o.getValue("y"));
      equal(2, o.getValue("y.z"));

      // Setting.
      o.setValue("x", 3);
      o.setValue("y.z", 4);
      equal(3, o.getValue("x"));
      equal(4, o.getValue("y.z"));
      o.setValue("y", 3);
    }
  };
})();
