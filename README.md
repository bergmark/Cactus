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

 * Functions that may return null, or variables that may contain null
   as well as the intended type should be suffixed with maybe.
   `var userMaybe = getUserMaybe();`.

 * Boolean names should have a predicate prefix. `hasUser` and
   `isAdmin`.

 * Use hungarian notation instead of constraining a value's type
   implicitly. Use `plainPassword` and `hashedPassword` over
   `password`.

Don't use these constructs:

 * `with`. Confusing. Instead do `var o = longName; o.x = 1;`.

 * `new Boolean`/`new String`/`new Number`, messes up `typeof` and comparisons.

 * `typeof x === "object"`, since `typeof null => "object"`, use `instanceof` instead.

 * `[new] Array()`. `new Array(1)` vs `new Array(1,2)` is
   confusing. `[1]`, `[1,2]` is not. And `[]` is more concise.

 * `[new] Object()`. `{}` is more concise.

Types in documentation

 * primitive types (number, boolean, string) => as is
 * an instance of class C => C
 * an implementer of a role R => R
 * collection => numbered by indices 0..length-1, has length property
 * hash => Object with properties that may contain different values
 * map => Object where each property has the same type
 * entity => any value that can be compared with ===
 * Object => any non-primitive value
 * null/undefined is never allowed for any type unless explicitly stated in documentation.
 * Number/Boolean/String => don't use.

* Exceptions
 * Declare exceptions with @throws in documentation.
 * Errors should not have a @throws declaration.
 * Prefer to not use exceptions.

Iteration:
 * Core should use for loops for iteration as much as possible.
 * Other modules may decide.
