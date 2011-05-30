var SFD = Cactus.Data.StrictFlushDictionary;

module.exports = {
  test : function () {
    var sfd = new SFD();
    sfd.define("key");
    assert.ok(!sfd.hasKey("key"));
    sfd.add("key", "val");
    assert.ok(sfd.hasKey("key"));

    assert.eql(["val"], sfd.get("key"));
    assert.ok(!sfd.hasKey("key"));
    assert.eql([], sfd.get("key"));

    sfd.define("key2");

    sfd.add("key2", "val1");
    sfd.add("key2", "val2");
    sfd.add("key", "x");
    assert.eql(["val1","val2"], sfd.get("key2"));

    sfd.defineSeveral(["x","y"]);
    sfd.get("x");
    sfd.get("y");

    assert.throws(sfd.get.bind(sfd, "u"), /undefined key/i);
    assert.throws(sfd.hasKey.bind(sfd, "u"), /undefined key/i);

    new SFD();

    sfd = new SFD({ a : [1] });
    ok(sfd.hasKey("a"));

    exception(/non empty Array value/i,
              function () { return new SFD({ a : [] }); });
  }
};
