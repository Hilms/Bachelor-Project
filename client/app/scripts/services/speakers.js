angular.module("visArgueClientApp").factory("speakerService", function() {
  "use strict";
  //
  var iconMap = {
    contra: "images/contra.png",
    neutral: "images/neutral.png",
    pro: "images/pro.png",
    unknown: "images/unknown.png",
    republican: "images/republican.png",
    moderator: "images/moderator.png",
    democrat: "images/democrat.png"
  };

  var getIcon = function(icon) {
    if (icon === undefined) {
      return undefined;
    }
    icon = icon.replace("images/", "");
    icon = icon.replace(".png", "");
    return iconMap[icon];
  };

  var color = {};

  var getColor = function(speaker) {
    if (speaker.id === undefined) {
      return;
    }

    if (color[speaker.id] === undefined) {
      if (speaker.color === undefined) {
        speaker.color = "black";
      }
      color[speaker.id] = speaker.color;
    }
    return color[speaker.id];
  };

  var setColor = function(speaker, c) {
    color[speaker.id] = c;
    speaker.color = c;
  };

  var getData = function() {
    return color;
  };

  return {
    getColor: getColor,
    setColor: setColor,
    getData: getData,
    getIcon: getIcon
  };
});
