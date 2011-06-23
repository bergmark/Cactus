var Assertion = Cactus.Dev.Assertion;
module.exports = {
  reg : function () {
    Assertion.reg(/x/, "x");
    exception(/\/y\/ !~ z/, Assertion.reg.curry(/y/, "z"));
  },
  listreg : function () {
    Assertion.listreg([/x/, /y/], ["x", "y"]);
    exception(/1 to equal 2/i, Assertion.listreg.bind(Assertion, [/x/], ["x", "y"]));
    exception(/2 to equal 1/i, Assertion.listreg.bind(Assertion, [/x/, /y/], ["x"]));
    exception(/\/y\/ !~ z/, Assertion.listreg.bind(Assertion, [/x/, /y/], ["x", "z"]));
  },
  unorderedeql : function () {
    Assertion.unorderedeql([1, 2], [2, 1]);
    exception(/1 elements intersecting/, Assertion.unorderedeql.bind(Assertion, [1,2], [2,3,4]));
  }
};
