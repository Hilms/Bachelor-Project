/**
 * Created by anton on 2/22/17.
 */
/**
 * socketjs service with a stomp protocol
 */
angular
  .module("visArgueClientApp")
  .factory("socketService", function(APIURL, $stomp, $cookies, $rootScope, $q) {
    "use strict";

    var _self = this;

    var name = "visargue";

    /**
     * Internal variable to see if we are connected to the websocket
     * @type {boolean}
     */
    _self.isConnected = false;

    /**
     * Internal method that provides a promise in either case.
     * If there is already a connection to the websocket it will just return the promise, otherwise it will connect and then return the promise.
     * The promise maybe rejected when the user is not logged in.
     * @returns {Function} the promise
     */
    var connect = function() {
      var defer = $q.defer();

      if (_self.isConnected) {
        defer.resolve("is already connected");
        return defer.promise;
      }

      if (!$rootScope.isLoggedIn()) {
        defer.reject(
          "Cannot connect to a websocket when the user is not logged in"
        );
      }

      var token = $cookies.get("authToken");
      var connectHeaders = {};
      //retrieve token and send it as a stomp header
      if ($cookies.get("authToken")) {
        connectHeaders["X-Auth-Token"] = token.slice(1, -1);
      }

      _self.isConnecting = true;

      $stomp
        .connect(name, APIURL + "test/hello", connectHeaders)
        .then(function() {
          _self.isConnected = true;
          defer.resolve("connected");
        })
        .catch(function(reason) {
          _self.isConnected = false;
          defer.reject("something went wrong " + reason);
        });

      return defer.promise;
    };

    /**
     * Subscribe to a destination, will connect automatically to the websocket if the connection is not already established.
     * @param {String} destination
     * @returns {Function} a promise with a notifier callback
     */
    var subscribe = function(destination) {
      var deferred = $q.defer();

      connect().then(function() {
        return $stomp
          .subscribe(name, destination)
          .then(null, null, function(message) {
            //console.log(destination, message);
            deferred.notify(message);
          });
      });

      return deferred.promise;
    };

    /**
     * Unsubscribes from a given destination
     * @param {String} destination
     * @returns {Function} a promise
     */
    var unsubscribe = function(destination) {
      return $stomp.unsubscribe(name, destination);
    };

    /**
     * Disconnects from the websocket
     * @returns {void|*} a promise
     */
    var disconnect = function() {
      _self.isConnected = false;
      return $stomp.disconnect(name);
    };

    /**
     * Will send a message to the given destination with the given payload.
     * @param {String} destination
     * @param {String} payload
     */
    var send = function(destination, payload) {
      $stomp.send(name, destination, payload);
    };

    /**
     * The actual service interface.
     */
    return {
      disconnect: disconnect,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      send: send
    };
  });
