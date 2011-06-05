Module("Cactus.Util", function (m) {
  m.environment = {
    isNodeJS : typeof global !== "undefined" && "process" in global,
    isBrowser : typeof window !== "undefined",
    global : (function () { return this; })()
  };
});
