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
      this.errors.push({
        property : property,
        message : message
      });
    },
    addSub : function (property, subError) {
      this.errors.push({
        property : property + "." + subError.property,
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
    this.nestedOptions = new StrictMap();
    var errorMessage = new ErrorMessage();
    this.errorMessage = errorMessage;
    var addError = errorMessage.add.bind(errorMessage);
    var addSubError = errorMessage.addSub.bind(errorMessage);
    this.definition = definition;
  } Options.prototype = {
    definition : null,
    nestedOptions : null,
    /**
     * @param optional Hash options = {}
     * @return Hash
     *   A hash valid in regard to the type definition, with applicable
     *   values coerced and defaultValues added.
     */
    parse : function (options, throwErrors) {
      throwErrors = throwErrors === undefined ? true : !!throwErrors;
      this.parseErrorMessage = new ErrorMessage();
      if (typeof options === this.definition.type) {
        return options;
      }
      this.parseErrorMessage.add("", "Expected " + this.definition.type + ", but got " + typeof options);
      if (throwErrors && this.parseErrorMessage.has()) {
        throw new Error(this.parseErrorMessage.getErrorString());
      }
    },
    /**
     * @param mixed type
     */
    _typeToString : function (type) {
      if (typeof type === "string") {
        return type;
      }
      return JSON.stringify(type);
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
