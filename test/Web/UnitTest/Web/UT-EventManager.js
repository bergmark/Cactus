Cactus.UnitTest.Web.EventManager = function () {
  var TestCase = Cactus.Dev.UnitTest.TestCase;
  var Test = Cactus.Dev.UnitTest.Test;
  var EventManager = Cactus.Web.EventManager;
  var Events = Cactus.Web.Events;
  var tag = Cactus.Web.tag;
  var EventSubscription = Cactus.Util.EventSubscription;

  var tc = new TestCase("Web.EventManager");

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
    var ES = Joose.Class("ES", { does : EventSubscription });
    var es = new ES();
    es.onFoo = Function.empty;
    var fooTriggered = false;
    em.add(es, "Foo", function () {
      fooTriggered = true;
    });

    this.assertFalse(es.events instanceof Events,
                     "Instantiated Web.Events.");

    es.onFoo();
    this.assert(fooTriggered);

    fooTriggered = false;
    em.detach();
    es.onFoo();
    this.assertFalse(fooTriggered);
  });

  return [tc];
};
