module.exports = (function () {
  var AC = Cactus.Data.ArrayController;
  var ACD = Cactus.Data.ArrayControllerDecorator;

  function objs(ac) {
    return ac.getRange().join(",");
  }

  return {
    "init" : function () {
      var ac = new AC([1,2,3]);
      var acd = new ACD(ac);
      ok(acd instanceof ACD);

      equal(ac, acd.getComponent());
      var acd2 = new ACD(acd);
      equal(acd, acd2.getComponent());
      equal(ac, acd2.getComponent().getComponent());
      equal(ac, acd.getRootComponent());
      equal(ac, acd2.getRootComponent());
    },

    "object propagation" : function () {
      var ac = new AC([1, 2, 3]);
      var acd = new ACD(ac);
      var acd2 = new ACD(acd);

      equal("123", ac.getRange().join(""));

      // Add object to ac.
      ac.add(4);
      equal("1234", acd.getRange().join(""));
      equal("1234", acd2.getRange().join(""));

      // Add to acd.
      acd.add(5);
      equal("12345", acd.getRange().join(""));
      equal("12345", ac.getRange().join(""));
      equal("12345", acd2.getRange().join(""));

      // Remove from ac.
      ac.remove(3);
      equal("1245", acd.getRange().join(""));
      equal("1245", acd2.getRange().join(""));

      // Remove from acd.
      acd.remove(2);
      equal("145", acd.getRange().join(""));
      equal("145", ac.getRange().join(""));
      equal("145", acd2.getRange().join(""));

      // Swap on ac.
      ac.swap(0, 1);
      equal("415", acd.getRange().join(""));
      equal("415", acd2.getRange().join(""));

      // Swapping on acd.
      acd.swap(0, 1);
      equal("145", ac.getRange().join(""));
      equal("145", acd.getRange().join(""));
      equal("145", acd2.getRange().join(""));
    },

    "chain of responsibility" : function () {
      var ac = new AC([1, 2, 3]);
      var acd = new ACD(ac);
      var triggered = false;
      acd.f = function () {
        equal(acd, this);
        triggered = true;
      };
      ACD.createChainOfResponsibilityMethod("f");
      var acd2 = new ACD(acd);

      acd.f();

      // triggering of CoR method.
      ok(triggered);

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

      ok(gTriggered);
      ok(hTriggered);

      // The return value should propagate.
      acd.i = function () {
        return "i";
      };
      ACD.createChainOfResponsibilityMethod("i");
      equal("i", acd2.i());
    },

    "replace" : function () {
      var ac = new AC([1, 2]);
      var acd = new ACD(ac);
      var acd2 = new ACD(acd);

      // Replace on ac.
      ac.replace(1, 4);
      equal("42", ac.getRange().join(""));
      equal("42", acd.getRange().join(""));
      equal("42", acd2.getRange().join(""));

      // Replace on acd.
      acd.replace(4, 5);
      equal("52", ac.getRange().join(""));
      equal("52", acd.getRange().join(""));
      equal("52", acd2.getRange().join(""));
    },

    "addAtIndex" : function () {
      var ac = new AC([1, 2]);
      var acd = new ACD(ac);
      var acd2 = new ACD(acd);

      // Call on ac.
      ac.addAtIndex(0, 3);
      equal("3,1,2", objs(ac));
      equal("3,1,2", objs(acd));
      equal("3,1,2", objs(acd2));

      // Call on acd.
      acd.addAtIndex(0, 4);
      equal("4,3,1,2", objs(ac));
      equal("4,3,1,2", objs(acd));
      equal("4,3,1,2", objs(acd2));
    },

    "OnEmptied/OnFilled" : function () {
      var ac = new AC();
      var acd = new ACD(ac);
      var acd2 = new ACD(ac);

      var acEmptied = false;
      var acFilled = false;
      var acdEmptied = false;
      var acdFilled = false;
      var acd2Emptied = false;
      var acd2Filled = false;

      ac.subscribe("Emptied", function () { acEmptied = true; });
      ac.subscribe("Filled", function () { acFilled = true; });
      acd.subscribe("Emptied", function () { acdEmptied = true; });
      acd.subscribe("Filled", function () { acdFilled = true; });
      acd2.subscribe("Emptied", function () { acd2Emptied = true; });
      acd2.subscribe("Filled", function () { acd2Filled = true; });


      ac.add(1);
      ok(acdFilled);
      ok(acd2Filled);
      ac.remove(1);
      ok(acdEmptied);
      ok(acd2Emptied);

      acEmptied = false;
      acFilled = false;
      acdEmptied = false;
      acdFilled = false;
      acd2Emptied = false;
      acd2Filled = false;

      acd.add(1);
      ok(acFilled);
      ok(acdFilled);
      ok(acd2Filled);
      acd.remove(1);
      ok(acEmptied);
      ok(acdEmptied);
      ok(acd2Emptied);
    }
  };
})();
