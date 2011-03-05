var Joose = require('Joose');
require('../CactusJuice.js');

module.exports = (function () {
  var assertException = CactusJuice.Dev.Assertion.exception;
  return {
    "capitalize" : function (assert) {
      assert.eql("Foo", "Foo".capitalize());
      assert.eql("Foo", "foo".capitalize());
      assert.eql("FOO", "fOO".capitalize());
      assert.eql("", "".capitalize());
    },

    camelCase : function (assert) {
      assert.eql("abCdEf", "ab_cd_ef".camelCase());
      assert.eql("abcdef", "abcdef".camelCase());
    },

    underscore : function (assert) {
      assert.eql("ab_cd_ef", "abCdEf".underscore());
      assert.eql("abcdef", "abcdef".underscore());
    },

    format : function (assert) {
      assert.eql("foo", "%s".format("foo"));
      assert.eql("foo bar", "%s %s".format("foo", "bar"));
    },

    hasPrefix : function (assert) {
      assert.ok("foo".hasPrefix(""));
      assert.ok("".hasPrefix(""));

      assert.ok("foo".hasPrefix("foo"));
      assert.ok("foo".hasPrefix("f"));

      assert.ok(!"foo".hasPrefix("x"));
      assert.ok(!"foo".hasPrefix("fou"));
    },

    hasSuffix : function (assert) {
      assert.ok("foo".hasSuffix(""));
      assert.ok("".hasSuffix(""));

      assert.ok("foo".hasSuffix("foo"));
      assert.ok("foo".hasSuffix("o"));

      assert.ok(!"foo".hasSuffix("x"));
      assert.ok(!"foo".hasSuffix("fou"));
    },

    hasSubstring : function (assert) {
      assert.ok("".hasSubstring(""), 1);
      assert.ok("abc".hasSubstring(""), 2);
      assert.ok("abc".hasSubstring("ab"), 3);
      assert.ok("abc".hasSubstring("bc"), 4);
      assert.ok(!"abc".hasSubstring("x"), 5);
      assert.ok(!"abc".hasSubstring("cd"), 6);
      assert.ok(!"abc".hasSubstring("za"), 7);
    },

    trim : function (assert) {
      assert.eql("", "".trim());
      assert.eql("", " ".trim());
      assert.eql("", "  ".trim());
      assert.eql("a", " a".trim());
      assert.eql("b", "b ".trim());
      assert.eql("c", " c ".trim());
      assert.eql("d", " d ".trim());
      assert.eql("e", "  e  ".trim());
      assert.eql("a b c", " a b c ".trim());
    },

    reverse : function (assert) {
      assert.eql("", "".reverse());
      assert.eql("abc", "abc".reverse().reverse());
      assert.eql("abc", "cba".reverse());
    },

    removeLast : function (assert) {
      assert.strictEqual("", "a".removeLast());
      assert.strictEqual("ab", "abc".removeLast());
      assert.throws(function () {
        "".removeLast();
      });
    },

    removeFirst : function (assert) {
      assert.strictEqual("", "a".removeFirst());
      assert.strictEqual("bc", "abc".removeFirst());
      assert.throws(function () {
        "".removeFirst();
      });
    }
  };
})();
