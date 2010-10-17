var Joose = require('Joose');

Joose.Module("CactusJuice.Data", function (m) {
  Joose.Class("Range", {
    has : {
      start : {
        is : "ro"
      },
      end : {
        is : "ro"
      }
    },
    methods : {
      initialize : function (args) {
        var start = args.start;
        var end = args.end;
        this.start = start === -Infinity ? -Infinity : parseInt(start, 10);
        this.end = end === Infinity ? Infinity : parseInt(end, 10);

        if (this.start > this.end) {
          throw new Error("Range:initialize: start > end");
        }
      },
      /**
       * @return int
       */
      getStart : function () {
        return this.start;
      },
      /**
       * @return int
       */
      getEnd : function () {
        return this.end;
      },
      /**
       * @param int n
       * @return boolean
       */
      includes : function (n) {
        return n >= this.start &&
          n <= this.end;
      },
      /**
       * @return string
       */
      toString : function () {
        return this.start + ".." + this.end;
      }
    }
  });
});
