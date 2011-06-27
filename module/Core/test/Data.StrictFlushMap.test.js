var StrictFlushMap = Cactus.Data.StrictFlushMap;
module.exports = {
  initial : function () {
    var sfm = new StrictFlushMap();
    ok(sfm instanceof StrictFlushMap);
    ok(sfm instanceof StrictMap);
  },
  clearing : function () {
    var sfm = new StrictFlushMap();
    sfm.define("k", 1);
    ok(sfm.has("k"));
    equal(1, sfm.get("k"));
    not(sfm.has("k"));
  }
};
