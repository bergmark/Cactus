var FormHelper = Cactus.Application.FormHelper2;
var C = Cactus.Data.Collection;
var Renderer = Cactus.Application.Renderer;

var userfh = new FormHelper({
  fields : {
    email : null,
    name : null,
    password : null,
    passwordConfirmation : null
  }
});

module.exports = {
  formhelper : function () {
    var fh = userfh;
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
  }
};
