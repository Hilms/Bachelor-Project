/**
 * Created by rita_temp on 03.09.17.
 */
/* global angular, d3*/

angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionMessageSortingFunction", [
    "$rootScope",
    function($rootScope) {
      "use strict";
      // Public API here

      var container;
      var originalYPos;
      var properties;
      var sortedData;

      var currentAttribute;

      var sortAndUpdateView = function(data, attribute) {
        d3.selectAll(".relationPathForest").remove();
        d3.selectAll(".relationPathGivenForest").remove();
        sortedData = sortMessageData(data, attribute);
        sortNodesInForestView(sortedData, container, originalYPos, properties);
      };

      var sortMessageData = function(data, attribute) {
        var originalMessages = data.slice(0);
        currentAttribute = attribute;

        if (attribute === "MESSAGE_LENGTH_ASC") {
          return originalMessages.sort(compareLengthAsc);
        } else if (attribute === "MESSAGE_LENGTH_DESC") {
          return originalMessages.sort(compareLengthDesc);
        } else if (attribute === "TIMESTAMP") {
          return originalMessages.sort(compareTimestamp);
        } else {
          return originalMessages.sort(compare);
        }
      };

      function compare(a, b) {
        if (
          a.categories.indexOf(currentAttribute) > -1 ===
          b.categories.indexOf(currentAttribute) > -1
        ) {
          return a.id - b.id;
        } else if (a.categories.indexOf(currentAttribute) > -1) {
          return -1;
        } else {
          return 1;
        }
      }

      function compareLengthAsc(a, b) {
        if (a.wordCount - b.wordCount === 0) {
          return a.id - b.id;
        } else {
          return a.wordCount - b.wordCount;
        }
      }

      function compareLengthDesc(a, b) {
        if (a.wordCount - b.wordCount === 0) {
          return a.id - b.id;
        } else {
          return b.wordCount - a.wordCount;
        }
      }

      function compareTimestamp(a, b) {
        return parseInt(a.id.split("ID")[1]) - parseInt(b.id.split("ID")[1]);
      }

      var sortNodesInForestView = function(sortedMessages) {
        var t = d3
          .transition()
          .duration(700)
          .delay(500);

        sortedMessages.forEach(function(d, i) {
          var currentx = d3.transform(
            container.select("#messageCircleGForest" + d.id).attr("transform")
          ).translate[0];
          container
            .select("#messageCircleGForest" + d.id)
            .transition(t)
            .attr("transform", function() {
              originalYPos[d.id] =
                properties.yStart +
                i * properties.nodeHeight +
                properties.nodePadding;
              return (
                "translate(" +
                currentx +
                "," +
                (properties.yStart +
                  i * properties.nodeHeight +
                  properties.nodePadding) +
                ")"
              );
            });
        });

        $rootScope.$broadcast("originalTree", { sorting: true });
        $rootScope.$broadcast("transitionNotActive", true);
        $rootScope.$broadcast("parentChildSpaceInvisible", true);
      };

      var setContainer = function(cont) {
        container = cont;
      };

      var setYPos = function(yPos) {
        originalYPos = yPos;
      };

      var setProperties = function(props) {
        properties = props;
      };

      var getSortedMessages = function() {
        return sortedData;
      };

      return {
        sortAndUpdateView: sortAndUpdateView,
        setContainer: setContainer,
        setYPos: setYPos,
        setProperties: setProperties,
        getSortedMessages: getSortedMessages
      };
    }
  ]);
