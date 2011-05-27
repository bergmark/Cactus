var Set = Cactus.Data.Set;
var SS = Cactus.Data.StrictSet;
module.exports = {
  initial : function () {
    var ss = new SS();
    assert.ok(ss instanceof Set);
    ss = new SS([1]);
    ss.add(2);
    assert.ok(ss.has(2));
    assert.throws(ss.add.bind(ss, 1), /Value already in StrictSet/i);

    ss.remove(1);
    assert.ok(!ss.has(1));
    assert.throws(ss.remove.bind(ss, 1), /Value not in StrictSet/i);
  }
};
