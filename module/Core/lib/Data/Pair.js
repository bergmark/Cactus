/**
 * @file
 * A Pair is a value object containing two values, first and second.
 * The first and second do not have to share a type.
 * You can not mutate it, create a new Pair instead.
 */
Module("Cactus.Data", function (m) {
  var Pair = Class("Pair", {
    has : {
      /**
       * @type <A>
       */
      first : {
        is : "ro"
      },
      /**
       * @type <B>
       */
      second : {
        is : "ro"
      }
    },
    methods : {
      /**
       * @param <A> first
       * @param <B> second
       */
      BUILD : function (first, second) {
        return {
          first : first,
          second : second
        };
      },
      /**
       * @param Pair<A,B> p
       * @return boolean
       */
      equals : function (p) {
        return this.getFirst() === p.getFirst() && this.getSecond() === p.getSecond();
      },
      /**
       * @param C first
       * @return Pair<C,B>
       */
      changeFirst : function (first) {
        return new Pair(first, this.getSecond());
      },
      /**
       * @param C second
       * @return Pair<A,C>
       */
      changeSecond : function (second) {
        return new Pair(this.getFirst(), second);
      },
      /**
       * @return map{
       *   first : <A>
       *   second : <C>
       * }
       */
      serialize : function () {
        return {
          first : this.getFirst(),
          second : this.getSecond()
        };
      }
    }
  });
});
