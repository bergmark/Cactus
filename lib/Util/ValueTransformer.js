/**
 * @file
 * ValueTransformer is a mapping from one set of values to another, it has two
 * methods, transform and reverse which are used to transform between these two
 * sets.
 */
Module("Cactus.Util", function () {
  Class("ValueTransformer", {
    has : {
      _transform : { required : true },
      _reverse : { required : true }
    },
    methods : {
      /**
       * @param {
       *   transform : Function
       *                 @param <A>
       *                 @return <B>
       *   reverse : Function
       *                 @param <B>
       *                 @return <A>
       * } args
       */
      BUILD : function (args) {
        return {
          _transform : args.transform,
          _reverse : args.reverse
        };
      },
      /**
       * @param <A> a
       * @return <B>
       */
      transform : function (a) {
        return this._transform(a);
      },
      /**
       * @param <B> b
       * @return <A>
       */
      reverse : function (b) {
        return this._reverse(b);
      }
    }
  });
});
