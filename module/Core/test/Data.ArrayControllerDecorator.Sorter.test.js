var AC = Cactus.Data.ArrayController;
var ACD = Cactus.Data.ArrayControllerDecorator;
var Sorter = ACD.Sorter;

function objects(ac) {
  return ac.getRange().join("");
}

function compareNumbers(a, b) {
  return a < b ? -1 : (a > b ? 1 : 0);
}
function compareNumbersReverse(a, b) {
  return compareNumbers(a, b) * -1;
}

function setup() {
  var o = {};
  o.ac = new AC([2, 1, 3]);
  o.s = new Sorter(o.ac, compareNumbers);
  o.acd = new ACD(o.s);
  return o;
}

module.exports = {
  instantiation : function () {
    var o = setup();
    var ac = o.ac;
    var s = o.s;

    instance(s, ACD);

    // Elements should be sorted in s.
    equal("123", objects(s));
  },

  size : function () {
    var o = setup();
    equal(3, o.s.size());
  },

  get : function () {
    var o = setup();
    equal(1, o.s.get(0));
    equal(3, o.s.get(2));
  },

  add : function () {
    var o = setup();
    var ac = new AC([1,3]);
    var s = new Sorter(ac, compareNumbers);
    var acd = new ACD(s);
    equal("13", objects(s));
    equal("13", objects(acd));

    // Add as last element.
    s.add(4);
    equal("134", objects(s));
    equal("134", objects(acd));

    // Add as first element.
    s.add(0);
    equal("0134", objects(s));
    equal("0134", objects(acd));

    // Add in the middle.
    s.add(2);
    equal("01234", objects(s));
    equal("01234", objects(acd));
  },

  remove : function () {
    var o = setup();
    o.s.remove(2);
    equal("13", objects(o.ac));
    equal("13", objects(o.s));
    equal("13", objects(o.acd));

    o.s.remove(3);
    equal("1", objects(o.ac));
    equal("1", objects(o.s));
    equal("1", objects(o.acd));

    o.s.remove(1);
    equal("", objects(o.ac));
    equal("", objects(o.s));
    equal("", objects(o.acd));
  },

  swap : function () {
    var o = setup();
    // Makes no sense to swap a sorted list.
    exception(/Cannot swap/, o.s.swap.bind(o.s, 0, 1));

    // Swapping on the AC should not change anything on the sorter.
    equal("213", objects(o.ac));
    equal("123", objects(o.s));
    equal("123", objects(o.acd));
    o.ac.swap(0, 2);
    equal("312", objects(o.ac));
    equal("123", objects(o.s));
    equal("123", objects(o.acd));
  },

  replace : function () {
    var o = setup();
    o.s.replace(2,4);

    equal("413", objects(o.ac));
    equal("134", objects(o.s));
    equal("134", objects(o.acd));

    o.s.replace(1, 0);
    equal("403", objects(o.ac));
    equal("034", objects(o.s));
    equal("034", objects(o.acd));

    o.s.replace(3, -3);
    equal("40-3", objects(o.ac));
    equal("-304", objects(o.s));
    equal("-304", objects(o.acd));
  },

  "comparator change" : function () {
    var o = setup();
    o.s.setComparator(compareNumbersReverse);

    equal("321", objects(o.s));
    equal("321", objects(o.acd));
  }
};
