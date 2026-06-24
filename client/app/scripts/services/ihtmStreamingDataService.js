/**
 * @ngdoc service
 * @name visArgueClientApp.eventColorizer
 * @description
 * # eventColorizer
 * Factory in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("ihtmStreamingDataService", function(
    $rootScope,
    socketService,
    $timeout,
    $interval
  ) {
    "use strict";

    var subscribed = false;
    var delay = 2000;
    var IHTMUpdateFetcherInterval;
    var running = true;
    var reinserting = false;

    $rootScope.$broadcast("ihtm.streaming.data.start");

    var fetchIHTMUpdate = function() {
      if (!running) {
        console.log("not running, rejecting update request");
        return;
      }
      socketService.send("/preprocessing/ihtm/getUpdate");
    };

    $rootScope.$on("ihtm.streaming.data.start", function() {
      console.log("got start event");
      fetchIHTMUpdate();
      IHTMUpdateFetcherInterval = $interval(fetchIHTMUpdate, 5000);
    });

    $rootScope.$on("ihtm.streaming.data.pause", function() {
      running = false;
      console.log("paused.");
    });

    $rootScope.$on("ihtm.streaming.data.continue", function() {
      running = true;
      console.log("continued.");
      fetchIHTMUpdate();
    });

    $rootScope.$on("ihtm.streaming.data.fetch", function() {
      fetchIHTMUpdate();
    });

    $rootScope.$on("ihtm.streaming.settings.socket.delay", function(
      event,
      data
    ) {
      delay = data;
    });

    $timeout(function() {
      socketService
        .subscribe("/user/preprocessing/ihtm/publishUpdate")
        .then(null, null, function(response) {
          var data = JSON.parse(response.body);
          // cancel the startup timer, if it still running, we don't need it anymore
          $interval.cancel(IHTMUpdateFetcherInterval);

          // node_reinsert is used for reinserted nodes instead of node_start
          // store that fact as a flag, in order to not request an update when node_complete arrives
          if (data.operation === "NODE_REINSERT") {
            reinserting = true;
          }
          // reset the reinsert flag once the update that was actually requested arrives.
          if (data.operation === "NODE_STARTED") {
            reinserting = false;
          }

          // when current node insert is complete, request the next update
          if (data.operation === "NODE_COMPLETE") {
            // don't do anything if the user has clicked pause. restart will happen from the continue method
            // don't do anything if reinserting
            if (running && !reinserting) {
              $timeout(fetchIHTMUpdate, delay);
            }
          }
          $rootScope.$broadcast("ihtm.streaming.data.new", data);
        });
      subscribed = true;
    }, 2000);

    return {
      subscribed: subscribed
    };
  });
