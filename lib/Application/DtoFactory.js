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
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("DtoFactory", {
    trait : JooseX.CPS,
    has : {
      _definition : null,
      _fieldOptions : null
    },
    methods : {
      /**
       * @param Hash definition
       *   See options definition in method.
       */
      BUILD : function (definition) {
        definition = new Options({
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

        var fieldOptions = new Options({
          type : o.map(definition, function (name, def) {
            var h = {
              type : def.type
            };
            if ("required" in def) {
              h.required = def.required;
            }
            if ("defaultValue" in def) {
              h.required = false;
              h.defaultValue = def.defaultValue;
            }
            if ("validators" in def) {
              h.validators = def.validators;
            }
            return h;
          })
        });

        return {
          _definition : definition,
          _fieldOptions : fieldOptions
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
        return o.keys(o.map(this._definition, function (key) {
          return key;
        })).sort();
      },
      /**
       * @param Map<string fieldName, mixed value>
       * @return Dto
       */
      newDto : function (defaults) {
        return new m.Dto(this, defaults);
      },
      /**
       * @param Hash<string fieldName, mixed value>
       */
      parse : function (v) {
        return this._fieldOptions.parse(v);
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
        }
      }
    }
  });
});
