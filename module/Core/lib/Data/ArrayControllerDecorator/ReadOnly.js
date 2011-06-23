/**
 * @file
 * ReadOnly decorates an ArrayController and prevents any modifications from
 * occuring from ReadOnly and decorators applied to it.
 *
 * The component AC may still mutate itself and the ReadOnly will be updated.
 * This is the AC variant of returing a shallow clone of an array.
 */
Module("Cactus.Data.ArrayControllerDecorator", function (m) {
  var ACD = m;
  Class("ReadOnly", {
    isa : ACD,
    methods : {
      __readOnly : function () {
        throw new Error(this.meta.name + ": read only");
      },
      add : function () {
        this.__readOnly();
      },
      addAtIndex : function () {
        this.__readOnly();
      },
      remove : function () {
        this.__readOnly();
      },
      swap : function () {
        this.__readOnly();
      },
      replace : function () {
        this.__readOnly();
      }
    }
  });
});
