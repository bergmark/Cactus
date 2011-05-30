exports.initial = function () {
  var configPath = "./build/test/files/config.test.json";
  var tmpdirPath = "./build/test/tmp";
  var newPath = tmpdirPath + "/config.test.json";
  try {
    fs.mkdirSync(tmpdirPath, "777");

    var c = new Config({
      filepath : configPath
    });
    eql({
      number : 1,
      string : "str",
      bool : true
    }, c.contents);
    c.filepath = newPath;
    c.contents.number = 2;
    c.contents.bool = false;
    c.writeSync();

    var c2 = new Config({
      filepath : newPath
    });
    eql({
      number : 2,
      string : "str",
      bool : false
    }, c2.contents);
  } finally {
    fs.unlinkSync(newPath);
    fs.rmdirSync(tmpdirPath);
  }
};
