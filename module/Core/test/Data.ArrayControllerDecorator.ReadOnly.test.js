var AC = Cactus.Data.ArrayController;
var ACD = Cactus.Data.ArrayControllerDecorator;
var ReadOnly = ACD.ReadOnly;

function setup() {
  var o = {};
  o.ac = new AC(["a","b","c"]);
  o.ro = new ReadOnly(o.ac);
  o.acd = new ACD(o.ro);
  return o;
}
function objs(ac) {
  return ac.getRange().join("");
}

var roEx = exception.curry(/read only/i);

// Tests assert that changes propagate from ReadOnly's component to it,
// but that any attempts of mutations on RO or a decorator of RO throws an
// exception and does not mutate anything.
module.exports = {
  instantiation : function () {
    var o = setup();
    instance(o.ro, ReadOnly);
    equal("abc", objs(o.ac));
    equal("abc", objs(o.ro));
    equal("abc", objs(o.acd));
  },
  add : function () {
    var o = setup();
    o.ac.add("d");
    equal("abcd", objs(o.ac));
    equal("abcd", objs(o.ro));
    equal("abcd", objs(o.acd));

    roEx(o.ro.add.bind(o.ro, "e"));
    roEx(o.acd.add.bind(o.acd, "e"));

    equal("abcd", objs(o.ac));
    equal("abcd", objs(o.ro));
    equal("abcd", objs(o.acd));
  },
  addAtIndex : function () {
    var o = setup();
    o.ac.addAtIndex(0, "d");
    equal("dabc", objs(o.ac));
    equal("dabc", objs(o.ro));
    equal("dabc", objs(o.acd));

    roEx(o.ro.addAtIndex.bind(o.ro, "e"));
    roEx(o.acd.addAtIndex.bind(o.acd, "e"));

    equal("dabc", objs(o.ac));
    equal("dabc", objs(o.ro));
    equal("dabc", objs(o.acd));

  },
  remove : function () {
    var o = setup();
    o.ac.remove("b");
    equal("ac", objs(o.ac));
    equal("ac", objs(o.ro));
    equal("ac", objs(o.acd));

    roEx(o.ro.remove.bind(o.ro, "a"));
    roEx(o.acd.remove.bind(o.acd, "a"));

    equal("ac", objs(o.ac));
    equal("ac", objs(o.ro));
    equal("ac", objs(o.acd));

  },
  removeAtIndex : function () {
    var o = setup();
    o.ac.removeAtIndex(1);
    equal("ac", objs(o.ac));
    equal("ac", objs(o.ro));
    equal("ac", objs(o.acd));

    roEx(o.ro.removeAtIndex.bind(o.ro, 0));
    roEx(o.acd.removeAtIndex.bind(o.acd, 0));
    equal("ac", objs(o.ac));
    equal("ac", objs(o.ro));
    equal("ac", objs(o.acd));
  },
  swap : function () {
    var o = setup();
    o.ac.swap(0, 2);
    equal("cba", objs(o.ac));
    equal("cba", objs(o.ro));
    equal("cba", objs(o.acd));

    roEx(o.ro.swap.bind(o.ro, 0, 2));
    roEx(o.acd.swap.bind(o.acd, 0, 2));
    equal("cba", objs(o.ac));
    equal("cba", objs(o.ro));
    equal("cba", objs(o.acd));
  },
  replace : function () {
    var o = setup();
    o.ac.replace("b","d");
    equal("adc", objs(o.ac));
    equal("adc", objs(o.ro));
    equal("adc", objs(o.acd));

    roEx(o.ro.replace.bind(o.ro, "b", "d"));
    roEx(o.acd.replace.bind(o.acd, "b", "d"));
    equal("adc", objs(o.ac));
    equal("adc", objs(o.ro));
    equal("adc", objs(o.acd));
  },
  clear : function () {
    var o = setup();
    o.ac.replace("b","d");
    equal("adc", objs(o.ac));
    equal("adc", objs(o.ro));
    equal("adc", objs(o.acd));

    roEx(o.ro.replace.bind(o.ro, "b", "d"));
    roEx(o.acd.replace.bind(o.acd, "b", "d"));
    equal("adc", objs(o.ac));
    equal("adc", objs(o.ro));
    equal("adc", objs(o.acd));
  }
};
