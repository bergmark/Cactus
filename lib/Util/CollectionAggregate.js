/**
 * @file
 * When classes have one to many relationships there's often a lot of
 * boiler plate code necessary to work with these. CollectionAggregate
 * generates these methods automatically.
 *
 * For instance, if you have a User class with a one to many
 * relationship "friends", we can call CollectionAggregate.set(User,
 * "friend") and the friend set is added as a property, the methods
 * added are hasFriend, removeFriend, addFriend, friendCount and
 * getFriends.
 *
 * Note that the plural form in getFriends is just an appended "s", so nothing
 * fancy here.
 * The getter also returns a shallow copy of the collection, so clients calling
 * get may take ownership of the returned collection.
 *
 * The third argument to the methods is an options hash, here you can specify an
 * array of privateMethods, these methods will be prefixed with an underscore
 * (private access "modifier").
 */
Module("Cactus.Util", function (m) {
  var C = Cactus.Data.Collection;
  var array = Cactus.Addon.Array;
  var Set = Cactus.Data.Set;
  var TypeChecker = Cactus.Util.TypeChecker;
  /**
   * @param class Class
   * @param string property
   * @param Hash methods
   */
  function extend(Class, property, options, methods) {
    var o = new TypeChecker({
      type : {
        privateMethods : {
          required : false,
          defaultValue : [],
          type : [{
            enumerable : ["has", "remove", "add", "count", "get"]
          }]
        }
      }
    });
    options = o.parse(options || {});

    function accessPrefix(methodName) {
      if (C.hasValue(options.privateMethods, methodName)) {
        return "_";
      }
      return "";
    }
    var has = {};
    has[property] = { init : methods.init };
    var capped = property.capitalize();
    methods[accessPrefix("has") + "has" + capped] = methods.has;
    methods[accessPrefix("remove") + "remove" + capped] = methods.remove;
    methods[accessPrefix("add") + "add" + capped] = methods.add;
    methods[accessPrefix("count") + property + "Count"] = methods.count;
    methods[accessPrefix("get") + "get" + capped + "s"] = methods.get;
    Class.meta.extend({
      has : has,
      methods : methods
    });
  }

  m.CollectionAggregate = {
    array : function (Class, property, options) {
      extend(Class, property, options, {
        init : function () {
          return [];
        },
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
    set : function (Class, property, options) {
      extend(Class, property, options, {
        init : function () {
          return new Set();
        },
        has : function (v) {
          return this[property].has(v);
        },
        remove : function (v) {
          this[property].remove(v);
        },
        add : function (v) {
          this[property].add(v);
        },
        count : function () {
          return this[property].size();
        },
        get : function () {
          return this[property].map(Function.id);
        }
      });
    }
  };
});
