module.exports = (function () {
  var generateComparator = CactusJuice.Util.generateComparator;
  var gen = generateComparator;
  var KVC = CactusJuice.Data.KeyValueCoding;

  var Book = Joose.Class("Book", {
    does : KVC,
    has : {
      author : null,
      title : null
    },
    methods : {
      BUILD : function (author, title) {
        return {
          author : author,
          title : title
        };
      }
    }
  });

  return {
    // Generate a comparator for a single key path.
    "single key path" : function (assert) {
      var beck = new Book("Beck");
      var fowler = new Book("Fowler");

      var authorComp = gen("author");

      assert.strictEqual(0, authorComp(fowler, fowler));
      assert.strictEqual(1, authorComp(fowler, beck));
      assert.strictEqual(-1, authorComp(beck,  fowler));
    },

    // Generate for multiple key paths.
    "multiple key paths" : function (assert) {
      var beckTDD = new Book("Beck", "TDD by Example");
      var beckXP = new Book("Beck", "XP explained");
      var fowlerPoEAA = new Book("Fowler", "PoEAA");
      var fowlerAnalysis = new Book("Fowler", "Analysis Patterns");

      var comp = gen("author", "title");
      assert.strictEqual(0, comp(beckTDD, beckTDD));
      assert.strictEqual(-1, comp(beckTDD, beckXP));
      assert.strictEqual(1, comp(beckXP, beckTDD));
      assert.strictEqual(1, comp(fowlerPoEAA, beckXP));
    }
  };
})();
