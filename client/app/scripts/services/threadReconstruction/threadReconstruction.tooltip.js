/* global angular, d3*/
/**
 * Created by rita_temp on 12.06.17.
 */
angular.module("visArgueClientApp").factory("ThreadReconstructionTooltip", [
  "$rootScope",
  "ThreadReconstructionSettingsData",
  function($rootScope, ThreadReconstructionSettingsData) {
    "use strict";

    var tooltip = {};
    var tooltipTree = {};

    var mouseOverLink = function(d, settingData, isLeftModel) {
      tooltip.style("display", "inline");
      tooltip.classed("smallTooltip", false);
      var string = "";
      Object.keys(settingData).forEach(function(key) {
        string += "<div id='tooltipGroup" + key + "'>";
        settingData[key].forEach(function(data) {
          if (d.featureAgreementList.indexOf(data.name) > -1) {
            var className = "";
            if (isLeftModel) {
              var found = false;
              ThreadReconstructionSettingsData.getLeftModelQueryData().forEach(
                function(feat) {
                  if (feat.name === data.name) {
                    found = true;
                    className += key + "IconBackground";
                  }
                }
              );
              if (!found) {
                className += "grayIconBackground";
              }
            } else {
              found = false;
              ThreadReconstructionSettingsData.getRightModelQueryData().forEach(
                function(feat) {
                  if (feat.name === data.name) {
                    found = true;
                    className += key + "IconBackground";
                  }
                }
              );
              if (!found) {
                className += "grayIconBackground";
              }
            }
            string +=
              "<li class='tooltipLi'><div class='iconBackground " +
              className +
              "'><span> <img src='svgIcons/threadIcons/" +
              data.name +
              ".svg' height=10; width=10;></span></div> " +
              data.nameToDisplay +
              " ";
            if (
              (key === "content" || key === "meta") &&
              d.numericalContinuousFeatureToValue[data.name] !== undefined
            ) {
              string += d.numericalContinuousFeatureToValue[data.name].toFixed(
                2
              );
            }
            string += "</li>";
          }
        });
        string += "</div>";
      });
      var distinctWords = [];
      d.commonWords.forEach(function(w) {
        if (distinctWords.indexOf(w.phrase) === -1 && w.phrase !== "") {
          distinctWords.push(w.phrase);
        }
      });
      string += "<div>Common words: " + distinctWords.join(", ") + "</div>";
      tooltip.html(string);
    };

    var mouseOverLinkTree = function(d, settingData) {
      tooltipTree.style("display", "inline");
      tooltipTree.classed("smallTooltip", false);
      var string = "";
      Object.keys(settingData).forEach(function(key) {
        string += "<div id='tooltipGroup" + key + "'>";
        settingData[key].forEach(function(data) {
          if (d.featureAgreementList.indexOf(data.name) > -1) {
            var className = "";
            if (
              d.temporallyValidFeaturesRightModel.indexOf(data.name) > -1 ||
              d.temporallyValidFeaturesLeftModel.indexOf(data.name) > -1
            ) {
              className += key + "IconBackground";
            } else {
              className += "grayIconBackground";
            }
            string +=
              "<li class='tooltipLi'><div class='iconBackground " +
              className +
              "'><span> <img src='svgIcons/threadIcons/" +
              data.name +
              ".svg' height=10; width=10;></span></div> " +
              data.nameToDisplay +
              " ";
            if (
              (key === "content" || key === "meta") &&
              d.numericalContinuousFeatureToValue[data.name] !== undefined
            ) {
              string += d.numericalContinuousFeatureToValue[data.name].toFixed(
                2
              );
            }
            string += "</li>";
          }
        });
        string += "</div>";
      });
      var distinctWords = [];
      d.commonWords.forEach(function(w) {
        if (distinctWords.indexOf(w.phrase) === -1 && w.phrase !== "") {
          distinctWords.push(w.phrase);
        }
      });
      string += "<div>Common words: " + distinctWords.join(", ") + "</div>";
      tooltipTree.html(string);
    };

    var mouseOverNode = function(d) {
      tooltip.style("display", "inline");
      tooltip.classed("smallTooltip", true);
      var string = "";
      d.categories.forEach(function(data) {
        string +=
          "<li><span> <img src='svgIcons/threadIcons/" +
          data +
          ".svg'  height=10; width=10;></span> " +
          data.replace("_", " ") +
          "</li>";
      });
      if (d.categories.length === 0) {
        string += "NO CATEGORIES PRESENT";
      }
      string += "<br> LM Parent Candidates:";
      string +=
        "<br>" +
        d.parentCandidatesLM.length +
        " : " +
        d.parentCandidatesRM.length;
      string += "<br> <span>Children:</span>";
      string +=
        "<br> <span>" +
        d.givenChildren.length +
        " : " +
        d.foundChildren.length +
        "</span>";
      string +=
        "<br> <span class='divForGlyphIconContent glyphicon glyphicon-thumbs-up' style=" +
        "font-size: 10px;" +
        ">" +
        d.ups +
        "</span>";
      tooltip.html(string);
    };

    var mouseOverNodeTree = function(d) {
      tooltipTree.style("display", "inline");
      tooltipTree.classed("smallTooltip", true);
      var string = "";
      d.categories.forEach(function(data) {
        string +=
          "<li><span> <img src='svgIcons/threadIcons/" +
          data +
          ".svg'  height=10; width=10;></span> " +
          data.replace("_", " ") +
          "</li>";
      });
      if (d.categories.length === 0) {
        string += "NO CATEGORIES PRESENT";
      }
      string += "<br> LM Parent Candidates:";
      string +=
        "<br>" +
        d.parentCandidatesLM.length +
        " : " +
        d.parentCandidatesRM.length;
      string += "<br> <span>Children:</span>";
      string +=
        "<br> <span>" +
        d.givenChildren.length +
        " : " +
        d.foundChildren.length +
        "</span>";
      string +=
        "<br> <span class='divForGlyphIconContent glyphicon glyphicon-thumbs-up' style=" +
        "font-size: 10px;" +
        ">" +
        d.ups +
        "</span>";
      tooltipTree.html(string);
    };

    var mouseMove = function(side, scrollY, scrollX) {
      if (side === "right") {
        tooltip
          .style("left", d3.event.pageX + scrollX + 80 + "px")
          .style("top", d3.event.pageY + scrollY - 100 + "px");
      } else if (side === "left") {
        tooltip
          .style("left", d3.event.pageX + scrollX + 80 + "px") // - 450
          .style("top", d3.event.pageY + scrollY - 100 + "px");
      }
    };

    var mouseMoveTree = function(side, scrollY, scrollX) {
      if (side === "right") {
        tooltipTree
          .style("left", d3.event.pageX + scrollX - 400 + "px")
          .style("top", d3.event.pageY + scrollY + "px");
      } else if (side === "left") {
        tooltipTree
          .style("left", d3.event.pageX + scrollX + 80 + "px") // - 450
          .style("top", d3.event.pageY + scrollY + "px");
      }
    };

    var mouseMoveNode = function(scrollY, scrollX) {
      tooltip
        .style("left", d3.event.pageX + scrollX + 40 + "px")
        .style("top", d3.event.pageY + scrollY - 150 + "px");
    };

    var mouseMoveNodeTree = function(scrollY, scrollX) {
      tooltipTree
        .style("left", d3.event.pageX + scrollX + 40 + "px")
        .style("top", d3.event.pageY + scrollY - 150 + "px");
    };

    var mouseOut = function() {
      return tooltip.style("display", "none");
    };

    var mouseOutTree = function() {
      return tooltipTree.style("display", "none");
    };

    var createTooltip = function(div) {
      tooltip = d3
        .select(div)
        .append("div")
        .attr("class", "threadTooltip")
        .style("display", "none");
    };

    var createTooltipTree = function(div) {
      tooltipTree = d3
        .select(div)
        .append("div")
        .attr("class", "threadTooltip")
        .style("display", "none");
    };

    // Public API here
    return {
      createTooltip: createTooltip,
      mouseOverLink: mouseOverLink,
      mouseMove: mouseMove,
      mouseOut: mouseOut,
      mouseOverNode: mouseOverNode,
      mouseMoveNode: mouseMoveNode,
      mouseOverNodeTree: mouseOverNodeTree,
      createTooltipTree: createTooltipTree,
      mouseMoveNodeTree: mouseMoveNodeTree,
      mouseOutTree: mouseOutTree,
      mouseOverLinkTree: mouseOverLinkTree,
      mouseMoveTree: mouseMoveTree
    };
  }
]);
