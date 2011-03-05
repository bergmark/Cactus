/**
 * @file
 * Additions for the String object, these methods are attached
 * to String.prototype.
 */

/**
 * Forces the first character of a string to uppercase.
 *
 * @return string
 *   The capitalized string.
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
/**
 * Removes all underscores and turns the succeeding character into uppercase.
 *
 * @return string
 *   The camel cased string.
 */
String.prototype.camelCase = function () {
  return this.replace(/_(.)/g, function (str, character) {
    return character.toUpperCase();
  });
};
/**
 * Turns camelcasing into underscores, that is, abCdEf turns into ab_cd_ef.
 *
 * @return string
 *   The underscored string
 */
String.prototype.underscore = function () {
  return this.replace(/[A-Z]/g, function (match) {
    return "_" + match.toLowerCase();
  });
};
/**
 * Formats a string in a printf like manner. Insert %s where you want to insert
 * a substring and pass the arguments in the same order as the %s's occur.
 *
 * @param mixed *args
 *   Arguments to replace the %s's with.
 */
String.prototype.format = function () {
  var s = this;
  for (var i = 0; i < arguments.length; i++) {
    s = s.replace("%s", arguments [i]);
  }
  return s;
};
/**
 * Checks whether a string has the given prefix.
 * The empty string is a prefix of every string.
 *
 * @param string prefix
 * @return boolean
 */
String.prototype.hasPrefix = function (prefix) {
  return this.substring(0, prefix.length) === prefix;
};
/**
 * Checks whether a string has the given suffix.
 * The empty string is a suffix of every string.
 *
 * @param string suffix
 * @return boolean
 */
String.prototype.hasSuffix = function (suffix) {
  return this.substring(this.length - suffix.length) === suffix;
};
/**
 * Checks whether a string contains the given substring.
 * The empty string is a substring of every string.
 *
 * @param string substring
 * @return boolean
 */
String.prototype.hasSubstring = function (substring) {
  return this.indexOf(substring) !== -1;
};
/**
 * Removes prefixing and trailing whitespace from a string.
 *
 * @return string
 */
String.prototype.trim = function () {
  return this.replace(/^\s+/, "").replace(/\s+$/, "");
};
/**
 * Reverses a string.
 *
 * @return string
 */
String.prototype.reverse = function () {
  return this.split("").reverse().join("");
};
/**
 * Removes the last character in a string.
 * Throws an Error if the string is empty.
 *
 * @return string
 */
String.prototype.removeLast = function () {
  if (this.length === 0) {
    throw new Error("String:removeLast: Empty string.");
  }
  return this.substr(0, this.length - 1);
};
/**
 * Removes the first character in a string.
 * Throws an Error if the string is empty.
 *
 * @return string
 */
String.prototype.removeFirst = function () {
  if (this.length === 0) {
    throw new Error("String:removeFirst: Empty string.");
  }
  return this.substr(1);
};
