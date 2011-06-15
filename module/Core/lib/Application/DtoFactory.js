/**
 * @file
 *
 * DtoFactory is meant to be used to specify the communication between
 * HTML forms and the application. You assign fields and constraints for
 * those fields.
 *
 * It's tightly coupled with the Dto and Renderer classes.
 *
 * Dto is used to `populate` data so it can be validated before
 * `rendering` the form to assure that the application -> view values are
 * appropriate.  When going from view (form submissions) to application
 * `reversePopulate` is used to take the form representation back to the
 * Application representation. Note that reversePopulate is asynchronous
 * while populate is synchronous. This is due to the fact that the client
 * may want to make database lookups etc. at this step. When populating
 * this may as well be done beforehand. To create a Dto object, call
 * DtoFactory:newDto.
 *
 * Renderer is used in the view (eg in the templating view/HTML
 * file). The client calls DtoFactory:newRenderer(dto) to make a
 * renderer for the specific DtoFactory. The client then has to call
 * Renderer:begin before rendering fields and Renderer:end when done
 * rendering. This assures that all required fields are rendered. Errors
 * are thrown if required fields are omitted. In between :begin and :end,
 * call Renderer:field to get the Dto values for the associated field,
 * this lets the client populate dto to be edited.
 *
 */
Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var TypeChecker = Cactus.Util.TypeChecker;
  var O = Cactus.Addon.Object;

  Class("DtoFactory", {
    trait : JooseX.CPS,
    has : {
      _definition : null,
      _fieldTypeChecker : null,
      _defaults : null,
      _validators : null
    },
    methods : {
      /**
       * @param Hash definition
       *   See options definition in method.
       */
      BUILD : function (definition) {
        var me = this;

        var validators = definition.__validators || [];
        delete definition.__validators;

        definition = new TypeChecker({
          map : true,
          type : {
            // Property named "type".
            type : { type : "mixed" },
            required : { type : "boolean", defaultValue : true },
            defaultValue : { type : "mixed", required : false },
            inTransformer : { type : Function, defaultValue : Function.id },
            outTransformerCont : {
              type : Function,
              defaultValue : function (CONTINUE, value) {
                CONTINUE(value);
              }
            },
            validators : {
              type : [{ type : "mixed" }],
              defaultValue : []
            }
          }
        }).parse(definition);

        this._defaults = {};
        var fieldTypeChecker = new TypeChecker({
          type : O.map(definition, function (name, def) {
            var h = {
              type : def.type
            };
            if ("required" in def) {
              h.required = def.required;
            }
            if ("defaultValue" in def) {
              h.defaultValue = def.defaultValue;
              delete h.required;
              me._defaults[name] = def.defaultValue;
            }
            if ("validators" in def) {
              h.validators = def.validators;
            }
            return h;
          })
        });

        return {
          _definition : definition,
          _fieldTypeChecker : fieldTypeChecker,
          _validators : validators
        };
      },
      /**
       * Transforms a value from the application into the representation that
       * should be used in the view.
       *
       * @param string fieldName
       * @param mixed value
       * @return mixed
       */
      inTransform : function (fieldName, value) {
        return this._definition[fieldName].inTransformer(value);
      },
      /**
       * @return Array<string>
       *   All the defined fields.
       */
      getFieldNames : function () {
        return O.keys(O.map(this._definition, function (key) {
          return key;
        })).sort();
      },
      /**
       * @param Map<string fieldName, mixed value>
       * @return Dto
       */
      newDto : function (defaults) {
        return new m.Dto(this, O.merge(this._defaults, defaults));
      },
      /**
       * @param Hash<string fieldName, mixed value>
       * @param mixed helpers
       */
      parse : function (v, helpers) {
        v = this._fieldTypeChecker.parse(v);
        var me = this;
        var newValidators = [];
        for (var i = 0; i < this._validators.length; i++) {
          (function () {
            var validator = me._validators[i];
            newValidators.push({
              func : function (v) {
                return validator.func(v, helpers);
              },
              message : validator.message
            });
          })();
        }
        var newTypeChecker = new TypeChecker({
          type : "mixed",
          validators : newValidators
        });
        return newTypeChecker.parse(v);
      },
      /**
       * @param Dto dto
       * @return Renderer
       */
      newRenderer : function (dto, action) {
        return new m.Renderer(this, dto || this.newDto(), action);
      }
    },
    continued : {
      methods : {
        /**
         * @param string fieldName
         * @param mixed value
         * @param optional Map<string, mixed> helpers = {}
         * @return mixed
         */
        outTransformCont : function (fieldName, value, helpers) {
          helpers = helpers || {};
          if (!(fieldName in this._definition)) {
            this.CONT.CONTINUE(value);
          } else {
            this._definition[fieldName].outTransformerCont(this.CONT.getCONTINUE(), value, helpers);
          }
        },
        /**
         * Creates a new DTO and performs reversePopulate and then get on it.
         *
         * @param Hash vals
         *   Values to send to reversPopulate.
         * @param optional Hash helpers = {}
         *   Any helpers to pass along to outTransformerConts.
         * @return Hash
         *   Fields gotten when Dto:get is called.
         */
        prepareDto : function (vals, helpers) {
          var dto = this.newDto();
          dto.reversePopulate(vals, helpers).then(function () {
            try {
              var fields = dto.get(helpers);
              this.CONTINUE(fields);
            } catch (e) {
              this.THROW(e);
              return;
            }
          }).now();
        }
      }
    }
  });
});
