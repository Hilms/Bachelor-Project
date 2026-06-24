/**
 * @ngdoc service
 * @name visArgueClientApp.eventColorizer
 * @description
 * # eventColorizer
 * Factory in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("VersionService", function(APIURL, $http, $q) {
    "use strict";
    var data = {};
    data.client = {};
    data.server = {};

    var deferred = {};
    deferred.server = $q.defer();
    deferred.client = $q.defer();

    // Service logic
    $http
      .get(APIURL + "version")
      .then(function(response) {
        data.server = response.data;
        deferred.server.resolve(data.server);
      })
      .catch(function(response) {
        console.error(
          "Could not query server version:",
          response.status,
          response.statusText
        );
      });

    $http
      .get("/VERSION.json")
      .then(function(response) {
        data.client = response.data;
        deferred.client.resolve(data.client);
      })
      .catch(function() {
        data.client = {};
        data.client.hostname = "localhost";
        data.client.environment = "development";
        deferred.client.resolve(data.client);
      });

    var serverInformation = function() {
      return deferred.server.promise;
    };

    var clientInformation = function() {
      return deferred.client.promise;
    };

    // Public API here
    return {
      serverInformation: serverInformation,
      clientInformation: clientInformation
    };
  });
