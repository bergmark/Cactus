(function () {
  var O = Cactus.Addon.Object;
  var ClassNames = Cactus.Web.ClassNames;
  var ClassNameConditions = Class({
    has : {
      /**
       * @type Hash<string keyPath, string className>
       */
      conditions : { init : O.new },
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
      _attach : function () {
        for (var keyPath in this.conditions) {
          if (this.conditions.hasOwnProperty(keyPath)) {
            this._set(keyPath);
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
      _set : function (keyPath) {
        for (var p in this.conditions) {
          if (this.template._keyPathHasPrefixExclusive(p, keyPath)) {
            this._set(p);
          }
        }
        if (!(keyPath in this.conditions)) {
          return;
        }

        var conditions = this.conditions[keyPath];

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
      add : function (keyPath, className, negate) {
        negate = !!negate;

        if (!(keyPath in this.conditions)) {
          this.conditions[keyPath] = [];
        }

        this.conditions[keyPath].push({
          className : className,
          negate : negate
        });

        if (this.template.hasDataSource()) {
          this._set(keyPath);
        }
      }
    }
  });
  Cactus.Web.Template.ClassNameConditions = ClassNameConditions;
})();
