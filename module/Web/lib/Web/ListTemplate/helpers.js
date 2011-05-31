/**
 * Helpers for ListTemplate.
 */
(function () {
  var m = Cactus.Web.ListTemplate;
  var AC = Cactus.Data.arrayController;
  var $f = Cactus.Web.selectFirst;
  var Template = Cactus.Web.Template;

  /**
   * Shorthand for creating ListTemplate + Template combo.
   * It's assumed that the Template root is the first child node of the list
   * template root.
   *
   * The list template is bound to an array controller if one is supplied.
   *
   * @param HTMLElement listTemplateRoot
   * @param optional ArrayController arrayController
   * @param optional Hash templateSettings = {}
   * @param optional Hash listTemplateSettings = {}
   */
  m.createWithTemplate = function (listTemplateRoot, arrayController, templateSettings, listTemplateSettings) {
    templateSettings = templateSettings || {};
    listTemplateSettings = listTemplateSettings || {};
    console.log(listTemplateRoot);
    var templateRoot = $f("*", listTemplateRoot);
    var t = Template.create(templateRoot, templateSettings);
    if (arrayController) {
      listTemplateSettings.arrayController = arrayController;
    }
    var lt = m.create(t, listTemplateRoot, listTemplateSettings);
    return lt;
  };
})();
