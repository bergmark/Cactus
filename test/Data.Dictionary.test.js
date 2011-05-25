var Dictionary = Cactus.Data.Dictionary;
module.exports = {
  initial : function () {
    var d = new Dictionary();
    not(d.has("k"));
    [].should.eql(d.get("k"));
    d.add("k", "v1");
    d.add("k", "v2");
    ["v1", "v2"].should.eql(d.get("k"));

    // Shallow copy of array.
    d._map.k.should.not.equal(d.get("k"));
  },
  remove : function () {
    var d = new Dictionary();
    d.add("k", "v1");
    d.add("k", "v2");
    d.remove("k", "v2");
    ["v1"].should.eql(d.get("k"));
    d.remove("k", "v2");

    d.add("k2", "v1");
    d.add("k2", "v2");
    d.clear("k2");
    [].should.eql(d.get("k2"));
  },
  contains : function () {
    var d = new Dictionary();
    d.add("k1", "v1");
    d.add("k1", "v2");
    d.add("k2", "v3");
    ok(d.contains("k1", "v2"));
    not(d.contains("k1", "v3"));
    not(d.contains("undef", "v"));
  }
};
