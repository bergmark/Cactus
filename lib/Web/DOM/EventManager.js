require('Task/Joose/NodeJS');
/**
 * @file
 *
 * Keeps track of events added to objects and allows the client to detach all
 * of them. Useful when a module subscribes to a lot of events and needs to
 * free any references.
 *
 * EventManager supports both the Util.EventSubscription and DOM.Events
 * interfaces. They may be mixed in the same instance.
 *
 * Instantiate the EventManager and then add objects using
 * `eventManager.add(object, eventName, callback)` and remove all of them with
 * `eventManager.detach()`. After a detach, the EventManager instance is back
 * at no subscriptions and may be used like it was new.
 */
Joose.Module("CactusJuice.Web.DOM", function (m) {
  var Events = CactusJuice.Web.DOM.Events;
  var EventSubscription = CactusJuice.Util.EventSubscription;

  /**
   * Stores information about a single added event.
   *
   * @param EventSubscription/HTMLElement object
   *   The object the event was added to.
   * @param string eventName
   *   The name of the event, such as "click".
   */
  function Subscription(object, eventName) {
    this.object = object;
    this.eventName = eventName;
  } Subscription.prototype = {
    /**
     * @type ID
     */
    id : null,
    /**
     * @type EventSubscription/HTMLElement
     */
    object : null,
    /**
     * @type string
     */
    eventName : "",
    /**
     * @return ID
     */
    getId : function () {
      return this.id;
    },
    /**
     * @return HTMLElement
     */
    getObject : function () {
      return this.object;
    },
    /**
     * @return string
     */
    getEventName : function () {
      return this.eventName;
    },
    /**
     * @override
     */
    remove : function () {
      // .
    }
  };
  Subscription.create = function (object, eventName, callback) {
    if (EventSubscription.implementsInterface(object)) {
      return new ESSubscription(object, eventName, callback);
    } else {
      return new EventsSubscription(object, eventName, callback);
    }
  };

  function ESSubscription(object, eventName, callback) {
    Subscription.apply(this, arguments);
    this.id = object.subscribe(eventName, callback);
  } ESSubscription.prototype = {
    remove : function () {
      this.getObject().removeSubscriber(this.getId(),
                                        this.getEventName());
    }
  };
  ESSubscription.extend(Subscription);

  function EventsSubscription(object, eventName, callback) {
    Subscription.apply(this, arguments);
    this.id = Events.add(object, eventName, callback);

  } EventsSubscription.prototype = {
    remove : function () {
      Events.del(this.getObject(), this.getEventName(), this.getId());
    }
  };
  EventsSubscription.extend(Subscription);


  function EventManager() {
    this.attachedEvents = [];
  } EventManager.prototype = {
    /**
     * @type Array<Subscription>
     */
    attachedEvents : [],
    /**
     * Adds an event and saves the subscription information.
     *
     * @param HTMLElement element
     * @param string eventName
     * @param Function callback
     */
    add : function (element, eventName, callback) {
      this.attachedEvents.push(
        Subscription.create(element, eventName, callback));
    },
    /**
     * Removes all events that were added through the event manager.
     */
    detach : function () {
      while (subscription = this.attachedEvents.pop()) {
        subscription.remove();
      }
    }
  };

  m.EventManager = EventManager;
});
