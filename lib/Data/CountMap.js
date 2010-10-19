var Joose = require("Joose");
/**
 * @file
 * A CountMap is a Map from Key -> int that is used for counting.
 * Each value starts at 0 and the client can then call inc to increase this value.
 * The class could for instance be used to count occurrences of words in a string.
 * var cm = new CountMap();
 * var words = string.split(" ");
 * for (var i = 0; i < words.length; i++) {
 *     cm.inc(words[i]);
 * }
 */
Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("CountMap", {
    has : {
      map : {
        init : function () { return {}; }
      }
    },
    methods : {
      /**
       * @param String key
       * @return boolean
       */
      has : function (key) {
        return key in this.map;
      },
      /**
       * Increases the count for this key.
       * Initializes to 1 if key is undefined.
       *
       * @param String key
       */
      inc : function (key) {
        if (!this.has(key)) {
          this.map[key] = 0;
        }
        this.map[key]++;
      },
      /**
       * @param String key
       * @return int
       */
      get : function (key) {
        if (!this.has(key)) {
          return 0;
        }
        return this.map[key];
      },
      /**
       * Decreases the value, the key must be defined and the value must not
       * be zero (negative values are not allowed)
       *
       * @param String key
       */
      dec : function (key) {
        if (!this.has(key)) {
          throw new Error("CountMap:dec: Cannot dec undefined key %".format(key));
        }
        if (this.get(key) === 0) {
          throw new Error("CountMap:dec: Value is 0 and cannot be decreased.");
        }
        this.map[key]--;
      }
    }
  });
});