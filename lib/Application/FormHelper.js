/**
 * @file
 *
 * FormHelper is meant to be used to specify the communication between
 * HTML forms and the application.  You assign fields and constraints for
 * those fields.
 *
 * It's tightly coupled with the Data and Renderer classes.
 *
 * Data is used to `populate` data so it can be validated before
 * `rendering` the form to assure that the application -> view values are
 * appropriate.  When going from view (form submissions) to application
 * `reversePopulate` is used to take the form representation back to the
 * Application representation. Note that reversePopulate is asynchronous
 * while populate is synchronous. This is due to the fact that the client
 * may want to make database lookups etc. at this step. When populating
 * this may as well be done beforehand. To create a Data object, call
 * FormHelper:newData.
 *
 * Renderer is used in the view (eg in the templating view/HTML
 * file). The client calls FormHelper:newRenderer(data) to make a
 * renderer for the specific FormHelper. The client then has to call
 * Renderer:begin before rendering fields and Renderer:end when done
 * rendering. This assures that all required fields are rendered. Errors
 * are thrown if required fields are omitted. In between :begin and :end,
 * call Renderer:field to get the Data values for the associated field,
 * this lets the client populate data to be edited.
 *
 */
Module("Cactus.Application", function (m) {
  var array = Cactus.Addon.Array;
  var C = Cactus.Data.Collection;
  var Options = Cactus.Util.Options;
  var o = Cactus.Addon.Object;

  Class("FormHelper", {
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
          type : {
            action : { type : "string" },
            fields : {
              map : true,
              type : {
                type : { type : "mixed" },
                inTransformer : { type : Function, defaultValue : Function.id },
                outTransformerCont : {
                  type : Function,
                  defaultValue : function (CONTINUE, value) {
                    CONTINUE(value);
                  }
                },
                required : { type : "boolean", defaultValue : true },
                validators : {
                  type : [{
                    type : {
                      func : { type : Function },
                      message : { type : "string" }
                    }
                  }],
                  defaultValue : []
                }
              }
            }
          }
        }).parse(definition);

        var fieldOptions = new Options({
          type : o.map(definition.fields, function (name, def) {
            var h = {
              type : def.type
            };
            if ("required" in def) {
              h.required = def.required;
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
        return this._definition.fields[fieldName].inTransformer(value);
      },
      /**
       * @return Array<string>
       *   All the defined fields.
       */
      getFieldNames : function () {
        return o.keys(o.map(this._definition.fields, function (key) {
          return key;
        })).sort();
      },
      /**
       * @return url
       */
      getAction : function () {
        return this._definition.action;
      },
      /**
       * @param Map<string fieldName, mixed value>
       * @return Data
       */
      newData : function (defaults) {
        return new m.Data2(this, defaults);
      },
      /**
       * @param Hash<string fieldName, mixed value>
       */
      parse : function (v) {
        this._fieldOptions.parse(v);
      },
      /**
       * @param Data
       * @return Renderer
       */
      newRenderer : function (data) {
        return new m.Renderer(this, data || this.newData());
      }
    },
    continued : {
      methods : {
        /**
         * @param string fieldName
         * @param mixed value
         * @return mixed
         */
        outTransformCont : function (fieldName, value) {
          if (!(fieldName in this._definition.fields)) {
            this.CONT.CONTINUE(value);
          } else {
            this._definition.fields[fieldName].outTransformerCont(this.CONT.getCONTINUE(), value);
          }
        }
      }
    }
  });
});
