var SFD = Cactus.Data.StrictFlushDictionary;

module.exports = {
  test : function () {
    var sfd = new SFD(["key"]);
    assert.ok(!sfd.has("key"));
    sfd.add("key", "val");
    assert.ok(sfd.has("key"));

    assert.eql(["val"], sfd.get("key"));
    assert.ok(!sfd.has("key"));
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
    assert.throws(sfd.has.bind(sfd, "u"), /undefined key/i);

    new SFD();
  }
};
