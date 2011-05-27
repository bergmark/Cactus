(function () {
  var O = Cactus.Addon.Object;
  var ClassNames = Cactus.Web.ClassNames;
  var Dictionary = Cactus.Data.Dictionary;
  var ClassNameConditions = Class({
    has : {
      /**
       * @type Dictionary<string keyPath, [string className]>
       */
      conditions : { init : function () { return new Dictionary(); } },
      rootElement : null,
      dataSource : null
    },
    methods : {
      BUILD : function (rootElement) {
        return {
          rootElement : rootElement
        };
      },
      bindTo : function (dataSource) {
        this.dataSource = dataSource;
      },
      hasDataSource : function () {
       return !!this.dataSource;
      },
      getDataSource : function () {
        if (!this.dataSource) {
          throw new Error("ClassNameConditions:getDataSource: dataSource is %s."
                          .format(this.dataSource));
        }
        return this.dataSource;
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
          if (this._keyPathHasPrefixExclusive(keys[i], keyPath)) {
            // Recursive call with the removed prefix.
            // > Should not have to recurse.
            // > No test for this. Add.
            this.set(keys[i]);
          }
        }
        if (!this.conditions.has(keyPath)) {
          return;
        }

        var conditions = this.conditions.get(keyPath);
        for (i = 0; i < conditions.length; i++) {
          var condition = conditions[i];

          var className = condition.className;
          var negate = condition.negate;
          // Negates the result if negation was specified.
          ClassNames.toggleCond(this.rootElement, className,
            this.getDataSource().getValue(keyPath) !== negate);
        }
      },
      /**
       * Checks whether a keypath shares a path from the root with a prefix.
       * In this implementation hasPrefix(v, v) => false for all v.
       *
       * @param string keyPath
       * @param string prefix
       * @return boolean
       */
      _keyPathHasPrefixExclusive : function (keyPath, prefix) {
        if (keyPath === prefix) {
          return false;
        }
        keyPath = keyPath.split(".");
        prefix = prefix.split(".");
        if (prefix.length > keyPath.length) {
          return false;
        }
        for (var i = 0; i < prefix.length; i++) {
          if (keyPath[i] !== prefix[i]) {
            return false;
          }
        }
        return true;
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

        if (this.hasDataSource()) {
          this.set(keyPath);
        }
      },
      clone : function (rootElement) {
        var newCond = new ClassNameConditions(rootElement);
        for (var i = 0, keyPaths = this.conditions.keys(); i < keyPaths.length; i++) {
          var keyPath = keyPaths[i];
          var conditions = this.conditions.get(keyPath);
          for (var j = 0; j < conditions.length; j++) {
            var v = conditions[j];
            newCond.add(keyPath, v.className, v.negate);
          }
        }
        return newCond;
      }
    }
  });
  Cactus.Web.Template.ClassNameConditions = ClassNameConditions;
})();
