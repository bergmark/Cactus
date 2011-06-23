var AC = Cactus.Data.ArrayController;
var ACD = Cactus.Data.ArrayControllerDecorator;
var Filterer = Cactus.Data.ArrayControllerDecorator.Filterer;

function setup() {
  var o = {};
  o.reset = function () {
    o.ac = new AC([1, 2, 3, 4]);
    o.filterer = new Filterer(o.ac, function (v) {
      return v % 2 === 0;
    });
    // To make sure the filterer sends out the appropriate events.
    o.acd = new ACD(o.filterer);
  };
  o.reset();
  o.objs = function (ac) {
    ac = ac || o.filterer;
    return ac.getRange().join(",");
  };
  return o;
}

module.exports = {
  instantiation : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    equal(4, ac.size());
    equal(2, filterer.size());
    equal(2, filterer.size());
    equal("2,4", o.objs());
  },

  get : function () {
    var o = setup();
    var filterer = o.filterer;
    equal(2, filterer.get(0));
    equal(4, filterer.get(1));
  },

  add : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    // Should not be added to filterer.
    filterer.add(5);
    // Should be added to filterer.
    filterer.add(6);

    equal("2,4,6", o.objs());
    equal("1,2,3,4,5,6", o.objs(ac));
    equal("2,4,6", o.objs(acd), "ACD has incorrect elements.");
  },

  remove : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    filterer.remove(2);
    filterer.remove(3);

    equal("4", o.objs());
    equal("1,4", o.objs(ac));
    equal("4", o.objs(acd));
  },

  swap : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    ac.add(6);
    ac.add(8);

    equal("1,2,3,4,6,8", o.objs(ac));
    equal("2,4,6,8", o.objs());
    equal("2,4,6,8", o.objs(acd));

    // Swapping two existing elements (6 and 8);
    filterer.swap(2, 3);
    // The elements should swap places on the filterer and on the ac.
    equal("2,4,8,6", o.objs());
    equal("1,2,3,4,8,6", o.objs(ac));
    equal("2,4,8,6", o.objs(acd));

    // Swapping with one and none of the elements in the filterer.
    ac.swap(0, 1); // 2 and 1.
    equal("2,1,3,4,8,6", o.objs(ac));
    equal("2,4,8,6", o.objs());
    equal("2,4,8,6", o.objs(acd));
    ac.swap(1, 2); // 1 and 3.
    equal("2,3,1,4,8,6", o.objs(ac));
    equal("2,4,8,6", o.objs());
    equal("2,4,8,6", o.objs(acd));
  },

  replace : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    // Replace an object on the filterer.
    filterer.replace(4, 6);
    equal("2,6", o.objs());
    equal("1,2,3,6", o.objs(ac));
    equal("2,6", o.objs(acd));

    // Try to replace an object on the filterer with an object that doesn't
    // belong, the new object should not be added to the filterer.
    filterer.replace(6, 7);
    equal("2", o.objs());
    equal("1,2,3,7", o.objs(ac));
    equal("2", o.objs(acd));

    // Try to replace an object that isn't in the filterer, but the new one
    // would be, the new object should be inserted relative to where it is
    // in the component.
    o.reset();
    ac = o.ac;
    filterer = o.filterer;
    acd = o.acd;
    equal("1,2,3,4", o.objs(ac));
    ac.replace(3, 6);
    equal("1,2,6,4", o.objs(ac));
    equal("2,6,4", o.objs(filterer));
    equal("2,6,4", o.objs(acd));
    // Edge case, when the new object should be insterted at index 0.
    ac.replace(1, 0);
    equal("0,2,6,4", o.objs(ac));
    equal("0,2,6,4", o.objs());
    equal("0,2,6,4", o.objs(acd));

    // Try to replace an object not in the filterer with a new object that
    // shouldn't be added, nothing should happen to the filterer.
    o.reset();
    ac = o.ac;
    filterer = o.filterer;
    acd = o.acd;
    ac.replace(1, 5);
    equal("5,2,3,4", o.objs(ac));
    equal("2,4", o.objs(filterer));
    equal("2,4", o.objs(acd));
  },

  "change filter" : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    filterer.setFilter(function (v) {
      return v % 2 === 1;
    });
    equal("1,2,3,4", o.objs(ac));
    equal("1,3", o.objs(filterer));
    equal("1,3", o.objs(acd));
  },

  "setFilter CoR" : function () {
    var o = setup();
    var ac = o.ac;
    var filterer = o.filterer;
    var acd = o.acd;

    // Same as the other setFilter test, but setFilter is called on acd.
    acd.setFilter(function (v) {
      return v % 2 === 1;
    });
    equal("1,2,3,4", o.objs(ac));
    equal("1,3", o.objs(filterer));
    equal("1,3", o.objs(acd));
  },

  reFilter : function () {
    var o = setup();
    var filterer = o.filterer;
    var acd = o.acd;
    var odd = function (v) {
      return v % 2 === 1;
    };
    var even = function (v) {
      return v % 2 === 0;
    };

    var f = odd;
    filterer.setFilter(function (v) {
      return f(v);
    });
    equal("1,3", o.objs(filterer));
    f = even;
    filterer.reFilter();
    equal("2,4", o.objs(filterer));

    // Should send out ObjectRearrange.
    var triggered = false;
    filterer.subscribe("Rearranged", function () {
      triggered = true;
    });
    filterer.reFilter();
    ok(triggered, "Rearranged did not trigger.");

    // Should be CoR.
    f = odd;
    acd.reFilter();
    equal("1,3", o.objs(filterer));
  }
};
