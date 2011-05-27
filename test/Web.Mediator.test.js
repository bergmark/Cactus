var Mediator = Cactus.Web.Mediator;
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
        _clone : function (view) {
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

    instance(m._clone({}), M);
  }
};
