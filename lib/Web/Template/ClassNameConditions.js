(function () {
  var O = Cactus.Addon.Object;
  var ClassNames = Cactus.Web.ClassNames;
  var ClassNameConditions = Class({
    has : {
      /**
       * @type Hash<string keyPath, string className>
       */
      classNameConditions : { init : O.new },
      template : null
    },
    methods : {
      BUILD : function (template) {
        return {
          template : template
        };
      },
      /**
       * Checks all added conditions and adds the appropriate class names.
       */
      _attachClassNameConditions : function () {
        for (var keyPath in this.classNameConditions) {
          if (this.classNameConditions.hasOwnProperty(keyPath)) {
            this._setClassNameCondition(keyPath);
          }
        }
      },
      /**
       * Given a key path, checks whether the key path is a part of a
       * classNameCondition, and if so sets or removes the class name
       * depending on the key path's value and the negate flag.
       *
       * @param string keyPath
       */
      _setClassNameCondition : function (keyPath) {
        for (var p in this.classNameConditions) {
          if (this.template._keyPathHasPrefixExclusive(p, keyPath)) {
            this._setClassNameCondition(p);
          }
        }
        if (!(keyPath in this.classNameConditions)) {
          return;
        }

        var conditions = this.classNameConditions[keyPath];

        var root = this.template.getRootElement();
        for (var i = 0; i < conditions.length; i++) {
          var condition = conditions[i];

          var className = condition.className;
          var negate = condition.negate;
          // Negates the result if negation was specified.
          ClassNames.toggleCond(root, className, this.template._getDataSource().getValue(keyPath) !== negate);
        }
      },
      /**
       * Adds a rule saying that the given class name should be present on
       * the template's root whenever the value of the keyPath is also true.
       * To show the class name only when the value is false, the negate
       * argument can be set to true.
       *
       * @param string keyPath
       *   Where to look for the boolean.
       * @param string className
       *   The class name to add and remove, depending on the key path value.
       * @param optional boolean negate = false
       *   Whether the value of the key path should be negated.
       */
      addClassNameCondition : function (keyPath, className, negate) {
        negate = !!negate;

        if (!(keyPath in this.classNameConditions)) {
          this.classNameConditions[keyPath] = [];
        }

        this.classNameConditions[keyPath].push({
          className : className,
          negate : negate
        });

        if (this.template.hasDataSource()) {
          this._setClassNameCondition(keyPath);
        }
      }
    }
  });
  Cactus.Web.Template.ClassNameConditions = ClassNameConditions;
})();
