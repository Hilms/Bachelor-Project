/**
 * @ngdoc service
 * @name visArgueClientApp.eventColorizer
 * @description
 * # eventColorizer
 * Factory in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("alertService", function($mdToast, $mdDialog) {
    "use strict";
    // Service logic
    var position = "top";
    var timeout = 10000;

    function showToast(msg) {
      $mdToast.show(
        $mdToast
          .simple()
          .textContent(msg)
          .action("OK")
          .highlightAction(false)
          .position(position)
          .hideDelay(timeout)
      );
    }

    function showDialog(title, msg) {
      $mdDialog.show(
        $mdDialog
          .alert()
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title(title)
          .htmlContent(msg)
          .ariaLabel("Alert Dialog Demo")
          .ok("OK")
      );
    }

    function showExceptionDialog(ex) {
      function DialogController($scope, $mdDialog, ex) {
        $scope.ex = ex;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        };
      }

      $mdDialog.show({
        parent: angular.element(document.body),
        templateUrl: "html-templates/exception-dialog.html",
        locals: {
          ex: ex
        },
        controller: DialogController
      });
    }

    var success = function(msg) {
      showToast("Success: " + msg);
    };

    var error = function(msg, full) {
      if (full === true) {
        showDialog("Error!", msg);
      } else {
        showToast("Error: " + msg);
      }
    };

    var exception = function(ex) {
      showExceptionDialog(ex);
    };

    var dialog = function(title, msg) {
      showDialog(title, msg);
    };

    // Public API here
    return {
      success: success,
      error: error,
      exception: exception,
      dialog: dialog
    };
  });
