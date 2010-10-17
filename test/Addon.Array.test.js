var Joose = require('Joose');
require('Addon/Array');

module.exports = (function () {
  var ca = new CactusJuice.Addon.Array({});
  return {
    "empty/remove" : function (assert) {
      var a = [1,2,3];
      ca.empty(a);
      assert.eql(0, a.length);
      ca.empty(a);
      assert.eql(0, a.length);

      a = [1,2,3];
      assert.eql(0, ca.remove(a, 1));
      assert.eql(2, a.length);
      assert.eql("2,3", a.join(","));
      assert.eql(-1, ca.remove(a, 1));
      assert.eql(2, a.length);

      var b = [1, 1, 2, 1, 1, 3, 1, 1];
      assert.ok(ca.remove(b, 1, true) !== -1);
      assert.eql(2, b.length);
      assert.eql("2,3", b.join(","));
    }

    // The arrays should be different objects but contain the same elements.
    , "clone" : function (assert) {
      var a = ["a", "b", "c"];
      assert.eql(3, a.length);
      var b = ca.clone(a);
      assert.eql(3, a.length);
      assert.eql(a.length, b.length);
      for (var i = 0; i < a.length; i++) {
        assert.eql(a[i], b[i]);
      }
      assert.ok(a !== b);
    }

    , "no deep cloning" : function (assert) {
      var a = [{}, {}, {}];
      assert.eql(3, a.length);
      var b = ca.clone(a);
      assert.eql(3, a.length);
      assert.eql(a.length, b.length);
      for (var i = 0; i < a.length; i++) {
        assert.eql(a[i], b[i]);
        }
      assert.ok(a !== b);
    }

    , "unique" : function (assert) {
      var a = [1, 2, 3, 1, 2];
      var o = {};
      var b = [o, {}, o];

      assert.eql(3, ca.unique(a).length);
      assert.eql(2, ca.unique(b).length);
    }
  };
})();
