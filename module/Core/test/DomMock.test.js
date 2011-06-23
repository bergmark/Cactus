module.exports = {
  createElement : function () {
    clearDom();
    var ul = document.createElement("ul");
    ul.setId("lt");
    var li = document.createElement("li");
    li.setId("myLi");
    ul.appendChild(li);
    equal(li, ul.getElementsByTagName("*")[0]);
  }
};
