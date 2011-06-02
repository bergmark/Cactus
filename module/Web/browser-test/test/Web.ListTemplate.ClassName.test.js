Cactus.UnitTest.Web.ListTemplate.ClassName = (function () {
  var UT = Cactus.Dev.UnitTest;
  var Test = UT.Test;
  var TestCase = UT.TestCase;
  var Template = Cactus.Web.Template;
  var JSON = Cactus.Util.JSON;
  var KVC = Cactus.Data.KeyValueCoding;
  var $ = Cactus.Web.select;
  var $f = Cactus.Web.selectFirst;
  var ListTemplate = Cactus.Web.ListTemplate;
  var LT = Cactus.Web.ListTemplate;
  var ArrayController = Cactus.Data.ArrayController;
  var AC = Cactus.Data.ArrayController;
  var tag = Cactus.Web.tag;
  var Element = Cactus.Web.Element;
  var Events = Cactus.Web.Events;
  var ClassNames = Cactus.Web.ClassNames;

  var tc = new TestCase("Web.ListTemplate.ClassName");

  var templateP = Template.create('<li><span class="x"></span><span class="y"></span></li>');

  var O = Class({
    does : KVC,
    has : {
      x : null,
      y : null
    },
    methods : {
      BUILD : function (x, y) {
        this.x = x;
        this.y = y;
      }
    }
  });

  tc.setup = function () {
    this.ac = makeAC();
    this.view = tag("ul");
    this.listTemplate = ListTemplate.create(templateP, this.view, {
      arrayController : this.ac
    });
    this.valueOf = function (listItemIndex) {
      return parseInt(Element.getValue($("li .x", this.view)[listItemIndex]), 10);
    };
  };

  function makeAC () {
    return new ArrayController([
      new O (1, 2),
      new O (3, 4),
      new O (5, 6)
    ]);
  }

  // The first element in the list should have .first as class name,
  // and the last a .last class name.
  // If there is only one element, it should have the class .single.
  tc.add (function () {
    var lt = this.listTemplate;
    var ac = this.ac;

    function resetAC () {
      ac = makeAC();
      lt.attach(ac);
    }

    function has (className, index) {
      return ClassNames.has(lt.getListItem(index), className);
    }
    var hasFirst = has.curry("first");
    var hasLast = has.curry("last");
    var hasSingle = has.curry("single");

    this.assert (hasFirst (0), ".first not set on first LI.");
    this.assert (hasLast (2), ".last not set on last LI.");

    // Make sure the other nodes don't have .first.
    this.assertFalse (hasFirst (1), ".first set on second LI.");
    this.assertFalse (hasFirst (2), ".first set on last LI.");

    // Make sure the other nodes don't have .last
    this.assertFalse (hasLast (0), ".last set on first LI.");
    this.assertFalse (hasLast (1), ".last set on second LI.");


    // Later modifications should keep the class name at the first LI.

    resetAC();
    ac.remove (ac.get (0));
    this.assert (hasFirst (0), ".first wasn't reset when an object was removed.");
    resetAC();
    ac.remove (ac.get (ac.size() - 1));
    this.assert (hasLast (1), ".last wasn't reset when an object was removed.");

    resetAC();
    ac.addAtIndex(0, new O (7, 8));
    this.assert(hasFirst(0), ".first wasn't set when addAtIndex(0,_) was called.");
    this.assertFalse(hasFirst(1), ".first wasn't removed from the LI shifted from index 0 on swap.");
    resetAC();
    ac.addAtIndex(ac.size(), new O(7, 8));
    this.assert(hasLast(ac.size() - 1), ".last was not set when addAtIndex was called.");
    this.assertFalse(hasLast(ac.size() - 2), ".last was not removed when addAtIndex was called.");

    resetAC();
    ac.swap (0, 2);
    this.assert (hasFirst (0), ".first not set when swapping elements.");
    this.assert (hasLast (2), ".last not set when swapping elements.");
    this.assertFalse (hasFirst (2), ".first not removed when swapping elements.");
    this.assertFalse (hasLast (0), ".last not removed when swapping elements.");

    resetAC();
    ac.removeAtIndex (0);
    this.assert (hasFirst (0), ".first not added on removeAtIndex (0) call.");
    resetAC();
    ac.removeAtIndex (ac.size() - 1);
    this.assert (hasLast (ac.size() - 1), ".last not added on removeAtIndex (last) call.");

    resetAC();
    ac.replace (ac.get (0), new O (7, 8));
    this.assert (hasFirst (0), ".first not added on replace call.");
    resetAC();
    ac.replace(ac.get(ac.size() - 1), new O (7, 8));
    this.assert(hasLast(ac.size() - 1), ".last not added on replace call.");

    resetAC();
    ac.clear();
    ac.add(new O(9,10));
    this.assert(hasSingle(0), "Missing initial .single.");
    ac.add(new O(11,12));
    this.assertFalse(hasSingle(0), "Should remove .single after adding a second");
    this.assertFalse(hasSingle(1));
    ac.removeAtIndex(0);
    this.assert(hasSingle(0), "Missing .last after removeAtIndex.");

  });

  return tc;
});
