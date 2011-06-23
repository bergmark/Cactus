/**
 * @file
 *
 * Strict version of Set which throws errors if the client tries to add an
 * already existing element or tries to remove a non-existing one.
 *
 * See Set for the rest of the documentation.
 */
Module("Cactus.Data", function (m) {
  var Set = m.Set;
  Class("StrictSet", {
    isa : Set,
    methods : {
      add : function (v) {
        if (this.has(v)) {
          throw new Error("StrictSet:add: Value already in StrictSet.");
        }
        this.SUPER(v);
      },
      remove : function (v) {
        if (!this.has(v)) {
          throw new Error("StrictSet:remove: Value not in StrictSet.");
        }
        this.SUPER(v);
      }
    }
  });
});
