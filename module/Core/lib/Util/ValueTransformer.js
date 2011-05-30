/**
 * @file
 * ValueTransformer is a mapping from one set of values to another, it has two
 * methods, forward and backward which are used to transform between these two
 * sets.
 * If either is omitted, the supplied value will simply be returned.
 */
Module("Cactus.Util", function () {
  Class("ValueTransformer", {
    has : {
      _forward : { required : true, is : "ro", getterName : "getForward" },
      _backward : { required : true, is : "ro", getterName : "getBackward" }
    },
    methods : {
      /**
       * @param {
       *   forward : optional Function = Function.id
       *                 @param <A>
       *                 @return <B>
       *   backward : optional Function = Function.id
       *                 @param <B>
       *                 @return <A>
       * } args
       */
      BUILD : function (args) {
        args = args || {};
        return {
          _forward : args.forward || null,
          _backward : args.backward || null
        };
      },
      /**
       * @param <A> a
       * @return <B>
       */
      forward : function (a) {
        if (this._forward) {
          return this._forward(a);
        }
        return a;
      },
      /**
       * @param <B> b
       * @return <A>
       */
      backward : function (b) {
        if (this._backward) {
          return this._backward(b);
        }
        return b;
      }
    }
  });
});
