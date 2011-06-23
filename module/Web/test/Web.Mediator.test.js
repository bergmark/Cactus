var Mediator = Cactus.Web.Mediator;
var KVC = Cactus.Data.KeyValueCoding;
var A = Cactus.Addon.Array;
module.exports = {
  initial : function () {
    var attachTriggers = 0;
    var detachTriggers = 0;
    var M = Class({
      does : Mediator,
      methods : {
        BUILD : function (view) {
          return {
            view : view
          };
        },
        _modelAttached : function () {
          attachTriggers++;
        },
        _modelDetached : function () {
          detachTriggers++;
        },
        clone : function (view) {
          return new M(view);
        }
      }
    });
    var view = {};
    var modelA = {};
    var modelB = {};
    var m = new M(view);

    exception(/Model is not set/i, m.detach.bind(m));
    exception(/Model is not set/i, m._getModel.bind(m));

    equal(view, m.getView());
    eql([0, 0], [attachTriggers, detachTriggers]);

    m.attach(modelA);
    eql([1, 0], [attachTriggers, detachTriggers]);

    m.attach(modelA);
    eql([1, 0], [attachTriggers, detachTriggers]);

    m.attach(modelB);
    eql([2, 1], [attachTriggers, detachTriggers]);

    m.detach();
    eql([2, 2], [attachTriggers, detachTriggers]);

    instance(m.clone({}), M);
  },
  subscriptions : function () {
    var Model = Class({
      does : KVC,
      has : { a : 1, b : 2 }
    });
    var Med = Class({
      does : Mediator,
      my : {
        has : {
          modelEventNames : { init : function () { return ["ValueChanged"]; } }
        }
      },
      has : {
        lastChange : null,
        changes : { init : A.new }
      },
      methods : {
        BUILD : function (view) {
          return {
            view : view
          };
        },
        _modelAttached : function () { },
        _modelDetached : function () { },
        clone : function (view) { },
        onValueChangedTriggered : function () {
          this.lastChange = C.toArray(arguments);
          this.changes.push(C.toArray(arguments));
        }
      }
    });
    var med = new Med({
      view : {}
    });
    var modelA = new Model();
    var modelB = new Model();
    med.attach(modelA);
    modelA.setValue("a", 2);
    equal(modelA, med.lastChange[0]);
    equal("a", med.lastChange[1]);
    modelA.setValue("b", 3);
    equal("b", med.lastChange[1]);

    equal(2, med.changes.length);
    med.attach(modelB);
    modelA.setValue("a", 4);
    equal(2, med.changes.length);
    modelB.setValue("b", 5);
    equal(3, med.changes.length);
    equal("b", med.lastChange[1]);

    med.detach();
    modelB.setValue("b", 6);
    equal(3, med.changes.length);
  }
};
