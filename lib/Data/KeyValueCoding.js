/**
 * @file
 *
 * A KeyValueCoding interface implementation.
 *
 *
 * KeyValueCoding  (KVC)  is  a   way  for  accessing  values  in  nested
 * hierarchies of objects. Its main purpose is to simplify the writing of
 * views for displaying model data.
 *
 * Say we have an object hierarchy that looks like this:
 *
 * var person = {
 *   name : {
 *     first : "Adam",
 *     last : "Bergmark"
 *   },
 *
 *   nationality : "Swedish"
 * };
 *
 * We can make this object into a KVC by specifying that the source class
 * does KVC.
 *
 * After this has been done, we can access values of the object by
 * calling the getValue method on person with a Key Path (KP)
 * representing the path to traverse. For example, if we want to retrieve
 * the person's first name, instead of typing `person.name.first` we type
 * `person.getValue("name.first")`. So far it's not very helpful since
 * the only difference is that we write more code, but if we take into
 * account that all properties should be considered private, the KVC
 * alternative starts to look a little better in
 * comparison. `person.name.first` would then turn into
 * `person.getName().getFirst()` while the KVC call remains the
 * same. See, getValue automatically looks for accessors when getting a
 * value, so to retrieve the name object of the person it would first
 * check for the existance of `getPerson` and other variations of this
 * (namely, isPerson, since it might be a boolean accessors) and if
 * neither exists it finally tries accessing the property without
 * accessors (note that it hasn't been decided if direct property
 * accessing should be allowed by default.) So if we define an accessor,
 * say:
 * `person.name.getFirst = function () { return this.first.reverse() };`
 *  the reversed name would be returned from
 * `person.getValue("name.first")`.
 *
 * `setValue` works in much the same way.
 *
 */
Joose.Module("Cactus.Data", function (m) {
  var EventSubscription = Cactus.Util.EventSubscription;

  var KeyValueCoding = Joose.Class("KeyValueCoding", {
    does : EventSubscription,
    methods : {
      /**
       * @type Hash<KeyPath,KeyPath>
       *
       * Each key of the hash is a key path corresponding to an atomic
       * property of the KVC object. The value under that key is an array of
       * the name of compound properties depending on this atomic property.
       *
       * For instance, there might be a fullName property (the compound)
       * consisting of a firstName and a lastName, this would be represented
       * as `{ firstName : ["fullName"], lastName : ["fullName"] }`.
       *
       * Keep in mind that firstName, lastName and fullName are
       * "properties" directly under the KVC object.
       *
       * So, in practice the previous setup would mean that any time firstName
       * or lastName changes (so that `onValueChanged` is triggered for either
       * of them) there would also be an `onValueChanged` triggered for
       * fullName.
       *
       * This property is commented out since KVC overwrites all properties.
       * It remains here only for documentation purposes.
       */
      // _compounds : {},

      /**
       * @param string keyPath
       */
      onValueChanged : Function.empty,

      /**
       * Gets the value of a key path. The path is traversed.
       *
       * @param string *keyPath
       *   The key path to traverse.
       *   If several arguments are specified, they are concatenated together
       *   with . to form a single key path.
       * @return mixed
       *   The value at the specified key path.
       * @throws Error
       *   If a key path doesn't exist, which means no accessors are defined
       *   and the property is undefined, or if the keyPath name is reserved.
       */
      getValue : function (keyPath) {
        if (keyPath === "value") {
          throw new Error("value is a reserved property name.");
        }
        keyPath = Array.prototype.join.call(arguments, ".");

        var keys = keyPath.split(".");
        var key = keys.shift();
        var value;
        if ("get" + key.capitalize() in this) {
          value = this ["get" + key.capitalize()]();
        } else if (this["is" + key.capitalize()] instanceof Function) {
          // Check existance with instanceof Function since there might
          // be a property named isX (and not a method). This is hardly
          // ever useful in practise but can help debugging.

          value = this ["is" + key.capitalize()]();
        } else if (key in this) {
          value = this [key];
        } else {
          throw new Error("Object not KVC compliant for key: " + key);
        }

        if (keys.length) {
          return value.getValue(keys.join("."));
        }
        return value;
      },
      /**
       * Sets the value of a predefined key path.
       *
       * @param string keyPath
       *   The key path to set the value for.
       * @param mixed value
       *   The value to set. If this value is an Object it should already be a
       *   KVC instance.
       * @throws Error
       *   If an undefined key path is specified, or if the keyPath name is
       *   reserved.
       */
      setValue : function (keyPath, value) {
        if (keyPath === "value") {
          throw new Error("value is a reserved property name.");
        }

        var previousValue = this.getValue(keyPath);

        var keys = keyPath.split(".");
        var key = keys.shift();
        var setterExists = false;

          // If we're not at the leaf of the keyPath.
        if (keys.length) {
          this.getValue(key).setValue(keys.join("."), value);
          return;
        } else if ("set" + key.capitalize() in this) {
          setterExists = true;
          this ["set" + key.capitalize()](value);
        } else if (!(key in this)) {
          throw new Error("Object not KVC compliant for key: " + key);
        }

        if (!setterExists) {
          this[key] = value;
        }

        // Only trigger events if value actually changed.
        if (previousValue !== this.getValue(keyPath)) {
          this.onValueChanged(keyPath);
          this._triggerCompounds(keyPath);
        }

        if (value && value.removeSubscriber /* temp */) {
          if (!this.__keyPathSubscriptions) {
            this.__keyPathSubscriptions = {};
          }
          if (keyPath in this.__keyPathSubscriptions) {
            var o = this.__keyPathSubscriptions[keyPath];
            o.object.removeSubscriber(o.id, "ValueChanged");
          }
          var that = this;
          this.__keyPathSubscriptions[keyPath] = {
            id : value.subscribe("ValueChanged", function (_, kp) {
              that.onValueChanged(keyPath + "." + kp);
              that._triggerCompounds(keyPath + "." + kp);
            }),
            object : value
          };
        }
      },
      /**
       * Triggers onchanges for all key paths having the specified key path
       * as a compound.
       *
       * @param string keyPath
       */
      _triggerCompounds : function (keyPath) {
        this._compounds = this._compounds || {};
        if (!(keyPath in this._compounds)) {
          return;
        }

        var compounds = this._compounds[keyPath];
        for (var i = 0; i < compounds.length; i++) {
          this.onValueChanged(compounds[i]);
        }
      },
      /**
       * Checks whether a key path is defined.
       *
       * @param string keyPath
       *   The key path to look for.
       * @return boolean
       *   Whether the key path is defined.
       */
      hasKeyPath : function (keyPath) {
        if (keyPath === "value") {
          throw new Error("value is a reserved property name.");
        }

        var keys = keyPath.split(".");
        var key = keys.shift();

        // If we're not at the leaf of the keyPath.
        if (keys.length) {
          var nextObject;
          try {
            nextObject = this.getValue(key);
          } catch (e) {
            return false;
          }

          if (!(typeof nextObject === "object" &&
                ("hasKeyPath" in nextObject))) {
            return false;
          }
          return nextObject.hasKeyPath(keys.join("."));

        } else if ("get" + key.capitalize() in this) {
          return true;
        } else if (key in this) {
          return true;
        } else {
          return false;
        }
      }
    }
  });
});
