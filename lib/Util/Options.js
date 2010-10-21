/**
 * @file
 *  Provides "parsing" meant for validating hash arguments.
 *  Without structure checks for these, client errors are hard to debug.
 *  It is currently only possible to parse flat structures, meaning a value
 *  cannot be another hash.
 *  Using Options it's easier to specify the structure expected for a compound
 *  argument.
 */
Joose.Module("CactusJuice.Util", function (m) {
  var Collection = CactusJuice.Data.Collection;
  var StrictMap = CactusJuice.Data.StrictMap;
  var JSON = CactusJuice.Util.JSON;

  function ErrorMessage() {
    this.errors = [];
  } ErrorMessage.prototype = {
    errors : null,
    has : function () {
      return this.count() !== 0;
    },
    add : function (property, message) {
      //console.log("add", property, message);
      this.errors.push({
        property : property,
        message : message
      });
    },
    addSub : function (property, subError) {
      this.errors.push({
        property : property + (subError.property ? "." : "") + subError.property,
        message : subError.message
      });
    },
    addSubObj : function (property, subErrorMessage) {
      for (var i = 0; i < subErrorMessage.count(); i++) {
        this.addSub(property, subErrorMessage.get()[i]);
      }
    },
    get : function () {
      return this.errors;
    },
    count : function () {
      return this.errors.length;
    },
    _getErrorString : function (e) {
      if (e.property) {
        return 'Options: Error in property "%s": %s'.format(e.property, e.message);
      } else {
        return 'Options: Error: %s'.format(e.message);
      }
    },
    getErrorString : function () {
      var errorStrings = [];
      for (var i = 0; i < this.errors.length; i++) {
        var e = this.errors[i];
        errorStrings.push(this._getErrorString(e));
      }
      return errorStrings.join("\n");
    },
    getMessages : function () {
      var messages = [];
      for (var i = 0; i < this.errors.length; i++) {
        messages.push(this._getErrorString(this.errors[i]));
      }
      return messages;
    }
  };

  /**
   * @param Map<string propertyName, Hash{
   *     type : optional union{"boolean","mixed",Constructor} = "mixed"
   *     coerce : optional boolean = false,
   *     required : optional boolean = !hasDefaultValue,
   *     defaultValue : optional mixed, // Shall have the type specified
   *                                    // under the type property.
   * }> definition
   */
  function Options(definition, throwErrors) {
    throwErrors = throwErrors === undefined ? true : !!throwErrors;
    this.definition = definition;
  } Options.prototype = {
    definition : null,
    nestedOptions : null,
    errorMessage : null,
    parse : function (options, throwErrors) {
      // console.log("parse", JSON.stringify(this.definition), JSON.stringify(options));
      this.errorMessage = new ErrorMessage();
      var subOptions = [];
      throwErrors = throwErrors === undefined ? true : !!throwErrors;
      var primitiveFail = function () {
        this.errorMessage.add("", "Expected " + JSON.stringify(this.definition.type) + ", but got " + this._typeof(options));
        if (throwErrors) {
          throw new Error(this.errorMessage.getErrorString());
        }
      }.bind(this);
      if (this.definition.type instanceof Array) {
        if (options instanceof Array) {
          var vs = [];
          for (var i = 0; i < options.length; i++) {
            var option = new Options(this.definition.type[0]);
            subOptions.push(option);
            vs.push(option.parse(options[i], false));
            this.errorMessage.addSubObj(i, option._getErrorMessage());
          }
          if (throwErrors && this.errorMessage.has()) {
            throw new Error(this.errorMessage.getErrorString());
          }
          return vs;
        } else {
          return primitiveFail();
        }
      } else if (this.definition.map) {
        var def = { type : this.definition.type };
        var m = {};
        for (var p in options) {
          var option = new Options(def, false);
          m[p] = option.parse(options[p], false);
          this.errorMessage.addSubObj(p, option._getErrorMessage());
        }
        if (throwErrors && this.errorMessage.has()) {
          throw new Error(this.errorMessage.getErrorString());
        }
        return m;
      } else if (this.definition.type instanceof Object) {
        if (!(options instanceof Object)) {
          return primitiveFail();
        }
        var h = {};
        // All properties in the definition.
        for (var p in this.definition.type) if (this.definition.type.hasOwnProperty(p)) {
          var def = this.definition.type[p];
          // Missing property in the parsed hash.
          if (p in options) {
            var val = options[p];
            var option = new Options(def, false);
            h[p] = option.parse(val, false);
            this.errorMessage.addSubObj(p, option._getErrorMessage());
          } else {
            // Set to keep track of handled properties.
            h[p] = undefined;
            this.errorMessage.add(p, "Missing property");
          }
        }
        // Check for properties in the parsed hash that are not in the definition.
        for (p in options) if (options.hasOwnProperty(p)) {
          if (!(p in h)) {
            this.errorMessage.add(p, "Property lacks definition");
          }
        }
        if (throwErrors && this.errorMessage.has()) {
          throw new Error(this.errorMessage.getErrorString());
        }
        return h;
      } else if (this.definition.type === typeof options) {
        return options;
      }
      return primitiveFail();
    },
    /**
     * @param mixed type
     */
    _typeof : function (value) {
      return '"' + typeof value + '"';
    },
    _getErrorMessage : function () {
      return this.errorMessage;
    },
    hasErrors : function () {
      return this.errorMessage.has();
    },
    getErrors : function () {
      return this.errorMessage.get();
    },
    getErrorMessages : function () {
      return this.errorMessage.getMessages();
    }
  };

  m.Options = Options;
});
