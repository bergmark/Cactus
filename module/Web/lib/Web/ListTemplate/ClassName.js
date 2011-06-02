Module("Cactus.Web.ListTemplate", function (m) {
  var Mediator = Cactus.Web.Mediator;
  var CN = Cactus.Web.ClassNames;

  Class("ClassName", {
    does : Mediator,
    has : {
      className : { required : true },
      shouldApply : { required : true },
      elementPredicate : { required : true }
    },
    methods : {
      _shouldApply : function () {
        return this.hasModel() && this.shouldApply(this.getView());
      },
      _add : function () {
        if (!this._shouldApply()) {
          return;
        }
        var me = this;
        C.each(this.getView().childNodes, function (item, index) {
          if (me.elementPredicate(me.getView(), item, index)) {
            CN.add(item, me.className);
          }
        });
      },
      _remove : function () {
        if (!this._shouldApply()) {
          return;
        }
        var me = this;
        C.each(this.getView().childNodes, function (item, index) {
          if (me.elementPredicate(me.getView(), item, index)) {
            CN.remove(item, me.className);
          }
        });
      },
      update : function () {
        this.clear();
        this._add();
      },
      clear : function () {
        for (var i = 0, ii = this._getModel().size(); i < ii; i++) {
          CN.remove(this.getView().childNodes[i], this.className);
        }
      },
      _modelDetached : function () {
        this._remove();
      },
      _modelAttached : function () {
        this._add();
      },
      clone : function () {
        // >
        throw "TODO";
      }
    }
  });
});