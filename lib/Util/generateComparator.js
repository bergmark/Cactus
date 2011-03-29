/**
 * @file
 * Generates a "comparator function" for a sequence of KeyValueCoding key paths.
 * A comparator function takes two KVC objects as arguments and compares them,
 * returning -1, 0, or 1 depending on the result. This is the same format that
 * Array:sort expects.
 *
 * The obvious usages that come to mind are to sort arrays, and for use with
 * the SortDecorator.
 *
 * Example usage:
 * function Book(author, title) {
 *   this.author = author;
 *   this.title = title;
 * }
 * KVC.implement(Book);
 * var array = [
 *   new Book("Martin Fowler", "Refactoring"),
 *   new Book("Martin Fowler", "Analysis Patterns"),
 *   new Book("Kent Beck", "XP Explained")
 * ];
 * var comparator = generateComparator("author", "title");
 * array.sort(comparator);
 * a; // => [
 *   Book... "Analysis Patterns",
 *   Book... "Refactoring",
 *   Book... "XP Explained"
 * ];
 */
Joose.Module("Cactus.Util", function (m) {

  /**
   * @param primitive a
   * @param primitive b
   * @return integer in {-1, 0, 1}
   */
  function cmp(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  /**
   * @param string *keyPaths
   *   The key paths to sort after. The sorting is performed on the key paths
   *   from left to right, meaning the leftmost one will be the main criteria
   *   and latter ones will only be compared if the previous ones are equal.
   *   Note: The comparison is only defined for key paths containing primitive
   *   values.
   * @return Function
   *         @param KeyValueCoding a
   *         @param KeyValueCoding b
   *         @return integer in {-1,0,1}
   */
  function generateComparator(keyPath) {
    var args = arguments;
    return function (a, b) {
      var result;
      for (var i = 0; i < args.length; i++) {
        result = cmp(a.getValue(args[i]),
                     b.getValue(args[i]));
        if (result !== 0) {
          return result;
        }
      }
      return result;
    };
  }

  m.generateComparator = generateComparator;
});
