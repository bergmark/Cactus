function createRequire(pathPrefix) {
  window.require = function (path) {
    if (!/^\.\//.test(path)) {
      return;
    }
    path = pathPrefix + path.replace(/^\.\//, "").replace(/$/, ".js");
    document.write("<script src=\"" + path + "\"></script\>");
  };
}
