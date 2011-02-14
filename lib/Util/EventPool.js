require('Task/Joose/NodeJS');
/**
 * @file
 * EventPool is designed to be a centralized object taking care of event
 * handling.
 * At some global point in your code space you can create an event pool and
 * components should then be able to retrieve the reference to it. A component
 * can then create events and add subscriptions for events that other components
 * send out.
 * EventPool implements EventSubscription so subscribers can use that interface.
 * Additionally there is a createEvent method that components use to add new
 * events.
 */
Joose.Module("CactusJuice.Util", function (m) {
  var EventSubscription = CactusJuice.Util.EventSubscription;
  var Collection = CactusJuice.Data.Collection;

  Joose.Class("EventPool", {
    does : EventSubscription,
    methods : {
      /**
       * @param String eventName
       *   The name of a new event to be created.
       *   There may not exist an event by this name already.
       *   The event name should not have the "on"-prefix.
       * @param optional Object owner = null
       *   The object that owns the event, it will receive the same
       *   onEventName method that the pool has.
       */
      createEvent : function (eventName, owner) {
        if (this.implementsEvent(eventName)) {
          throw new Error("EventPool:createEvent: Event with name %s already exists.".format(eventName));
        }
        this["on" + eventName] = Function.empty;
        if (owner) {
          // Add an onEventName method relaying to pool.onEventName.
          owner["on" + eventName] = function (self) {
            var args = Collection.slice(arguments, 1);
            self["on" + eventName].apply(self, args);
          }.curry(this);
        }
      }
    }
  });
});
