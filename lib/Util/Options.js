/**
 * @file
 * A JSON-esque schema parser for parsing compound structures.
 * See unit tests for example usages.
 */
Module("Cactus.Util", function (m) {
  var collection = Cactus.Data.Collection;
  var JSON = Cactus.Util.JSON;
  var object = Cactus.Addon.Object;
  var StrictMap = Cactus.Data.StrictMap;

  var builtInValidators = new StrictMap({
    natural : {
      func : function (v) {
        return v >= 0;
      },
      message : "Expected natural number."
    },
    positive : {
      func : function (v) {
        return v >= 1;
      },
      message : "Expected positive number."
    },
    negative : {
      func : function (v) {
        return v < 0;
      },
      message : "Expected negative number."
    },
    "non empty string" : {
      func : function (v) {
        return v !== "";
      },
      message : "Expected non-empty string."
    }
  });

  var ErrorMessage = Class("ErrorMessage", {
    has : {
      errors : {
        init : function () { return {}; }
      }
    },
    methods : {
      has : function () {
        return !object.isEmpty(this.errors);
      },
      add : function (property, message) {
        this.errors[property] = this.errors[property] || [];
        this.errors[property].push(message);
      },
      addSub : function (property, subErrorProperty, subErrorMessage) {
        this.errors[property + (subErrorProperty ? "." : "") + subErrorProperty] = subErrorMessage;
      },
      addSubObj : function (property, subErrorMessage) {
        var subErrors = subErrorMessage.get();
        for (var p in subErrors) {
          this.addSub(property, p, subErrors[p]);
        }
      },
      get : function () {
        return this.errors;
      },
      _getErrorString : function (p, msg) {
        if (p) {
          return 'Options: Error in property "%s": %s'.format(p, msg);
        } else {
          return 'Options: Error: %s'.format(msg);
        }
      },
      getErrorString : function () {
        var errorStrings = [];
        for (var p in this.errors) {
          errorStrings.push(this._getErrorString(p, this.errors[p].join(" ")));
        }
        return errorStrings.join("\n");
      },
      getMessages : function () {
        var messages = [];
        for (var p in this.errors) {
          messages.push(this._getErrorString(p, this.errors[p]));
        }
        return messages;
      }
    }
  });

  var Options = Class("Options", {
    has : {
      definition : null,
      errorMessage : null
    },
    methods : {
      BUILD : function (definition, throwErrors) {
        throwErrors = throwErrors === undefined ? true : !!throwErrors;
        this.definition = definition;
        if (!(definition instanceof Object)) {
          throw new Error("Options:BUILD: definition must be a hash.");
        }
        if ("defaultValue" in definition || "defaultValueFunc" in definition) {
          definition.required = false;
        } else if ("required" in definition) {
          definition.required = !!definition.required;
        } else {
          definition.required = true;
        }

        definition.validators = definition.validators || [];

        // No need for type if it's an Array type.
        if (!(definition instanceof Array) && !("type" in definition) && !("enumerable" in definition)) {
          throw new Error('Options:BUILD: Missing "type" or "enumerable" in definition');
        }
      },
      parse : function (options, throwErrors) {
        this.errorMessage = new ErrorMessage();
        var subOptions = [];
        var validationMessage = this.definition.validationMessage || "";
        throwErrors = throwErrors === undefined ? true : !!throwErrors;
        var throwError = function () {
          if (throwErrors && this.errorMessage.has()) {
            var e = new Error(this.errorMessage.getErrorString());
            e.hash = this.getErrors();
            throw e;
          }
        }.bind(this);
        var fail = function (p, message) {
          this.errorMessage.add(p, message);
          throwError();
        }.bind(this);
        var primitiveFail = function () {
          return fail("", "Expected " + JSON.stringify(this._gettype(this.definition.type)) +
               ", but got " + JSON.stringify(this._typeof(options)));
        }.bind(this);
        if (this.definition.enumerable) {
          // Enumerables.
          if (!collection.hasValue(this.definition.enumerable, options)) {
            fail("", "Expected a value in [" + this.definition.enumerable + "], but got " + options);
          }
        } else if (this.definition.type instanceof Array) {
          // Arrays.
          if (options instanceof Array) {
            var vs = [];
            for (var i = 0; i < options.length; i++) {
              var option = new Options(this.definition.type[0]);
              subOptions.push(option);
              vs.push(option.parse(options[i], false));
              this.errorMessage.addSubObj(i, option._getErrorMessage());
            }
            throwError();
            options = vs;
          } else {
            primitiveFail();
          }
        } else if (this.definition.map) {
          // Maps.
          var def = { type : this.definition.type };
          var m = {};
          for (var p in options) {
            var option = new Options(def, false);
            m[p] = option.parse(options[p], false);
            this.errorMessage.addSubObj(p, option._getErrorMessage());
          }
          throwError();
          options = m;
        } else if (this.definition.type instanceof Function) {
          // Constructors.
          if (!(options instanceof this.definition.type)) {
            return primitiveFail();
          }
        } else if (this.definition.type instanceof Object) {
          // Hashes.
          if (!(options instanceof Object)) {
            primitiveFail();
          }
          var h = {};
          // All properties in the definition.
          for (var p in this.definition.type) if (this.definition.type.hasOwnProperty(p)) {
            var def = this.definition.type[p];
            if (!("required" in def)) {
              def.required = true;
            }
            if (def.defaultValue || def.defaultValueFunc) {
              def.required = false;
            }

            if (p in options) {
              var val = options[p];
              if (!(def.required === false && val === undefined)) {
                var option = new Options(def, false);
                h[p] = option.parse(val, false);
                this.errorMessage.addSubObj(p, option._getErrorMessage());
              } else {
                // Value is undefined and not required,
                // and the property won't be set in the hash.
                h[p] = undefined;
              }
            } else {
              h[p] = undefined;

              if (def.required === false && def.defaultValue) {
                h[p] = def.defaultValue;
              } else if (def.required === false && def.defaultValueFunc) {
                h[p] = def.defaultValueFunc();
                var option = new Options(def, false);
                h[p] = option.parse(h[p], false);
                this.errorMessage.addSubObj(p, option._getErrorMessage());
              } else if (def.required === false) {
                delete h[p];
              } else if (def.required !== false) {
                this.errorMessage.add(p, "Missing property");
              }
            }
          }
          // Check for properties in the parsed hash that are not in the definition.
          for (p in options) if (options.hasOwnProperty(p)) {
            if (!(p in h)) {
              this.errorMessage.add(p, "Property lacks definition");
            }
          }
          for (p in h) {
            if (h[p] === undefined) {
              delete h[p];
            }
          }
          throwError();
          options = h;
        } else if (this.definition.type === "mixed") {
          // Accept any value.
        } else if (this.definition.type === typeof options) {
          // Standard types: string, number, boolean.
        } else if (this.definition.required === false && options === null) {
          if ("defaultValue" in this.definition) {
            options = this.definition.defaultValue;
          } else if ("defaultValueFunc" in this.definition) {
            options = this.definition.defaultValueFunc();
          } else {
            // .
          }
        } else if (this.definition.required === false && options === undefined) {
          fail("", "undefined is not an allowed atomic value.");
        } else {
          return primitiveFail();
        }
        if (true) {
          var vs = this.definition.validators;
          var valid = true;
          var messages = [];
          for (var i = 0; i < vs.length; i++) {
            var f;
            var msg;
            if (typeof vs[i] === "string") {
              if (typeof vs[i] === "string" && !builtInValidators.has(vs[i])) {
                throw new Error('Options:BUILD: undefined built in validator "%s"'.format(vs[i]));
              }

              var validator = builtInValidators.get(vs[i]);
              f = validator.func;
              msg = validator.message;
            } else {
              f = vs[i].func;
              msg = vs[i].message;
            }
            if (!f(options)) {
              valid = false;
              var message = msg || "got " + options + ".";
              this.errorMessage.add("", "Validation failed: " + message);
            }
          }
          if (valid) {
            return options;
          } else {
            if (throwErrors) {
              throw new Error(this.errorMessage.getErrorString());
            }
          }
        }

        return options;
      },
      /**
       * @param mixed value
       */
      _gettype : function (value) {
        if (typeof value === "string") {
          return value;
        } else if (value instanceof Array) {
          return [{ type : value[0].type }];
        } else if (value instanceof Function) {
          if ("meta" in value) {
            return value.meta.name;
          } else if (value.name) {
            return value.name;
          } else {
            return "Anonymous constructor";
          }
        } else if (value instanceof Object) {
          var h = {};
          for (var p in value) {
            var v = value[p];
            h[p] = { type : v.type };
          }
          return h;
        } else {
          throw new Error("Options:_getType: Unhandled type: " + value + ". Did you specify a type?");
        }
      },
      /**
       * @param mixed value
       */
      _typeof : function (value) {
        if (typeof value === "object") {
          if (value === null) {
            return "null";
          } else if ("meta" in value) {
            return value.meta.name;
          } else if (value.constructor.name) {
            return value.constructor.name;
          } else {
            return "Anonymous constructor";
          }
        } else {
          return typeof value;
        }
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
    }
  });
  /**
   * Simpler interface for creating Options parsers.
   * It only supports the atomic types, hashes and arrays.
   * Does not allow for maps, defaultValues, validators.
   * It's possible to have inner types that use the regular interface, just pass
   * a hash with the _type property and then specify types like in the regular
   * interface.
   *
   * @param Hash args
   * @return Options
   */
  Options.simple = function (definition) {
    function createType(simpleType) {
      if (simpleType instanceof Array) {
        return {
          type : [createType(simpleType[0])]
        };
      } else if (simpleType instanceof Object && simpleType._type) {
        return { type : simpleType._type };
      } else if (simpleType instanceof Object) {
        var h = {
          type : {}
        };
        for (var p in simpleType) {
          h.type[p] = createType(simpleType[p]);
        }
        return h;
      } else {
        return { type : simpleType };
      }
    }

    return new Options(createType(definition));
  };
});
