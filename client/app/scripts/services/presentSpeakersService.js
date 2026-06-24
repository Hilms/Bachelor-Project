/**
 * Created by Rita on 11.02.16.
 */
angular
  .module("visArgueClientApp")
  .factory("PresentSpeakersService", function($http, APIURL) {
    "use strict";
    var service = {};

    service.data = {};
    service.exampleCall = function() {
      return $http.get(APIURL + "presentSpeakers");
    };
    return service;
  });
