module.exports = {
  initial : function () {
    ok(env.isNodeJS);
    not(env.isBrowser);
    ok(global === env.global);
  }
};
