Module("Cactus.Web", function (m) {
  Role("ViewHandler", {
    /*
     * _clone
     *   A ViewHandler should be able to be cloned so that several Model/Views can
     *   use it independently.
     *  @param View
     */
    requires : ["clone"],
    has : {
      /**
       * @type View
       *   This value should be set in the constructor of implementing classes
       *   and may not change afterwards.
       */
      view : { is : "ro", required : true }
    }
  });
});