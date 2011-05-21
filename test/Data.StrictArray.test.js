var SA = Cactus.Data.StrictArray;
var M = Cactus.Addon.Math;
module.exports = {
  initial : function () {
    var sa = new SA();
    assert.ok(sa.isEmpty());
    assert.strictEqual(0, sa.size());
    sa.add("a");
    sa.add("b");
    assert.ok(!sa.isEmpty());
    assert.strictEqual(2, sa.size());
    assert.strictEqual("a", sa.get(0));
    assert.throws(sa.get.bind(sa, 2), /bad index: 2, length is: 2/i);
    sa = new SA();
    assert.throws(sa.get.bind(sa, 0), /bad index: 0/i);
    assert.throws(sa.get.bind(sa, -1), /bad index: -1/i);

    sa = new SA([]);
    assert.ok(sa.isEmpty());
    sa = new SA([1,2,3]);
    assert.strictEqual(3, sa.size());

    // Don't take ownership of array.
    a = [];
    assert.ok(a !== new SA(a)._array);
  },
  enumerable : function () {
    // toArary, map, select
    var sa = new SA([1,2,3]);
    assert.eql([1,2,3], sa.toArray());
    assert.ok(sa.array !== sa.toArray());

    assert.eql([2,3,4], sa.map(function (v) { return v + 1; }));
    assert.eql([1,3], sa.select(M.odd));
  }
};
