/*global hsluv */
/**
 * @ngdoc service
 * @name visArgueClientApp.EventColorizerHUSL
 * @description This service is not intended to be used directly. Instead, use the EventColorizerFacade.
 *
 */
angular.module("visArgueClientApp").factory("EventColorizerHUSL", function() {
  "use strict";
  // Service logic

  //PRIVATE FUNCTIONS
  var getHex = function(hue, saturation, lightness) {
    return hsluv.hsluvToHex([hue, saturation, lightness]);
  };

  //some settings
  var saturation = 100,
    lightness = 71;

  /**
   * Returns a color with maximum distance based on the number of all colors
   * @param {int} numberOfEvents the total number of events
   * @param {int} curIndex the current index
   */
  var getRedistributeColor = function(numberOfEvents, curIndex) {
    var hue = ((360 / numberOfEvents) * curIndex) % 360;
    return getHex(hue, saturation, lightness);
  };

  /**
   * Returns a random color from the HUSL color space
   * @return {String} color in HEX
   */
  var getRandomColor = function() {
    return getHex(Math.floor(Math.random() * 360), saturation, lightness);
  };

  var getStrategy = function() {
    return "husl";
  };

  // Public API here
  return {
    getRandomColor: getRandomColor,
    getRedistributeColor: getRedistributeColor,
    getStrategy: getStrategy
  };
});
