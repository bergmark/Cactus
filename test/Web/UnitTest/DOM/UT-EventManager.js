Cactus.UnitTest.DOM.EventManager = function () {
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var Test = Cactus.Dev.UnitTest.Test;
  var EventManager = CactusJuice.Web.DOM.EventManager;
  var Events = CactusJuice.Web.DOM.Events;
  var tag = CactusJuice.Web.DOM.tag;
  var EventSubscription = CactusJuice.Util.EventSubscription;

  var tc = new TestCase("DOM.EventManager");

  tc.add(function () {
    var em = new EventManager();
    var divFoo = tag("div", { id : "foo" });
    var divBar = tag("div", { id : "bar" });

    var fooTriggered = false;
    var barTriggered = false;

    // Add events.
    em.add(divFoo, "click", function () {
      fooTriggered = true;
    });

    divFoo.onclick();
    this.assert(fooTriggered);
    em.add(divBar, "click", function () {
      barTriggered = true;
    });


    // Detach all subscribed events.
    em.detach();
    fooTriggered = false;
    barTriggered = false;
    divFoo.onclick();
    divBar.onclick();
    this.assertFalse(fooTriggered, "Foo was triggered.");
    this.assertFalse(barTriggered, "Bar was triggered.");
  });

  // Also support EventSubscription.
  tc.add(function() {
    var em = new EventManager();
    var es = new EventSubscription();
    es.onFoo = Function.empty;
    var fooTriggered = false;
    em.add(es, "Foo", function () {
      fooTriggered = true;
    });

    this.assertFalse(es.events instanceof Events,
                     "Instantiated DOM.Events.");

    es.onFoo();
    this.assert(fooTriggered);

    fooTriggered = false;
    em.detach();
    es.onFoo();
    this.assertFalse(fooTriggered);
  });

  return [tc];
};
