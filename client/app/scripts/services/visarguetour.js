/**
 * @ngdoc service
 * @name visArgueClientApp.VisArgueTour
 * @description
 * # VisArgueTour
 * Factory in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("VisArgueTour", function(
    ngIntroService,
    $timeout,
    $localStorage,
    $rootScope
  ) {
    "use strict";
    var currentTourName = null;

    $rootScope.$on("$stateChangeStart", function() {
      currentTourName = null;
    });

    $localStorage.$default({
      visarguetour: {
        tours: {}
      }
    });

    var firstStep = {
      element: "#globalhelp",
      intro: "You can always restart this tour by clicking me!",
      position: "left"
    };

    var introOptions = {
      steps: [],
      showStepNumbers: false,
      showBullets: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: '<md-icon class="material-icons">navigate_next</md-icon>',
      prevLabel: '<md-icon class="material-icons">navigate_before</md-icon>',
      skipLabel: "Exit",
      doneLabel: "Thanks"
    };

    var cbExitAndThanks = function() {
      $localStorage.visarguetour.tours[currentTourName].seen = true;
    };

    var getStepIndex = function(elemId) {
      var steps = $localStorage.visarguetour.tours[currentTourName].steps;
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].element === "#" + elemId) {
          return i;
        }
      }
      return -1;
    };

    var getCurrentStep = function() {
      return $localStorage.visarguetour.tours[currentTourName].steps[
        $localStorage.visarguetour.tours[currentTourName].currentStep
      ];
    };

    ngIntroService.onChange(function(elem) {
      var stepIndex = getStepIndex(elem.id);
      if (stepIndex > -1) {
        $localStorage.visarguetour.tours[
          currentTourName
        ].currentStep = stepIndex;
      }
    });

    ngIntroService.onAfterChange(function() {
      var skipbutton = $(".introjs-skipbutton");
      skipbutton.addClass("md-raised md-button md-ink-ripple");

      var nextbutton = $(".introjs-nextbutton");
      nextbutton.addClass(
        "md-icon-button md-button md-raised md-ink-ripple md-primary"
      );
      if (nextbutton.hasClass("introjs-disabled")) {
        nextbutton.attr("disabled", "disabled");
      } else {
        nextbutton.removeAttr("disabled");
      }

      var prevbutton = $(".introjs-prevbutton");
      prevbutton.addClass(
        "md-icon-button md-button md-raised md-ink-ripple md-primary"
      );
      if (prevbutton.hasClass("introjs-disabled")) {
        prevbutton.attr("disabled", "disabled");
      } else {
        prevbutton.removeAttr("disabled");
      }

      //inject callback:
      var step = getCurrentStep();

      if (step.doThis !== undefined) {
        $timeout(function() {
          step.doThis();
          ngIntroService.refresh();
        }, 5);
      }
    });

    ngIntroService.onExit(cbExitAndThanks);
    ngIntroService.onComplete(cbExitAndThanks);

    //methods
    /**
     * Set the steps for the tour:
     * <pre>
     *     [
     *      {
     *        element: '#idOfTargetElement',
     *        intro: 'text of the tour',
     *        position: 'position of the popover: left, right, top, bottom',
     *        doThis: function() {
     *          execute some stuff once the tooltip is opened
     *        }
     *      },
     *      ...
     *     ]
     * </pre>
     * @param {string} tourname the name of the tour
     * @param {[*]} newsteps the steps
     */
    var setSteps = function(tourname, newsteps) {
      currentTourName = tourname;
      $localStorage.visarguetour.tours[tourname] =
        $localStorage.visarguetour.tours[tourname] || {};
      newsteps.unshift(firstStep);
      $localStorage.visarguetour.tours[tourname].steps = newsteps;
      $localStorage.visarguetour.tours[tourname].currentStep = 0;
    };

    /**
     * Starts the tour. Typically you want to use the autostart method.
     * @param {string} tourname the name of the tour
     * @param {number} delay the delay in ms
     */
    var start = function(tourname, delay) {
      currentTourName = tourname;
      delay = delay || 1000;
      //inject steps:
      introOptions.steps = $localStorage.visarguetour.tours[tourname].steps;
      if (
        introOptions.steps === undefined ||
        introOptions.steps === null ||
        introOptions.steps === []
      ) {
        throw "No steps were defined, call setSteps before!";
      }
      ngIntroService.setOptions(introOptions);
      $timeout(function() {
        ngIntroService.start();
      }, delay);
    };

    /**
     * Continues the current tour, this is being used by the help button in the top right corner of the UI.
     */
    var continueCurrentTour = function() {
      if (currentTourName !== null) {
        var curStep =
          $localStorage.visarguetour.tours[currentTourName].currentStep || 0;
        ngIntroService.goToStepNumber(curStep);
        start(currentTourName, 1);
      }
    };

    /**
     * Starts the tour if the user did not already see it. Can be overridden by the force parameter
     * @param {string} tourname the name of the tour, must be the same as in the methods setSteps
     * @param {number} delay a delay in ms, default is 1000
     * @param {boolean} force if this is true the tour will be started even if the user has seen it already (not recommended for production)
     */
    var autostart = function(tourname, delay, force) {
      currentTourName = tourname;
      delay = delay || 1000;
      force = force || false;
      var seen = $localStorage.visarguetour.tours[tourname].seen || false;
      if (force || !seen) {
        angular.element(document).ready(function() {
          start(tourname, delay);
        });
      }
    };

    /**
     * Returns the name of the current tour.
     * @return {string} the name of the current tour
     */
    var getCurrentTourName = function() {
      return currentTourName;
    };

    // Public API here
    return {
      start: start,
      setSteps: setSteps,
      continueCurrentTour: continueCurrentTour,
      autostart: autostart,
      getCurrentTourName: getCurrentTourName
    };
  });
