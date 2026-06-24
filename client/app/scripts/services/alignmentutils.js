/*global $*/

angular
  .module("visArgueClientApp")
  .factory("alignmentUtils", function($mdDialog) {
    "use strict";

    var addClass = function(id, cls) {
      var oldclasses = $(id).attr("class");
      if (oldclasses !== undefined && oldclasses.indexOf(cls) === -1) {
        $(id).attr("class", oldclasses + " " + cls);
      }
    };

    var removeClass = function(id, cls) {
      var oldclasses = $(id).attr("class");
      if (oldclasses !== undefined) {
        $(id).attr(
          "class",
          oldclasses
            .replace(cls, "")
            .replace(/\s\s+/g, " ")
            .trim()
        );
      }
    };

    var highlightEvent = function(event) {
      setTimeout(function() {
        $("#alignmentchart")
          .find("circle.event")
          .css("opacity", 0.2);

        $("#alignmentchart")
          .find('circle.event[data-characteristic="' + event.eventId + '"]')
          .css("opacity", 1);
      }, 10);

      //			$('circle.event')
      //				.css('opacity', 0.2);
      $("#alignmentchart")
        .find("circle.event")
        .css("opacity", 0.2);

      $("#alignmentchart")
        .find('circle.event[data-characteristic="' + event.eventId + '"]')
        .css("opacity", 1);
    };

    var unhighlightEvent = function() {
      $("#alignmentchart")
        .find("circle.event")
        .css("opacity", 1);
    };

    var highlightAlignment = function(patternId) {
      if (patternId !== null && typeof patternId === "object") {
        patternId = patternId.patternId;
      }

      addClass(
        'line.alignment[data-pattern-id="' + patternId + '"]',
        "highlighted"
      );

      $("circle.event").css("opacity", 0.2);

      $('circle.event[data-alignments~="pattern-' + patternId + '"]').css(
        "opacity",
        1
      );
    };

    var unHiglightAlignment = function() {
      removeClass("line.alignment", "highlighted");

      $("circle.event").css("opacity", 1);
    };

    var highlightRepetition = function(patternId) {
      if (patternId !== null && typeof patternId === "object") {
        patternId = patternId.patternId;
      }

      addClass(
        'line.repetition[data-pattern-id="' + patternId + '"]',
        "highlighted"
      );

      $("circle.event").css("opacity", 0.2);

      $('circle.event[data-repetitions~="pattern-' + patternId + '"]').css(
        "opacity",
        1
      );
    };

    var unHiglightRepetition = function() {
      removeClass("line.repetition", "highlighted");

      $("circle.event").css("opacity", 1);
    };

    var getUtterances = function(obj) {
      $mdDialog.show({
        controller: "AlignmentTextCtrl",
        controllerAs: "ctrl",
        templateUrl: "html-templates/alignment.text.dialog.html",
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        fullscreen: true,
        locals: {
          utterances: obj.utterances,
          pattern: obj.pattern
        }
      });
    };

    // Public API here
    return {
      highlightEvent: highlightEvent,
      unHighlightEvent: unhighlightEvent,
      highlightAlignment: highlightAlignment,
      unHighlightAlignment: unHiglightAlignment,
      highlightRepetition: highlightRepetition,
      unHighlightRepetition: unHiglightRepetition,
      getUtterances: getUtterances
    };
  });
