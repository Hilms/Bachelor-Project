angular.module("visArgueClientApp").factory("AlignmentEvents", function() {
  "use strict";
  var events = []; //the events are listed by their features

  var add = function(eventId, feature, name) {
    var foundFeature = false;
    events.forEach(function(f) {
      if (f.name === feature) {
        foundFeature = f;
        return;
      }
    });
    if (foundFeature === false) {
      var newf = [];
      newf.push({ eventId: eventId, name: name });
      events.push({ name: feature, events: newf });
    } else {
      var foundEvent = false;
      foundFeature.events.forEach(function(e) {
        if (e.eventId === eventId) {
          foundEvent = e;
          return;
        }
      });
      if (foundEvent === false) {
        foundFeature.events.push({ eventId: eventId, name: name });
      }
    }
  };

  var clear = function() {
    events = [];
  };

  var getData = function() {
    return events;
  };

  // Public API here
  return {
    add: add,
    getData: getData,
    clear: clear
  };
});
