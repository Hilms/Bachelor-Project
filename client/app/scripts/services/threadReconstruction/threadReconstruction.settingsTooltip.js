/* global angular, d3*/
/**
 * Created by rita_temp on 17.06.17.
 */
angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionSettingsTooltip", [
    "$rootScope",
    function($rootScope) {
      "use strict";

      var tooltip = {};
      var tooltipParentChildSpace = {};

      var mouseOver = function(feature) {
        tooltip.style("display", "inline");
        tooltip.classed("smallTooltip", false);
        tooltip.html(
          "<div>" + feature.name + " (" + feature.frequency + "%)</div>"
        );
      };

      var mouseOverParentChildSpace = function(feature) {
        tooltipParentChildSpace.style("display", "inline");
        tooltipParentChildSpace.classed("smallTooltip", false);
        tooltipParentChildSpace.html("<div>" + feature + "</div>");
      };

      var mouseOut = function() {
        return tooltip.style("display", "none");
      };

      var mouseOutParentChildSpace = function() {
        return tooltipParentChildSpace.style("display", "none");
      };

      var createTooltip = function(div) {
        tooltip = d3
          .select("#" + div)
          .append("div")
          .attr("class", "settingsTooltip")
          .style("display", "none");
      };

      var createTooltipParentChildSpace = function(div) {
        tooltipParentChildSpace = d3
          .select("#" + div)
          .append("div")
          .attr("class", "settingsTooltip")
          .style("display", "none");
      };

      var mouseMove = function(event) {
        tooltip
          .style(
            "left",
            angular.element(event.target).prop("offsetLeft") + 20 + "px"
          )
          .style("top", angular.element(event.target).prop("offsetTop") + "px");
      };

      var mouseMoveParentChildSpace = function(y, x) {
        tooltipParentChildSpace
          .style("left", d3.event.pageX + x + "px")
          .style("top", d3.event.pageY + y - 100 + "px");
      };

      // Public API here
      return {
        createTooltip: createTooltip,
        mouseOver: mouseOver,
        mouseOut: mouseOut,
        mouseMove: mouseMove,
        mouseOverParentChildSpace: mouseOverParentChildSpace,
        mouseOutParentChildSpace: mouseOutParentChildSpace,
        createTooltipParentChildSpace: createTooltipParentChildSpace,
        mouseMoveParentChildSpace: mouseMoveParentChildSpace
      };
    }
  ]);
