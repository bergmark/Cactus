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
global.AC = Cactus.Data.ArrayController;
global.C = Cactus.Data.Collection;
global.Config = Cactus.Node.Config;
global.Dictionary = Cactus.Data.Dictionary;
global.KVC = Cactus.Data.KeyValueCoding;
global.LT = Cactus.Web.ListTemplate;
global.StrictMap = Cactus.Data.StrictMap;
global.TTransformer = Cactus.Web.Template.Transformer;

global.fs = require("fs");

global.assert = require("assert");
global.should = require("should");
global.log = console.log.bind(console);
global.contEx = function (cont, reg) {
  var e;
  return cont.except(function (_e) {
    e = _e;
    this.CONTINUE();
  }).ensure(function () {
    if (!e) {
      throw new Error("assertContEx: No error was thrown.");
    }
    console.log(e);
    assert.ok(reg.test(e.message), "assertContEx: Caught unexpected: " + e.message);
    this.CONTINUE();
  });
};
global.ok = function (v, msg) { true.should.equal(v, msg); };
global.not = function (v, msg) { false.should.equal(v, msg); };
global.equal = function (a, b, msg) { if (!a) { assert.strictEqual(a, b, msg); } else { a.should.equal(b, msg); }};
global.notequal = function (a, b, msg) { a.should.not.equal(b, msg); };
global.eql = function (a, b, msg) { a.should.eql(b, msg); };
var Assertion = Cactus.Dev.Assertion;
global.exception = Assertion.exception.bind(Assertion, assert);
global.instance = function (a, b, msg) { a.should.instanceof(b, msg); };

