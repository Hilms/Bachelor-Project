/* global angular, d3 */
angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionSelectedMessage", [
    "$rootScope",
    function($rootScope) {
      "use strict";

      var setSelectedMessage = function(msg) {
        $rootScope.$broadcast("selectedMessage", msg);
      };

      var getDefaultClickedMessage = function() {
        var text =
          "<h5>Author:<span class='md-subhead'> Clicked message...</span></h5>";
        return text;
      };

      var getDefaultHoveredMessage = function() {
        var text =
          "<h5>Author:<span class='md-subhead'> Hovered message...</span></h5>";
        return text;
      };

      var getMessage = function(message) {
        if (message !== undefined) {
          var text = "<h5>" + message.author + ": ";
          message.text.forEach(function(data) {
            text +=
              "<span class='md-subhead messageContentInBottomDiv " +
              data.elementClass +
              "'>" +
              data.element +
              "</span>";
          });
          text += "</h5>";
          return text;
        }
      };

      var updateShownMessageText = function(d, description) {
        angular.element("#selectedMessageText").empty();
        var text = "";
        if (description) {
          text += "<h3>PARENT:</h3>";
        } else {
          angular.element("#hoveredMessageText").empty();
        }
        text += getMessage(d);
        angular.element("#selectedMessageText").append(text);
        return text;
      };

      function updateHoveredMessageText(d, description) {
        angular.element("#hoveredMessageText").empty();
        var text = "";
        if (description) {
          text += "<h3>CHILD:</h3>";
        }

        text += getMessage(d);
        angular.element("#hoveredMessageText").append(text);
        return text;
      }

      var updateShownMessageTextParentChild = function(d, description) {
        angular.element("#parentCandidateSummaryView").empty();
        var text = "";
        if (description) {
          text += "<h3>PARENT:</h3>";
        }
        text += getMessage(d);
        angular.element("#parentCandidateSummaryView").append(text);
        return text;
      };

      var updateShownMessageTextParentChild2 = function(d, description) {
        var text = "";
        if (description) {
          text += "<h3>CHILD:</h3>";
        }

        text += getMessage(d);
        angular.element("#parentCandidateSummaryView").append(text);
        return text;
      };

      // Public API here
      return {
        getMessage: getMessage,
        getDefaultClickedMessage: getDefaultClickedMessage,
        getDefaultHoveredMessage: getDefaultHoveredMessage,
        setSelectedMessage: setSelectedMessage,
        updateShownMessageText: updateShownMessageText,
        updateHoveredMessageText: updateHoveredMessageText,
        updateShownMessageTextParentChild: updateShownMessageTextParentChild,
        updateShownMessageTextParentChild2: updateShownMessageTextParentChild2
      };
    }
  ]);
