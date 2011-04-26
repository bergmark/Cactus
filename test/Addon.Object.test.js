module.exports = (function () {
  var object = Cactus.Addon.Object;
  var collection = Cactus.Data.Collection;
  return {
    isEmpty : function () {
      assert.ok(object.isEmpty({}));
      assert.ok(!object.isEmpty({ a : undefined }));
      assert.ok(!object.isEmpty({ a : null }));
      assert.ok(!object.isEmpty({ a : 0 }));
      assert.ok(object.isEmpty([]));
      assert.ok(!object.isEmpty(undefined));
      assert.ok(!object.isEmpty(true));
    },

    "copy" : function () {
      var o = {};
      assert.ok(o !== object.copy(o));
      o.a = 2;
      assert.eql(2, object.copy(o).a);
      var p = { a : 3, b : 4 };
      object.copy(o, p);
      assert.eql(2, p.a);
      assert.eql(4, p.b);
    },

    map : function () {
      var o = {
        a : 1,
        b : 2,
        c : 3
      };
      var h = object.map(o, function (p, v) {
        return p + v;
      });

      assert.eql("a1", h.a);
      assert.eql("b2", h.b);
      assert.eql("c3", h.c);
    },

    bound : function () {
      var o = {
        x : function () {
          return this;
        }
      };

      assert.eql(o, object.bound(o, "x")());

      var p = {
        y : function (a, b) {
          return a + b;
        }
      };
      assert.eql(3, object.bound(p, "y", 1, 2)());
    },

    count : function () {
      assert.strictEqual(0, object.count({}));
      assert.strictEqual(1, object.count({ a : 1 }));
      assert.strictEqual(2, object.count({ a : 1, b : 2 }));
    }
  };
})();
