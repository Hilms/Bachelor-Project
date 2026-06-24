/**
 * Created by Rita on 11.02.16.
 */
angular
  .module("visArgueClientApp")
  .factory("SideBarNamedEntitiesService", function($http, APIURL) {
    "use strict";
    var service = {};

    service.data = {};
    service.exampleCall = function() {
      return $http.get(APIURL + "namedEntitiesSettings/data");
    };
    return service;
  });
