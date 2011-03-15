module.exports = (function () {
  var AC = CactusJuice.Data.ArrayController;
  var ACD = CactusJuice.Data.ArrayControllerDecorator;

  function objs(ac) {
    return ac.getRange().join(",");
  }

  return {
    "init" : function () {
      var ac = new AC([1,2,3]);
      var acd = new ACD(ac);
      assert.ok(acd instanceof ACD);

      assert.strictEqual(ac, acd.getComponent());
      var acd2 = new ACD(acd);
      assert.strictEqual(acd, acd2.getComponent());
      assert.strictEqual(ac, acd2.getComponent().getComponent());
      assert.strictEqual(ac, acd.getRootComponent());
      assert.strictEqual(ac, acd2.getRootComponent());
    },

    "object propagation" : function () {
      var ac = new AC([1, 2, 3]);
      var acd = new ACD(ac);

      assert.strictEqual("123", ac.getRange().join(""));

      // Add object to ac.
      ac.add(4);
      assert.strictEqual("1234", acd.getRange().join(""));

      // Add to acd.
      acd.add(5);
      assert.strictEqual("12345", acd.getRange().join(""));
      assert.strictEqual("12345", ac.getRange().join(""));

      // Remove from ac.
      ac.remove(3);
      assert.strictEqual("1245", acd.getRange().join(""));

      // Remove from acd.
      acd.remove(2);
      assert.strictEqual("145", acd.getRange().join(""));
      assert.strictEqual("145", ac.getRange().join(""));

      // Swap on ac.
      ac.swap(0, 1);
      assert.strictEqual("415", acd.getRange().join(""));

      // Swapping on acd.
      acd.swap(0, 1);
      assert.strictEqual("145", acd.getRange().join(""));
    },

    "chain of responsibility" : function () {
      var ac = new AC([1, 2, 3]);
      var acd = new ACD(ac);
      var triggered = false;
      acd.f = function () {
        assert.strictEqual(acd, this);
        triggered = true;
      };
      ACD.createChainOfResponsibilityMethod("f");
      var acd2 = new ACD(acd);

      acd.f();

      // triggering of CoR method.
      assert.ok(triggered);

      // Add several methods using createChainOfResponsibilityMethods.
      var gTriggered;
      acd.g = function () {
        gTriggered = true;
      };
      var hTriggered;
      acd.h = function () {
        hTriggered = true;
      };
      ACD.createChainOfResponsibilityMethods("g", "h");

      acd2.g();
      acd2.h();

      assert.ok(gTriggered);
      assert.ok(hTriggered);

      // The return value should propagate.
      acd.i = function () {
        return "i";
      };
      ACD.createChainOfResponsibilityMethod("i");
      assert.strictEqual("i", acd2.i());
    },

    "replace" : function () {
      var ac = new AC([1, 2]);
      var acd = new ACD(ac);

      // Replace on ac.
      ac.replace(1, 4);
      assert.strictEqual("42", ac.getRange().join(""));
      assert.strictEqual("42", acd.getRange().join(""));

      // Replace on acd.
      acd.replace(4, 5);
      assert.strictEqual("52", ac.getRange().join(""));
      assert.strictEqual("52", acd.getRange().join(""));
    },

    "addAtIndex" : function () {
      var ac = new AC([1, 2]);
      var acd = new ACD(ac);

      // Call on ac.
      ac.addAtIndex(0, 3);
      assert.strictEqual("3,1,2", objs(ac));
      assert.strictEqual("3,1,2", objs(acd));

      // Call on acd.
      acd.addAtIndex(0, 4);
      assert.strictEqual("4,3,1,2", objs(acd));
      assert.strictEqual("4,3,1,2", objs(ac));
    }
  };
})();
