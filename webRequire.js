window.require = function (path) {
  if (!/^\.\//.test(path)) {
    return;
  }
  var path = window.Cactus_pathPrefix + path.replace(/^\.\//, "") + ".js";
  document.write("<script src=\"" + path + "\"></script\>");
};
require("./Cactus");
require("./CactusWeb");
