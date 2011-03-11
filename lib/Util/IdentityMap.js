/**
 * @file
 * Keeps track of objects using a custom id that
 * the client specifies.
 *
 * It's simple to use, add objects with add(id, obj), check if an object is
 * added with has(id) and get an object with get(id). Remove with rem(id).
 */
Joose.Module("CactusJuice.Util", function (m) {
  var EventSubscription = CactusJuice.Util.EventSubscription;

  Joose.Class("IdentityMap", {
    does : EventSubscription,
    has : {
      /**
       * @param Hash<string, mixed>
       *   Stored objects.
       */
      objects : { init : function () { return {}; } }
    },
    methods : {
      // Events.
      /**
       * Sent when a new object is added to the id map.
       *
       * @param string key
       *   The key the new object was added under.
       * @param mixed object
       *   The added object.
       */
      onAdded : Function.empty,
      /**
       * @param string key
       *   The key that was removed.
       * @param mixed object
       *   The removed object.
       */
      onRemoved : Function.empty,

      /**
       * Adds an object to the id map.
       *
       * @param string id
       *   The unique id to store the object under.
       * @param mixed obj
       *   The object to store.
       */
      add : function (id, obj) {
        id = String(id);
        if (id in this.objects) {
          if (obj == this.get(id)) {
            throw new Error(
              "The object is already stored under the id=" + id);
          } else {
            throw new Error(
              "Another object is already stored under id=" + id);
          }
        }
        this.objects[id] = obj;
        this.onAdded(id, obj);
      },
      /**
       * Checks whether an object is stored under the id.
       *
       * @param string id
       * @return bool
       */
      has : function (id) {
        return id in this.objects;
      },
      /**
       * Checks whether the id map has an object under a specified id and
       * throws an error if not. Use this only when it would be a client
       * error to not make sure the id exists.
       *
       * @param string id
       */
      _hasStrict : function (id) {
        if (!this.has(id)) {
          throw new Error("IdentityMap:_hasStrict: Non-existant id=%s specified.".format(id));
        }
      },
      /**
       * Fetches the object stored under the specified id. Make sure the
       * id exists before calling.
       *
       * @param string id
       * @return mixed
       */
      get : function (id) {
        this._hasStrict(id);
        return this.objects[id];
      },
      /**
       * @return Array<string id, mixed object>
       *   A hash of all objects stored in the id map, with their keys
       *   as keys of the Hash.
       */
      getAll : function () {
        var objects = [];
        for (var p in this.objects) {
          objects.push(this.objects[p]);
        }
        return objects;
      },
      /**
       * Removes an object from the map. If the object is stored under several
       * keys, all of the keys are removed.
       *
       * @param mixed object
       */
      remove : function (object) {
        var removed = false;
        for (var p in this.objects) {
          if (this.objects[p] === object) {
            delete this.objects[p];
            this.onRemoved(p, object);
            removed = true;
          }
        }
        if (!removed) {
          throw new Error("IdentityMap:remove: Object  %s not in map.".format(object));
        }
      }
    }
  });
});
