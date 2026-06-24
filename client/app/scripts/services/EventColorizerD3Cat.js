/**
 * @ngdoc service
 * @name visArgueClientApp.EventColorizerD3Cat
 * @description This service is not intended to be used directly. Instead, use the EventColorizerFacade.
 *
 */
angular.module("visArgueClientApp").factory("EventColorizerD3Cat", function() {
  "use strict";

  //PRIVATE FUNCTIONS
  var colorSpace = d3.scale.category20();

  /**
   * Returns a color with maximum distance based on the number of all colors
   * @param {int} numberOfEvents the total number of events
   * @param {int} curIndex the current index
   */
  var getRedistributeColor = function(numberOfEvents, curIndex) {
    return colorSpace(curIndex);
  };

  /**
   * Returns a random color from the HUSL color space
   * @return {String} color in HEX
   */
  var getRandomColor = function() {
    return colorSpace(Math.floor(Math.random() * 20));
  };

  var getStrategy = function() {
    return "d3";
  };

  // Public API here
  return {
    getRandomColor: getRandomColor,
    getRedistributeColor: getRedistributeColor,
    getStrategy: getStrategy
  };
});
