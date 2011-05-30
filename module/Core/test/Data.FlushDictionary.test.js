var FD = Cactus.Data.FlushDictionary;

module.exports = {
  initial : function () {
    var fd = new FD();
    assert.ok(!fd.hasKey("key"));
    assert.eql([], fd.get("key"));
    fd.add("key", 1);
    assert.ok(fd.hasKey("key"));
    assert.eql([1], fd.get("key"));
    assert.ok(!fd.hasKey("key"));
    assert.eql([], fd.get("key"));

    fd.add("key2", 1);
    fd.add("key2", 2);
    assert.eql([1,2], fd.get("key2"));

    fd.add("key3", 1);
    fd.add("key4", 2);
    assert.eql([1], fd.get("key3"));
    assert.eql([2], fd.get("key4"));

    fd = new FD({ a : [1, 2] });
    eql([1, 2], fd.get("a"));

    // Allow empty arrays.
    fd = new FD({ a : [] });
    eql([], fd.get("a"));
  }
};
