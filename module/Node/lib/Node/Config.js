/**
 * @file
 * Writes and reads JSON from the file system.
 * Access and modify data through myConfig.contents.
 */
Module("Cactus.Node", function (m) {
  var fs = require("fs");
  var JSON = Cactus.Util.JSON;
  Class("Config", {
    has : {
      filepath : null,
      contents : null,
      encoding : { init : "utf8" }
    },
    methods : {
      initialize : function () {
        this.readSync();
      },
      readSync : function () {
        this.contents = JSON.parse(fs.readFileSync(this.filepath, this.encoding));
      },
      writeSync : function () {
        fs.writeFileSync(this.filepath, JSON.stringify(this.contents), this.encodnig);
      }
    }
  });
});
