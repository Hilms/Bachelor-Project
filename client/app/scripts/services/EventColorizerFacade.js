/**
 * @ngdoc service
 * @name visArgueClientApp.EventColorizerFacade
 * @description This facade provides categorical colors.
 */
angular
  .module("visArgueClientApp")
  .factory("EventColorizerFacade", function(
    $localStorage,
    EventColorizerHUSL,
    EventColorizerD3Cat
  ) {
    "use strict";
    // Service logic

    //PRIVATE FUNCTIONS
    //default this.strategy
    var strategy = EventColorizerD3Cat;

    /**
     * From: http://jsfiddle.net/subodhghulaxe/t568u/
     */
    var convertHex = function(hex, opacity) {
      if (opacity === undefined) {
        opacity = 1;
      }
      hex = hex.replace("#", "");
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);

      return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
    };

    //some variables we need
    $localStorage.$default({
      alignmentcolors: {
        numberOfEvents: 0,
        eventsToColors: {},
        curIndex: 0
      }
    });

    var clear = function() {
      $localStorage.alignmentcolors.numberOfEvents = 0;
      $localStorage.alignmentcolors.eventsToColors = {};
      $localStorage.alignmentcolors.curIndex = 0;
    };

    /**
     * This function will return a color for an event
     */
    var getColor = function(eventId) {
      if (eventId.indexOf("null") > -1) {
        return "#000";
      }
      if ($localStorage.alignmentcolors.eventsToColors[eventId] === undefined) {
        //now we need to define a new color
        if ($localStorage.alignmentcolors.numberOfEvents === 0) {
          //since we don't know in advance how many colors we need to distribute
          //we just randomly generate colors
          $localStorage.alignmentcolors.eventsToColors[
            eventId
          ] = strategy.getRandomColor();
        } else {
          //as we know how many colors we will distribute we can distribute them evenly
          //so that each color has a maximum distance
          $localStorage.alignmentcolors.eventsToColors[
            eventId
          ] = strategy.getRedistributeColor(
            $localStorage.alignmentcolors.numberOfEvents,
            $localStorage.alignmentcolors.curIndex
          );
          $localStorage.alignmentcolors.curIndex++;
        }
      }

      return $localStorage.alignmentcolors.eventsToColors[eventId];
    };

    /**
     * Sets the numbers of events
     */
    var setNumberOfEvents = function(num) {
      $localStorage.alignmentcolors.numberOfEvents = Math.max(parseInt(num), 0);
    };

    /**
     * Sets the color for an event
     */
    var setColor = function(eventId, color) {
      $localStorage.alignmentcolors.eventsToColors[eventId] = color;
    };

    /**
     * Redistributes the colors and set them with a maximum distance to each other
     */
    var redistributeColors = function() {
      var i = 0;
      for (var key in $localStorage.alignmentcolors.eventsToColors) {
        if ($localStorage.alignmentcolors.eventsToColors.hasOwnProperty(key)) {
          i++;
        }
      }
      $localStorage.alignmentcolors.numberOfEvents = i;
      $localStorage.alignmentcolors.curIndex = 0;
      for (key in $localStorage.alignmentcolors.eventsToColors) {
        if ($localStorage.alignmentcolors.eventsToColors.hasOwnProperty(key)) {
          $localStorage.alignmentcolors.eventsToColors[
            key
          ] = strategy.getRedistributeColor(
            $localStorage.alignmentcolors.numberOfEvents,
            $localStorage.alignmentcolors.curIndex
          );
          $localStorage.alignmentcolors.curIndex++;
        }
      }
    };

    var getData = function() {
      return $localStorage.alignmentcolors.eventsToColors;
    };

    var getRGBa = function(hex, opacity) {
      return convertHex(hex, opacity);
    };

    //simply delegate
    var getRedistribute = function(numberOfEvents, curIndex) {
      return strategy.getRedistributeColor(numberOfEvents, curIndex);
    };

    var getStrategy = function() {
      return strategy.getStrategy();
    };

    var setStrategy = function(stratName) {
      if (stratName === "d3") {
        strategy = EventColorizerD3Cat;
      } else if (stratName === "husl") {
        strategy = EventColorizerHUSL;
      } else {
        throw "I don't know this strategy";
      }
      return true;
    };

    // Public API here
    return {
      getColor: getColor,
      setColor: setColor,
      setNumberOfEvents: setNumberOfEvents,
      redistributeColors: redistributeColors,
      getData: getData,
      getRGBa: getRGBa,
      clear: clear,
      getRedistribute: getRedistribute,
      getStrategy: getStrategy,
      setStrategy: setStrategy
    };
  });
