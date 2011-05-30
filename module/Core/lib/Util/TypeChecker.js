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
          return 'TypeChecker: Error in property "%s": %s'.format(p, msg);
        } else {
          return 'TypeChecker: Error: %s'.format(msg);
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

  var types = {};
  var Type = Class({
    methods : {
      check : function () {
        throw new Error("Type: abstract check.");
      },
      getName : function () {
        throw new Error("Type: abstract getName.");
      }
    }
  });
  var T_Union = Class({
    isa : Type,
    has : {
      types : null
    },
    methods : {
      BUILD : function (types) {
        return {
          types : types || []
        };
      },
      check : function (value, em) {
        if (!collection.hasValue(this.types, TypeChecker.typeof(value))) {
          em.add("", "Expected a Union");
        }
        return value;
      },
      getName : function () {
        return { union : this.types };
      }
    }
  });
  types.T_Union = T_Union;

  var T_Primitive = Class({
    isa : Type,
    has : {
      type : null
    },
    methods : {
      BUILD : function (type) {
        return {
          type : type
        };
      },
      check : function (value, em) {
        if (typeof value !== this.type) {
          em.add("", typeFail(this, value));
        }
        return value;
      },
      getName : function () {
        return this.type;
      }
    }
  });
  types.T_Primitive = T_Primitive;

  var T_Map = Class({
    isa : Type,
    has : {
      innerType : null
    },
    methods : {
      BUILD : function (innerType) {
        return {
          innerType : innerType
        };
      },
      check : function (value, em) {
        // Maps.
        var m = {};
        for (var p in value) {
          var option = new TypeChecker({ type : this.innerType });
          m[p] = option.parse(value[p], false);
          em.addSubObj(p, option._getErrorMessage());
        }
        return m;
      }
    }
  });
  types.T_Map = T_Map;

  var T_Instance = Class({
    isa : Type,
    has : {
      _constructor : null
    },
    methods : {
      BUILD : function (constructor) {
        return {
          _constructor : constructor
        };
      },
      check : function (value, em) {
        if (!(value instanceof this._constructor)) {
          em.add("", 'Expected an instance of "%s", but got value <%s> (type "%s")'
                 .format(this._getName(), value, TypeChecker.typeof(value)));
        }
        return value;
      },
      _getName : function () {
        var c = this._constructor;
        if ("meta" in c) {
          return c.meta.name;
        } else if (c.name) {
          return c.name;
        } else {
          return "anonymous type";
        }
        throw new Error("T_Instance: unhandled constructor: " + c);
      },
      getName : function () {
        return { type : this._constructor };
      }
    }
  });
  types.T_Instance = T_Instance;

  var T_Enumerable = Class({
    isa : Type,
    has : {
      values : { init : function () { return []; } }
    },
    methods : {
      BUILD : function (values) {
        return {
          values : values
        };
      },
      check : function (value, em) {
        if (!collection.hasValue(this.values, value)) {
          em.add("", "Expected a value in [" + this.values + "], but got " + value);
        }
        return value;
      },
      getName : function () {
        return { enumerable : this.values };
      }
    }
  });
  types.T_Enumerable = T_Enumerable;

  function typeFail(type, value) {
    return "Expected " + JSON.stringify(TypeChecker.gettype(type)) +
      ", but got " + JSON.stringify(value) + " (type " + JSON.stringify(TypeChecker.typeof(value)) + ")";
  };

  var T_Mixed = Class({
    isa : Type,
    methods : {
      check : function (value, em) {
        return value;
      },
      getName : function () {
        return "mixed";
      }
    }
  });
  types.T_Mixed = T_Mixed;

  var T_Array = Class({
    isa : Type,
    has : {
      elementType : null
    },
    methods : {
      BUILD : function (elementType) {
        return {
          elementType : elementType
        };
      },
      check : function (value, em) {
        if (!(value instanceof Array)) {
          em.add("", typeFail(this, value));
          return value;
        }

        var subTypeChecker = [];
        var vs = [];
        for (var i = 0; i < value.length; i++) {
          var option = new TypeChecker(this.elementType);
          subTypeChecker.push(option);
          vs.push(option.parse(value[i], false));
          em.addSubObj(i, option._getErrorMessage());
        }
        return vs;
      },
      getName : function () {
        return [this.elementType];
      }
    }
  });
  types.T_Array = T_Array;

  var T_Hash = Class({
    isa : Type,
    has : {
      type : null,
      allowUndefined : null
    },
    methods : {
      /**
       * @param Type type
       * @param optional allowUndefined = false
       */
      BUILD : function (type, allowUndefined) {
        return {
          type : type,
          allowUndefined : !!allowUndefined
        };
      },
      getName : function () {
        return this.type;
      },
      check : function (value, em) {
        if (!(value instanceof Object)) {
          em.add("", typeFail(this, value));
          return value;
        }

        var h = {};
        // All properties in the definition.
        for (var p in this.type) if (this.type.hasOwnProperty(p)) {
          if (!(p in value) && (this.type[p].required || !("required" in this.type[p]))
              && !("defaultValue" in this.type[p])
              && !("defaultValueFunc" in this.type[p])) {
            em.add(p, "Missing property");
          } else {
            var opts = new TypeChecker(this.type[p], false);
            h[p] = opts.parse(value[p], false);
            if (opts.hasErrors()) {
              em.addSubObj(p, opts._getErrorMessage());
            }
          }
        }
        if (!this.allowUndefined) {
          // Check for properties in the parsed hash that are not in the definition.
          for (p in value) if (value.hasOwnProperty(p)) {
            if (!(p in h)) {
              em.add(p, "Property lacks definition");
            }
          }
        }
        for (p in h) {
          if (h[p] === undefined) {
            delete h[p];
          }
        }
        return h;
      }
    }
  });
  types.T_Hash = T_Hash;

  var TypeChecker = Class("TypeChecker", {
    has : {
      definition : null,
      errorMessage : null
    },
    my : {
      methods : {
        /**
         * @return string
         *   The name of a type
         */
        gettype : function (value) {
          if (value instanceof Type) {
            return value.getName();
          } else if (value instanceof Array) {
            // > Remove
            return [{ type : value[0].type }];
          } else if (value instanceof Object) {
            var h = {};
            for (var p in value) {
              var v = value[p];
              h[p] = { type : v.type };
            }
            return h;
          } else {
            throw new Error("TypeChecker.gettype: Unhandled type: " + value + ". Did you specify a type?");
          }
        },
        /**
         * @return string
         *   The type of a value.
         */
        typeof : function (v) {
          if (typeof v === "function") {
            return "Function";
          }
          if (typeof v !== "object") {
            return typeof v;
          }
          if (v === null) {
            return "null";
          }
          if (typeof v === "object") {
            if ("meta" in v) {
              return v.meta.name;
            }
            if (v.constructor.name === "") {
              return "anonymous type";
            }
            return v.constructor.name;
          }
          throw new Error("TypeChecker:typeof: unhandled value " + v);
        }
      }
    },
    methods : {
      BUILD : function (definition) {
        this.definition = {};
        if (!(definition instanceof Object)) {
          throw new Error("TypeChecker:BUILD: definition must be a hash.");
        }

        (function () {
          var i = 0;
          if ("defaultValueFunc" in definition) i++;
          if ("defaultValue" in definition) i++;
          if ("required" in definition) i++;
          if (i > 1) {
            throw new Error("TypeChecker:BUILD: May only specify one of required, defaultValue and defaultValueFunc");
          }
        })();
        // > Throw if both defval and defvalfunc are specified
        if ("defaultValue" in definition) {
          this.definition.required = false;
          this.definition.defaultValue = definition.defaultValue;

          // Check type of defaultValue.
          delete definition.defaultValue;
          new TypeChecker(definition).parse(this.definition.defaultValue);
          definition.defaultValue = this.definition.defaultValue;
        } else if ("defaultValueFunc" in definition) {
          this.definition.required = false;
          this.definition.defaultValueFunc = definition.defaultValueFunc;
          // Can't check type since it may have side effects
          // or depend on side effects.
        } else if ("required" in definition) {
          this.definition.required = !!definition.required;
        } else {
          this.definition.required = true;
        }

        this.definition.validators = definition.validators || [];

        if (definition.union) {
          this.definition.type = new T_Union(definition.union);
        } else if (definition.enumerable) {
          this.definition.type = new T_Enumerable(definition.enumerable);
        } else if (definition.type instanceof Array) {
          this.definition.type = new T_Array(definition.type[0]);
        } else if (definition.type === "mixed") {
          this.definition.type = new T_Mixed();
        } else if (definition.type instanceof Function) {
          this.definition.type = new T_Instance(definition.type);
        } else if ("map" in definition) {
          this.definition.type = new T_Map(definition.type);
        } else if (typeof definition.type === "string") {
          this.definition.type = new T_Primitive(definition.type);
        } else {
          var allowUndefined = !!definition.allowUndefined;
          this.definition.type = new T_Hash(definition.type, allowUndefined);
        }
      },
      parse : function (options, throwErrors) {
        this.errorMessage = new ErrorMessage();
        var subTypeChecker = [];
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
          return fail("", "Expected " + JSON.stringify(TypeChecker.gettype(this.definition.type)) +
                      ", but got " + JSON.stringify(TypeChecker.typeof(options)));
        }.bind(this);
        if (this.definition.required === false && (options === null || options === undefined)) {
          if ("defaultValue" in this.definition) {
            options = this.definition.defaultValue;
          } else if ("defaultValueFunc" in this.definition) {
            options = this.definition.defaultValueFunc();
          } else {
            return options;
          }
        }
        if (this.definition.type instanceof Type) {
          options = this.definition.type.check(options, this.errorMessage);
          throwError();
        } else {
          return primitiveFail();
        }
        var vs = this.definition.validators;
        var valid = true;
        var messages = [];
        for (var i = 0; i < vs.length; i++) {
          var f;
          var msg;
          if (typeof vs[i] === "string") {
            if (typeof vs[i] === "string" && !builtInValidators.has(vs[i])) {
              throw new Error('TypeChecker:BUILD: undefined built in validator "%s"'.format(vs[i]));
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
        throwError();
        return options;
      },
      /**
       * @param mixed value
       */
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
   * Simpler interface for creating TypeChecker parsers.
   * It only supports the atomic types, hashes and arrays.
   * Does not allow for maps, defaultValues, validators.
   * It's possible to have inner types that use the regular interface, just pass
   * a hash with the _type property and then specify types like in the regular
   * interface.
   *
   * @param Hash args
   * @return TypeChecker
   */
  TypeChecker.simple = function (definition) {
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

    return new TypeChecker(createType(definition));
  };

  TypeChecker.types = types;
});
