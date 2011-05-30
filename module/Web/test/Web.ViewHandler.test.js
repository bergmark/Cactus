var ViewHandler = Cactus.Web.ViewHandler;
module.exports = {
  initial : function () {
    var attachTriggers = 0;
    var detachTriggers = 0;
    var M = Class({
      does : ViewHandler,
      methods : {
        BUILD : function (view) {
          return {
            view : view
          };
        },
        clone : function (view) {
          return new M(view);
        }
      }
    });
    var view = {};
    var m = new M(view);
    equal(view, m.getView());
  }
};
