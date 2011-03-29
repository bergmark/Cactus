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

