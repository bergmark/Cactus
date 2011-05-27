/**
 * @file
 * ValueTransformer is a mapping from one set of values to another, it has two
 * methods, transform and reverse which are used to transform between these two
 * sets.
 * If either is omitted, the supplied value will simply be returned.
 */
Module("Cactus.Util", function () {
  Class("ValueTransformer", {
    has : {
      _transform : { required : true, is : "ro", getterName : "getTransform" },
      _reverse : { required : true, is : "ro", getterName : "getReverse" }
    },
    methods : {
      /**
       * @param {
       *   transform : optional Function
       *                 @param <A>
       *                 @return <B>
       *   reverse : optional Function
       *                 @param <B>
       *                 @return <A>
       * } args
       */
      BUILD : function (args) {
        args = args || {};
        return {
          _transform : args.transform || null,
          _reverse : args.reverse || null
        };
      },
      /**
       * @param <A> a
       * @return <B>
       */
      transform : function (a) {
        if (this._transform) {
          return this._transform(a);
        }
        return a;
      },
      /**
       * @param <B> b
       * @return <A>
       */
      reverse : function (b) {
        if (this._reverse) {
          return this._reverse(b);
        }
        return b;
      }
    }
  });
});
