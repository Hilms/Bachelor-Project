angular
  .module("visArgueClientApp")
  .factory("SideBarService", function($rootScope, $mdSidenav, $state) {
    "use strict";

    var toggleSettings = function() {
      $rootScope.$broadcast("visargue.sidebar.opening");
      return $mdSidenav("sidebar-settings").toggle();
    };

    var toggleDetails = function() {
      $mdSidenav("sidebar-details").toggle();
    };

    var hasSettings = function() {
      return (
        $state.current.views !== undefined &&
        $state.current.views !== null &&
        $state.current.views["sidebar-settings"] !== undefined
      );
    };

    var hasDetails = function() {
      return (
        $state.current.views !== undefined &&
        $state.current.views !== null &&
        $state.current.views["sidebar-details"] !== undefined
      );
    };

    return {
      toggleSettings: toggleSettings,
      toggleDetails: toggleDetails,
      hasSettings: hasSettings,
      hasDetails: hasDetails
    };
  });
