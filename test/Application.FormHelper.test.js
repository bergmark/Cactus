var FormHelper = Cactus.Application.FormHelper;
var C = Cactus.Data.Collection;

Class("User", {
  has : {
    name : null,
    password : null,
    email : null
  }
});

module.exports = {
  rendering : function () {
    var fh = new FormHelper({
      action : "/new",
      fields : {
        name : { required : true, format : /[A-Z ]/i },
        email : { required : true, format : /^[^@]+@[^@]+\.[^@]+/ },
        password : { type : "string", required : true },
        passwordConfirmation : { confirms : "password", required : false }
      }
    });
    var renderer = fh.newRenderer();
    renderer.begin();
    renderer.field("name");
    renderer.field("email");
    renderer.field("password");
    renderer.field("passwordConfirmation");
    renderer.end();

    // Need begin, render, end sequence.
    renderer = fh.newRenderer();
    assert.throws(renderer.end.bind(renderer), /end: Need to call begin/i);

    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.begin.bind(renderer), /begin: begin was called twice/i);

    renderer = fh.newRenderer();
    assert.throws(renderer.field.bind(renderer, "email"), /field: Need to call begin/i);

    // Need to render all required fields before end.
    assert.eql(["email", "name", "password", "passwordConfirmation"], fh.getFieldNames());
    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.end.bind(renderer),
                  /end: Missing required fields: email,name,password,passwordConfirmation/i);

    // Can't render undefined or already rendered fields.
    renderer = fh.newRenderer();
    renderer.begin();
    assert.throws(renderer.field.bind(renderer, "foo"),
                  /field: Trying to render undefined or already rendered field "foo"/i);
    renderer = fh.newRenderer();
    renderer.begin();
    renderer.field("name");
    assert.throws(renderer.field.bind(renderer, "name"),
                  /field: Trying to render undefined or already rendered field "name"/i);

  }
};
