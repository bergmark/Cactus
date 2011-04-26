/**
 * @file
 * A range is a tuple (start, end) with start < end.
 */
Module("Cactus.Data", function (m) {
  Class("Range", {
    has : {
      start : {
        is : "ro"
      },
      end : {
        is : "ro"
      }
    },
    methods : {
      BUILD : function (start, end) {
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
      },
      /**
       * @return Array
       */
      toArray : function () {
        var res = [];
        for (var i = this.start; i <= this.end; i++) {
          res.push(i);
        }
        return res;
      }
    }
  });
});
