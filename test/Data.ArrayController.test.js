module.exports = (function () {
  var AC = CactusJuice.Data.ArrayController;
  var assertException = CactusJuice.Dev.Assertion.exception;

  return {
    "instantiate with empty array" : function (assert) {
      var a = new AC([]);
      assert.eql("", a.getRange().join(","));
    },
    a : function (assert) {
      var test = this;
      var a = [1, 2, 3];
      var ac = new AC(a);
      assert.eql(3, ac.count());
      assert.eql("1,2,3", ac.getRange().join(","));
      // Make sure a shallow copy of the array controllers array is returned.
      assert.ok(!(a === ac.getRange()));

      ac.add(4);
      assert.eql(4, ac.count());
      assert.eql("1,2,3,4", ac.getRange().join(","));

      var addedTriggered = false;
      function added(controller, index) {
        addedTriggered = true;
        assert.eql(ac, controller);
        assert.eql(4, index);
        assert.eql(5, controller.get(4));
      }
      ac.subscribe("ObjectAdded", added);
      ac.add(5);
      assert.ok(addedTriggered, "added was not triggered");
    },
    c : function (assert) {
      var test = this;
      var ac = new AC([1, 2, 3]);

      ac.remove(2);
      assert.eql("1,3", ac.getRange().join(","));

      var removedTriggered = false;
      function removed(controller, object, index) {
        removedTriggered = true;
        assert.eql(ac, controller);
        assert.eql(3, object);
        assert.eql(1, index);
      }
      ac.subscribe("ObjectRemoved", removed);
      ac.remove(3);
      assert.ok(removedTriggered, "removed was not triggered");
      assert.eql("1", ac.getRange().join(","));
    },
    swap : function (assert) {
      var test = this;
      var ac = new AC([1, 2, 3]);

      ac.swap(0, 2);
      assert.eql("321", ac.getRange().join(""));

      ac.swap(0, 1);
      assert.eql("231", ac.getRange().join(""));

      var swapTriggered = false;
      function onSwap(ac, indexA, indexB) {
        swapTriggered = true;
        assert.ok(indexA < indexB, "indexA >= indexB");
      }

      ac.subscribe("ObjectSwap", onSwap);
      ac.swap(2, 1);
      assert.ok(swapTriggered);
    },
    "swap: throw error on invalid indices" : function (assert) {
      var ac = new AC(["a", "b", "c"]);
      assertException(assert, /swap:.+Index out of bounds.+indexA.+3/i, ac.swap.bind(ac, 3, 0));
      assertException(assert, /swap:.+Index out of bounds.+indexB.+4/i, ac.swap.bind(ac, 0, 4));
    },
    addAtIndex : function (assert) {
      var ac = new AC([1, 2, 3]);

      // Add as the first element.
      ac.addAtIndex(0, "x");
      assert.eql("x123", ac.getRange().join(""));

      // Add as the last element.
      ac.addAtIndex(ac.count(), "y");
      assert.eql("x123y", ac.getRange().join(""));
      assert.eql(5, ac.count());

      // Add as the last element's position.
      ac.addAtIndex(4, "z");
      assert.eql("x123zy", ac.getRange().join(""));

      // Add in the middle.
      ac.addAtIndex(3, "q");
      assert.eql("x12q3zy", ac.getRange().join(""));
    },
    replace : function (assert) {
      var test = this;
      var ac = new AC([1, 2, 3]);

      // Middle of collection.
      ac.replace(2, 4);
      assert.eql("143", ac.getRange().join(""));
      // First element.
      ac.replace(1, 5);
      assert.eql("543", ac.getRange().join(""));
      // Last element.
      ac.replace(3, 6);
      assert.eql("546", ac.getRange().join(""));

      // Throw error if object already in collection.
      assertException(assert, /(?:)/,function () {
        ac.replace(5, 4);
      });

      // Should send out onObjectReplaced.
      var triggered = false;
      ac.subscribe("ObjectReplaced",
                   function (controller, index, oldObject, newObject) {
                     triggered = true;
                     assert.eql(ac, controller);
                     assert.eql(0, index);
                     assert.eql(5, oldObject);
                     assert.eql(7, newObject);
                   });

      ac.replace(5, 7);
      assert.eql("746", ac.getRange().join(""));
      assert.ok(triggered, "ObjectReplaced did not trigger");
    },
    "clear" : function (assert) {
      var ac = new AC([1,2,3]);
      ac.clear();
      assert.eql(0, ac.count());
      ac.clear();
      assert.eql(0, ac.count());
    }
  };
})();
