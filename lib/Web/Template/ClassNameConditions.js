(function () {
  var O = Cactus.Addon.Object;
  var ClassNames = Cactus.Web.ClassNames;
  var Dictionary = Cactus.Data.Dictionary;
  var ClassNameConditions = Class({
    has : {
      /**
       * @type Dictionary<string keyPath, Array<string className>>
       */
      conditions : { init : function () { return new Dictionary(); } },
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
      attach : function () {
        for (var i = 0, keyPaths = this.conditions.keys(); i < keyPaths.length; i++) {
          this.set(keyPaths[i]);
        }
      },
      /**
       * Given a key path, checks whether the key path is a part of a
       * classNameCondition, and if so sets or removes the class name
       * depending on the key path's value and the negate flag.
       *
       * @param string keyPath
       */
      set : function (keyPath) {
        for (var i = 0, keys = this.conditions.keys(); i < keys.length; i++) {
          if (this.template._keyPathHasPrefixExclusive(keys[i], keyPath)) {
            this.set(keys[i]);
          }
        }
        if (!this.conditions.has(keyPath)) {
          return;
        }

        var root = this.template.getRootElement();
        var conditions = this.conditions.get(keyPath);
        for (i = 0; i < conditions.length; i++) {
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

        this.conditions.add(keyPath, {
          className : className,
          negate : negate
        });

        if (this.template.hasDataSource()) {
          this.set(keyPath);
        }
      },
      cloneForTemplate : function (newTemplate) {
        for (var i = 0, keyPaths = this.conditions.keys(); i < keyPaths.length; i++) {
          var keyPath = keyPaths[i];
          var conditions = this.conditions.get(keyPath);
          for (var j = 0; j < conditions.length; j++) {
            var v = conditions[j];
            newTemplate.addClassNameCondition(keyPath, v.className, v.negate);
          }
        }
      }
    }
  });
  Cactus.Web.Template.ClassNameConditions = ClassNameConditions;
})();
