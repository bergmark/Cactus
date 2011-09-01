(function () {
  var AC = Cactus.Data.ArrayController;
  var ACD = Cactus.Data.ArrayControllerDecorator;
  var Pager = ACD.Pager;

  function objs(controller) {
    return controller.getRange().join("");
  }

  function setup() {
    var o = {};
    o.ac = new AC([1, 2, 3, 4, 5, 6]);
    o.pager = new Pager(o.ac);
    o.pager.setObjectsPerPage(4);
    var p = o.pager;
    return o;
  };

  module.exports = {

    instantiation : function () {
      var o = setup();
      // Two items per page.
      var p = new Pager(o.ac, 2);
      equal(3, p.getPageCount());
      equal(0, p.getPage());
      equal(2, p.getObjectsPerPage());
      equal(1, p.get(0));
      equal(2, p.get(1));
    },

    "invalid page in constructor" : function () {
      exception(/Specified page.+out of bounds/, function () { new Pager([], 1, 10); });
    },

    // Changing pages.
    "changing pages" : function () {
      var o = setup();
      var p = o.pager;
      p.setObjectsPerPage(2);
      equal(3, p.getPageCount());
      p.setPage(0);
      eql([1,2], p.getRange());
      p.setPage(1);
      eql([3,4], p.getRange());
      p.setPage(2);
      eql([5,6], p.getRange());
    },

    "viewing when the last page isn't full" : function () {
      var o = setup();
      var p = o.pager;
      equal(2, p.getPageCount());
      p.setPage(0);
      equal("1234", objs(p));
      p.setPage(1);
      equal("56", objs(p));
    },

    "push" : function () {
      var o = setup();
      var p = o.pager;
      p.setPage(1);

      equal(2, p.size());

      p.add(7);
      // Call should have propagated to the AC.
      equal("1234567", objs(o.ac));
      equal(3, p.size());

      // Add two objects to create a page.
      p.add(8);
      equal(2, p.getPageCount());
      p.add(9);
      equal(3, p.getPageCount());

      p.setPage(2);
      equal("9", objs(p));
    },

    "swap" : function () {
      var o = setup();
      var p = o.pager;
      var ac = o.ac;

      // Swap inside the page.
      p.swap(0, 1);
      equal("2134", objs(p));
      equal("213456", objs(ac));


      ac = new AC(["a", "b", "c", "d"]);
      p = new Pager(ac, 2, 0);

      // Swap with the last element of this page and the first element of the
      // next using the AC.
      ac.swap(1, 2);
      equal("acbd", objs(ac));
      equal("ac", objs(p));

      // Swap with an element on this page and an element on a previous page.
      ac = new AC(["a", "b", "c", "d"]);
      p = new Pager(ac, 2, 1);
      ac.swap(1, 2);
      equal("acbd", objs(ac));
      equal("bd", objs(p));
    },

    "addAtIndex" : function () {
      var ac = new AC(["a", "b", "c", "d"]);
      var p = new Pager(ac, 2, 0);

      equal("abcd", objs(ac));
      equal("ab", objs(p));

      // Insertions from the pager.
      // Add as the first element.
      p.addAtIndex(0, "e");
      equal("eabcd", objs(ac));
      equal("ea", objs(p));

      // Insertions from the ac.
      // Add to the left of the pager's page.
      p.setPage(1);
      equal("bc", objs(p));
      ac.addAtIndex(0, "f");
      equal("feabcd", objs(ac));
      equal("ab", objs(p));

      // Add in the middle of the page, shifting elements out.
      p.setPage(1);
      equal("feabcd", objs(ac));
      equal("ab", objs(p));
      ac.addAtIndex(2, "g");
      equal("fegabcd", objs(ac));
      equal("ga", objs(p));
    },

    "replace" : function () {
      var ac = new AC(["a", "b"]);
      var p = new Pager(ac, 2);

      // Replace on the ac.
      ac.replace("a", "c");
      equal("cb", objs(ac));
      equal("cb", objs(p));

      // Replace on the pager.
      p.replace("b", "d");
      equal("cd", objs(ac));
      equal("cd", objs(p));
    },

    "remove" : function () {
      var o = setup();
      var p = o.pager;
      var ac = o.ac;
      p.add(7);
      p.setPage(0);

      equal("1234", objs(p));
      // Remove from the next page, nothing should change on the current page.
      p.remove(5);
      equal("1234", objs(p));
      p.setPage(1);
      equal("67", objs(p));

      p.setPage(1);
      equal("67", objs(p));
      p.remove(7);
      equal("6", objs(p));


      p.setPage(0);
      // If the active page is the last page and the last item is shifted off
      // it, the active page should be changed to the previous page.
      equal("12346", ac.getRange().join(""));
      equal("1234", objs(p));

      p.setPage(1);
      equal("6", objs(p));
      ac.remove(4);
      equal(0, p.getPage());
      equal("1236", objs(p), "Page not shifted correctly");

      // Unless the active page is 0, in which case it remains empty.
      ac = new AC([1]);
      p = new Pager(ac, 2, 0);
      equal("1", p.getRange().join(""));
      p.remove(1);
      equal(0, p.size());
      equal(1, p.getPageCount());

      // Remove from a page when the next page has items, which should mean
      // that the first item on the next page is shifted to the current one.
      ac = new AC([1,2,3]);
      p = new Pager(ac, 2, 0);
      equal(2, p.getPageCount());
      equal("12", p.getRange().join(""));
      p.remove(2);
      equal(1, p.getPageCount());
      equal("13", p.getRange().join(""));
    },

    "CoR" : function () {
      var o = setup();
      var p = o.pager;
      var acd = new ACD(p);

      equal(0, acd.getPage());
      acd.setObjectsPerPage(1);
      equal(1, acd.getObjectsPerPage());
      acd.setPage(1);
      equal(1, acd.getPage());
      equal(6, acd.getPageCount());
    },

    "onPageCountUpdated" : function () {
      var o = setup();
      var p = o.pager;
      var pageCountUpdatedTriggered;
      var triggered;

      p.setObjectsPerPage(2);

      // Add a page using add and check that proper arguments are
      // passed.
      triggered = false;
      p.subscribe("PageCountUpdated",
                  function (pager, pageCount, oldPageCount) {
                    equal(p, pager);
                    equal(4, pageCount);
                    equal(3, oldPageCount);
                    triggered = true;
                  }, true);
      p.add(7);
      ok(triggered,
                  "pageCountUpdated did not trigger when add was used.");

      // Remove a page using remove.
      triggered = false;
      p.subscribe("PageCountUpdated",
                  function (pager, pageCount, oldPageCount) {
                    equal(3, pageCount);
                    equal(4, oldPageCount);
                    triggered = true;
                  }, true);
      p.remove(7);
      ok(triggered,
                  "pageCountUpdated did not trigger when remove was used.");

      // Add a page using insertObjectAtIndex.
      triggered = false;
      p.subscribe("PageCountUpdated",
                  function (pager, pageCount, oldPageCount) {
                    equal(4, pageCount);
                    equal(3, oldPageCount);
                    triggered = true;
                  }, true);
      p.addAtIndex(0, 8);
      ok(triggered,
                  "pageCountUpdated did not trigger when insertObjectAtIndex was used.");
    },

    "onPageChanged" : function () {
      var o = setup();
      var p = o.pager;
      var triggered;

      triggered = false;
      p.subscribe("PageChanged",
                  function (pager, page, oldPage) {
                    equal(p, pager);
                    equal(1, page);
                    equal(0, oldPage);
                    triggered = true;
                  }, true);
      p.setPage(1);
      ok(triggered, "pageChanged did not trigger");
    },

    "onReplacedTriggered" : function () {
      var o = setup();
      var p = o.pager;
      var ac = o.ac;

      p.setObjectsPerPage(2);
      p.setPage(1);

      // Replace an object inside the current page.
      ac.replace(3, 7);
      equal("127456", objs(ac));
      equal("74", objs(p));

      ac.replace(4, 8);
      equal("127856", objs(ac));
      equal("78", objs(p));

      // Replace objects outside the current page, no change should be made to
      // the pager.
      ac.replace(1, 9);
      equal("927856", objs(ac));
      equal("78", objs(p));
    }
  };
})();
