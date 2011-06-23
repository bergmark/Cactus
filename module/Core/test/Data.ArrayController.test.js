module.exports = (function () {
  var AC = Cactus.Data.ArrayController;

  return {
    "instantiate with empty array" : function () {
      var a = new AC([]);
      assert.eql("", a.getRange().join(","));
    },
    a : function () {
      var test = this;
      var a = [1, 2, 3];
      var ac = new AC(a);
      assert.eql(3, ac.size());
      assert.eql("1,2,3", ac.getRange().join(","));
      // Make sure a shallow copy of the array controllers array is returned.
      assert.ok(!(a === ac.getRange()));

      ac.add(4);
      assert.eql(4, ac.size());
      assert.eql("1,2,3,4", ac.getRange().join(","));

      var addedTriggered = false;
      function added(controller, object, index) {
        addedTriggered = true;
        assert.eql(ac, controller);
        assert.eql(5, controller.get(4));
        assert.eql(5, object);
        assert.eql(4, index);
      }
      ac.subscribe("Added", added);
      ac.add(5);
      assert.ok(addedTriggered, "added was not triggered");
    },
    remmove : function () {
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
      ac.subscribe("Removed", removed);
      ac.remove(3);
      assert.ok(removedTriggered, "removed was not triggered");
      assert.eql("1", ac.getRange().join(","));

      ac = new AC();
      exception(/Object is not in collection/i,
                ac.remove.bind(ac, "x"));
    },
    swap : function () {
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

      ac.subscribe("Swapped", onSwap);
      ac.swap(2, 1);
      assert.ok(swapTriggered);

      // Don't swap on same index.
      swapTriggered = false;
      ac = new AC([1,2,3]);
      exception(/Both indices were 1/, ac.swap.bind(ac, 1, 1));
    },
    "swap: throw error on invalid indices" : function () {
      var ac = new AC(["a", "b", "c"]);
      exception(/swap:.+Index out of bounds.+indexA.+3/i, ac.swap.bind(ac, 3, 0));
      exception(/swap:.+Index out of bounds.+indexB.+4/i, ac.swap.bind(ac, 0, 4));
    },
    addAtIndex : function () {
      var ac = new AC([1, 2, 3]);

      // Add as the first element.
      ac.addAtIndex(0, "x");
      assert.eql("x123", ac.getRange().join(""));

      // Add as the last element.
      ac.addAtIndex(ac.size(), "y");
      assert.eql("x123y", ac.getRange().join(""));
      assert.eql(5, ac.size());

      // Add as the last element's position.
      ac.addAtIndex(4, "z");
      assert.eql("x123zy", ac.getRange().join(""));

      // Add in the middle.
      ac.addAtIndex(3, "q");
      assert.eql("x12q3zy", ac.getRange().join(""));
    },
    replace : function () {
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
      exception(/(?:)/,function () {
        ac.replace(5, 4);
      });

      // Should send out onReplaced.
      var triggered = false;
      ac.subscribe("Replaced", function (controller, index, oldObject, newObject) {
        triggered = true;
        assert.eql(ac, controller);
        assert.eql(0, index);
        assert.eql(5, oldObject);
        assert.eql(7, newObject);
      });

      ac.replace(5, 7);
      assert.eql("746", ac.getRange().join(""));
      assert.ok(triggered, "Replaced did not trigger");
    },
    "clear" : function () {
      var ac = new AC([1,2,3]);
      ac.clear();
      assert.eql(0, ac.size());
      ac.clear();
      assert.eql(0, ac.size());
    },
    "onEmptied/onFilled" : function () {
      var ac = new AC();
      var emptiedTriggered = false;
      ac.subscribe("Emptied", function () {
        emptiedTriggered = true;
      });
      var filledTriggered = false;
      ac.subscribe("Filled", function () {
        filledTriggered = true;
      });
      ac.add(1);
      ok(filledTriggered);
      not(emptiedTriggered);
      filledTriggered = false;
      ac.add(2);
      not(filledTriggered);

      ac.remove(1);
      not(emptiedTriggered);
      not(filledTriggered);
      ac.remove(2);
      ok(emptiedTriggered);
      not(filledTriggered);
    }
  };
})();
