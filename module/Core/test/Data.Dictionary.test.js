var Dictionary = Cactus.Data.Dictionary;
module.exports = {
  initial : function () {
    var d = new Dictionary();
    not(d.hasKey("k"));
    [].should.eql(d.get("k"));
    d.add("k", "v1");
    d.add("k", "v2");
    ["v1", "v2"].should.eql(d.get("k"));

    // Shallow copy of array.
    d._map.k.should.not.equal(d.get("k"));
  },
  removeValue : function () {
    var d = new Dictionary();
    d.add("k", "v1");
    d.add("k", "v2");
    d.removeValue("k", "v2");
    ["v1"].should.eql(d.get("k"));
    d.removeValue("k", "v2");

    d.add("k2", "v1");
    d.add("k2", "v2");
    d.removeKey("k2");
    [].should.eql(d.get("k2"));
  },
  keyHasValue : function () {
    var d = new Dictionary();
    d.add("k1", "v1");
    d.add("k1", "v2");
    d.add("k2", "v3");
    ok(d.keyHasValue("k1", "v2"));
    not(d.keyHasValue("k1", "v3"));
    not(d.keyHasValue("undef", "v"));
  },
  constructor : function () {
    var d = new Dictionary({
      a : [1,2],
      b : [3]
    });
    ok(d.keyHasValue("a", 1));
    ok(d.keyHasValue("a", 2));
    ok(d.keyHasValue("b", 3));
    equal(2, d.get("a").length);
    equal(1, d.get("b").length);
  },
  keys : function () {
    var d = new Dictionary({
      a : [1, 2],
      b : [3]
    });
    eql(["a", "b"], d.keys());
  },
  findKey : function () {
    var d = new Dictionary({
      a : [1, 2],
      b : [3]
    });
    equal("a", d.findKey(1));
    equal("a", d.findKey(2));
    equal("b", d.findKey(3));
    equal(null, d.findKey(4));
  },
  hasValue : function () {
    var d = new Dictionary({
      a : [1, 2],
      b : [3]
    });
    ok(d.hasValue(1));
    ok(d.hasValue(2));
    ok(d.hasValue(3));
    not(d.hasValue(4));
  },
  clear : function () {
    var d = new Dictionary();
    ok(d.isEmpty());
    d = new Dictionary({
      a : [1, 2],
      b : [3]
    });
    ok(!d.isEmpty());
    d.clear();
    ok(d.isEmpty());
  },
  getAllValues : function () {
    var d = new Dictionary({
      a : [1, 2],
      b : [3]
    });
    eql([1, 2, 3], d.getAllValues());
  }
};
