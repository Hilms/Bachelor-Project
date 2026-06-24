//TODO: add $localStorage to make sorting persistent

var abstractSorter = function() {
  "use strict";

  // Data structure
  var items = [];
  //var reversedIndex = {};

  // Service logic
  var clear = function() {
    items = [];
    //		reversedIndex = {};
  };

  var isInItems = function(item) {
    var isInItems = false;
    items.forEach(function(i) {
      if (i.name === item) {
        isInItems = true;
        return true;
      }
    });
    return isInItems;
  };

  var add = function(item) {
    if (!isInItems(item)) {
      items.push({ name: item });
    }
  };

  var getPos = function(item) {
    var pos = -1;
    items.forEach(function(d, i) {
      if (d.name === item) {
        pos = i;
        return true;
      }
    });
    if (pos === -1) {
      add(item);
      return getPos(item);
    }
    return pos;
  };

  var getSortedFeatures = function(featureSubset) {
    var ret = [];
    items.forEach(function(f) {
      if (featureSubset.indexOf(f.name) > -1) {
        ret.push(f.name);
      }
    });
    return ret;
  };

  var getData = function() {
    return items;
  };

  // Public API here
  return {
    getData: getData,
    getPos: getPos,
    getSortedFeatures: getSortedFeatures,
    clear: clear
  };
};

/**
 * @ngdoc service
 * @name visArgueClientApp.featureSorter
 * @description
 * # featureSorter
 * Service in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("featureSorter", abstractSorter)
  .factory("sequenceSorter", abstractSorter);
