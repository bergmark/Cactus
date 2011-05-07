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
      BUILD : function (definition) {
        definition = new Options({
          type : {
            action : { type : "string" },
            fields : {
              map : true,
              type : {
                type : { type : "mixed" },
                inTransformer : { type : Function, defaultValue : Function.id },
                outTransformerCont : { type : Function, defaultValue : Function.id },
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
      inTransform : function (fieldName, value) {
        return this._definition.fields[fieldName].inTransformer(value);
      },
      getFieldNames : function () {
        return o.keys(o.map(this._definition.fields, function (key) {
          return key;
        })).sort();
      },
      getAction : function () {
        return this._definition.action;
      },
      newData : function (defaults) {
        return new m.Data2(this, defaults);
      },
      parse : function (v) {
        this._fieldOptions.parse(v);
      },
      newRenderer : function (data) {
        return new m.Renderer2(this, data || this.newData());
      }
    },
    continued : {
      methods : {
        outTransformCont : function (fieldName, value) {
          this._definition.fields[fieldName].outTransformerCont(this.CONT.getCONTINUE(), value);
        }
      }
    }
  });
});
