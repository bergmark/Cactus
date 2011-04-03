Module("Cactus.Util", function (m) {
  var C = Cactus.Data.Collection;
  var array = Cactus.Addon.Array;
  var Set = Cactus.Data.Set;
  function extend(Class, property, methods) {
    var has = {};
    has[property] = { init : methods.init };
    var capped = property.capitalize();
    methods["has" + capped] = methods.has;
    methods["remove" + capped] = methods.remove;
    methods["add" + capped] = methods.add;
    methods[property + "Count"] = methods.count;
    methods["get" + capped] = methods.get;
    Class.meta.extend({
      has : has,
      methods : methods
    });
  }

  m.CollectionAggregate = {
    array : function (Class, property) {
      extend(Class, property, {
        init : function () { return []; },
        has : function (v) {
          return C.hasValue(this[property], v);
        },
        remove : function (v) {
          array.remove(this[property], v);
        },
        add : function (v) {
          this[property].push(v);
        },
        count : function () {
          return this[property].length;
        },
        get : function () {
          return array.clone(this[property]);
        }
      });
    },
    set : function (Class, property) {
      var has = {};
      has[property] = { init : function () { return new Set(); } };
      var methods = {};
      var capped = property.capitalize();
      methods["has" + capped] = function (v) {
        return this[property].has(v);
      };
      methods["remove" + capped] = function (v) {
        this[property].remove(v);
      };
      methods["add" + capped] = function (v) {
        this[property].add(v);
      };
      methods[property + "Count"] = function () {
        return this[property].size();
      };
      methods["get" + capped] = function () {
        return this[property].map(Function.id);
      };
      Class.meta.extend({
        has : has,
        methods : methods
      });
    }
  };
});
