require("./Cactus");
Joose.C.debug = true;
require("./CactusNode");

// Mock window for web modules.
(function () {
  var A = Cactus.Addon.Array;
  var Dictionary = Cactus.Data.Dictionary;
  var StrictMap = Cactus.Data.StrictMap;
  var StrictArray = Cactus.Data.StrictArray;

  var elementsById = new Dictionary();
  var elementsByTagName = new Dictionary();

  function getElementsByTagName(dict, name) {
    if (name === "*") {
      var res = [];
      for (var i = 0, keys = dict.keys(); i < keys.length; i++) {
        var key = keys[i];
        res = res.concat(dict.get(key));
      }
      return res;
    }
    return dict.get(name);
  }
  Class("Element", {
    has : {
      elementsByTagName : { init : function () { return new Dictionary(); } },
      children : { init : function () { return new StrictArray(); } },
      tagName : { required : true },
      id : null,
      childNodes : { init : A.new }
    },
    methods : {
      initialize : function () {
        if (this.tagName === "select") {
          this.tagName.length = 0;
        }
      },
      getElementsByTagName : function (name) {
        return getElementsByTagName(this.elementsByTagName, name);
      },
      setId : function (id) {
        this.id = id;
        elementsById.add(id, this);
      },
      appendChild : function (el) {
        this.children.add(el);
        this.elementsByTagName.add(el.tagName, el);
      }
    }
  });
  global.document = {
    createElement : function (tagName) {
      return new Element({
        tagName : tagName
      });
    },
    getElementById : function (id) {
      return elementsById.get(id)[0];
    },
    getElementsByTagName : function (name) {
      return getElementsByTagName(elementsByTagName, name);
    }
  };
  global.navigator = {};
  global.window = {
    document : document,
    navigator : navigator
  };
  global.clearDom = function () {
    elementsById = new Dictionary();
    elementsByTagName = new Dictionary();
  };
})();

require("./CactusWeb");

// Short hands for imports.
global.A = Cactus.Addon.Array;
global.AC = Cactus.Data.ArrayController;
global.C = Cactus.Data.Collection;
global.Config = Cactus.Node.Config;
global.Dictionary = Cactus.Data.Dictionary;
global.KVC = Cactus.Data.KeyValueCoding;
global.LT = Cactus.Web.ListTemplate;
global.O = Cactus.Addon.Object;
global.StrictMap = Cactus.Data.StrictMap;
global.TTransformer = Cactus.Web.Template.Transformer;
global.env = Cactus.Util.environment;

global.fs = require("fs");

global.assert = require("assert");
global.should = require("should");
global.log = console.log.bind(console);
var Assertion = Cactus.Dev.Assertion;
global.exception = Assertion.exception.bind(Assertion, assert);
for (var p in Assertion) {
  global[p] = Assertion[p];
}
