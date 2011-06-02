Cactus started out as a library that was supposed to fix cross browser
issues. It expanded into a collection of utilies useful... pretty much
always.

It has now been refactored to use with the Joose (http://www.joose.it)
meta object system and it runs on both node and in the browser.

Quick run-through of current functionality:

 * The Addon module contains addons to the built in data types.

 * Data contains data structures (Map, Set, Tree) and more high-level
   structures (ArrayController, KeyValueCoding).

 * Util contains stuff that doesn't belong anywhere else.

 * Web contains helpers for cross browser functionality, selectors, and
   wrappers that simplifies working with the DOM a lot.


Code Conventions (work in progress)

 * _ may be used for argument names in callbacks that are not used.

 * Camelcase abbreviations, `Id` and `Url`.

 * Set default values for parameters at the top of a functions body,
   or use TypeChecker to set them (also use at top.)

 * Events should be named in the correct grammatical form, most often
   in preterite to avoid confusion. `onAdd` is ambiguous,
   `onBeforeAdd` or `onAdded` (prefer over `onAfterAdd` for
   conciseness) is not.

 * Comments should not stretch over 80 columns wide.

 * Don't marginal adjust comments.

 * Lines should not be wider than ~120 characters.

Types in documentation

 * primitive types (number, boolean, string) => as is
 * an instance of class C => C
 * an implementer of a role R => R
 * collection => numbered by indices 0..length-1, has length property
 * hash => Object with properties that may contain different values
 * map => Object where each property has the same type
 * entity => any value that can be compared with ===
 * Object => any non-primitive value
 * null/undefined is never allowed for any type unless explicitly said
 * Number/Boolean/String => don't use.

* Exceptions
 * Declare exceptions with @throws in documentation.
 * Errors should not have a @throws declaration.
 * Prefer to not use exceptions.

Iteration:
 * Core should use for loops for iteration as much as possible.
 * Other modules may decide.
