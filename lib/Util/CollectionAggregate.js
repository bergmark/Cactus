Module("Cactus.Util", function (m) {
  var C = Cactus.Data.Collection;
  var array = Cactus.Addon.Array;
  var Set = Cactus.Data.Set;
  m.CollectionAggregate = {
    array : function (Class, property) {
      var has = {};
      has[property] = { init : function () { return []; } };
      var methods = {};
      var capped = property.capitalize();
      methods["has" + capped] = function (v) {
        return C.hasValue(this[property], v);
      };
      methods["remove" + capped] = function (v) {
        array.remove(this[property], v);
      };
      methods["add" + capped] = function (v) {
        this[property].push(v);
      };
      methods[property + "Count"] = function () {
        return this[property].length;
      };
      methods["get" + capped] = function () {
        return array.clone(this[property]);
      };

      Class.meta.extend({
        has : has,
        methods : methods
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
