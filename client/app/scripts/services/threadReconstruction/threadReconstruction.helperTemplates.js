/* global angular*/

/**
 * Created by rita_temp on 03.08.17.
 */

angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionHelperTemplates", [
    "$rootScope",
    "ThreadReconstructionSettingsData",
    function($rootScope, ThreadReconstructionSettingsData) {
      "use strict";
      // Public API here

      var modal = {};

      var getConnectedComponentFeatureView = function(
        dataFrequency,
        dataValue,
        className,
        side,
        isLeftSideTransition
      ) {
        var sorted = sortDataAccordingToValueAndPresenceInQuery(
          dataFrequency,
          isLeftSideTransition
        );
        var featuresToCategories = [];
        if (isLeftSideTransition) {
          featuresToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesLM();
        } else {
          featuresToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesRM();
        }
        sorted.forEach(function(feature, i) {
          if (i < 3) {
            d3.select(className)
              .append("foreignObject")
              .attr("class", side + " representativeWordsButton")
              .attr("x", 32 * i - 30)
              //.attr('y', -120)
              .attr("width", 30)
              .attr("height", 30)
              .append("xhtml:div")
              .style("font", "14px Helvetica Neue")
              .html(function() {
                var className = "";
                if (featuresToCategories[feature].usedInQuery) {
                  className +=
                    featuresToCategories[feature].category + "IconBackground";
                } else {
                  className += "grayIconBackground";
                }
                return (
                  "<div class='iconBackgroundLarge " +
                  className +
                  "'><img class='featureIconImg' src='svgIcons/threadIcons/" +
                  feature +
                  ".svg' height=15; width=15;></span></div>"
                );
              });
          }
        });
      };

      var sortDataAccordingToValueAndPresenceInQuery = function(
        data,
        isLeftSideTransition
      ) {
        if (isLeftSideTransition) {
          var featuresToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesLM();
        } else {
          var featuresToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesRM();
        }

        var list = Object.keys(data).sort(function(a, b) {
          if (data[a] === data[b]) {
            if (
              featuresToCategories[a].usedInQuery === true &&
              featuresToCategories[b].usedInQuery === false
            ) {
              return -1;
            } else if (
              featuresToCategories[b].usedInQuery === true &&
              featuresToCategories[a].usedInQuery == false
            ) {
              return 1;
            } else {
              return 0;
            }
          } else {
            if (data[b] < data[a]) {
              return -1;
            }
            if (data[b] > data[a]) {
              return 1;
            }
          }
        });

        return list;
      };

      var getCommonWordsTemplate = function(
        commonWords,
        queryFeatures,
        location
      ) {
        var s = "";
        commonWords.forEach(function(w) {
          var features = w.feature.split(" ");
          s += "<div class='iconWrapperForCommonWords'>";
          var existingFeatures = [];
          features.forEach(function(f) {
            if (existingFeatures.indexOf(f) === -1) {
              f = f.trim();
              if (f !== "") {
                var found = false;
                queryFeatures.forEach(function(data) {
                  if (data.name === f) {
                    found = true;
                    s +=
                      "<div class='iconBackground structureIconBackground'><img src=svgIcons/threadIcons/" +
                      f +
                      '.svg width="10px;" height="10px;"></div>';
                  }
                });
                if (!found) {
                  s +=
                    '<div class="grayIconBackground iconBackground"><img src=svgIcons/threadIcons/' +
                    f +
                    '.svg width="10px;" height="10px;"></div>';
                }
              } else {
                s +=
                  '<div class="grayIconBackground iconBackground iconWithoutImage"></div>';
              }
              existingFeatures.push(f);
            }
          });
          s += '<span class="inlineSpan">' + w.phrase + "</span>";
          s += "</div>";
          s += "<br>";
        });
        return s;
      };

      var getCommonWordsButton = function(data) {
        var add = "";
        if (data.number === 0) {
          add = "*";
        } else {
          add = data.number;
        }
        return angular.element(
          "<button type='button' class='btn btn-default' aria-label='Left Align' ng-click='showExpandedGraph(" +
            data.number +
            ")'>" +
            "<span class='glyphicon glyphicon-menu-left' aria-hidden='true'></span>" +
            add +
            "<span class='glyphicon glyphicon-menu-right' aria-hidden='true'></span> </button><br>"
        );
      };

      var getButtonToStoreRelations = function() {
        return angular.element(
          "<button type='button' class='btn btn-default' aria-label='Left Align' ng-click='storeRelations()'>" +
            "<span class='glyphicon glyphicon-menu-left' aria-hidden='true'></span>SAVE<span class='glyphicon glyphicon-menu-right' aria-hidden='true'></span> </button><br>"
        );
      };

      var getModal = function(id) {
        return angular.element(
          "<div style='width:300px; max-height: 1000px;' class='threadModal modal-dialog modal-lg' id='threadModal" +
            id +
            "'>" +
            "<div class='modal-content threadModalContent'>" +
            "<div class='modal-header'>" +
            "<button type='button' id='Modal" +
            id +
            "' class='close modalMinimize' ng-click='minimizeModal($event.target.id)'> - </button> " +
            "<button type='button' id='Modal" +
            id +
            "' class='close modalMinimize' ng-click='removeModal($event.target.id)'> x </button> " +
            "</div>" +
            "<div class='modal-body' id='threadModalBody'>" +
            "<thread-reconstruction-sandbox></thread-reconstruction-sandbox>" +
            "<div class='sandboxStatistics'>" +
            "<div class='notFoundRelationStatistics' id='notFoundCategoriesthreadModal" +
            id +
            "'></div>" +
            "<div class='foundRelationStatistics' id='foundCategoriesthreadModal" +
            id +
            "'></div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
      };

      var getExpandedModal = function(id) {
        var width = $("#bottomStatisticView").width();
        return angular.element(
          "<div style='width:" +
            width +
            "px;' class='componentModal modal-dialog modal-lg'>" +
            "<div class='modal-content componentModalContent'>" +
            "<div class='modal-header'>" +
            "<button class='close' type='button' ng-click='hideModal()'>&times;</button>" +
            "</div>" +
            "<div class='modal-body' id='" +
            id +
            "'>" +
            "</div>" +
            "</div>" +
            "</div>"
        );
      };

      var showColorLegend = function() {
        var svg = d3
          .select("#colorLegendFotThreadRec")
          .append("svg")
          .attr("height", 100)
          .attr("width", 250);
        svg
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", "#1e90ff")
          .attr("x", 10)
          .attr("y", 10);
        svg
          .append("text")
          .text("Left Model")
          .attr("x", 25)
          .attr("y", 20);
        svg
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", "#dccb2a")
          .attr("x", 10)
          .attr("y", 30);
        svg
          .append("text")
          .text("Right Model")
          .attr("x", 25)
          .attr("y", 40);
        svg
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", "#94dc2a")
          .attr("x", 120)
          .attr("y", 10);
        svg
          .append("text")
          .text("Model Agreement")
          .attr("x", 135)
          .attr("y", 20);
        svg
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", "#663399")
          .attr("x", 120)
          .attr("y", 30);
        svg
          .append("text")
          .text("True Relations")
          .attr("x", 135)
          .attr("y", 40);
      };

      return {
        getCommonWordsTemplate: getCommonWordsTemplate,
        getCommonWordsButton: getCommonWordsButton,
        getButtonToStoreRelations: getButtonToStoreRelations,
        getModal: getModal,
        getExpandedModal: getExpandedModal,
        getConnectedComponentFeatureView: getConnectedComponentFeatureView,
        showColorLegend: showColorLegend
      };
    }
  ]);
