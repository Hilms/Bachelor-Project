/**
 * Created by rita_temp on 05.09.17.
 */
/*global console, d3, $, angular */

angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionSimpleSlider", [
    "$rootScope",
    "ThreadReconstructionSettingsData",
    function($rootScope, ThreadReconstructionSettingsData) {
      "use strict";

      function simpleSlider(side) {
        var width = 100,
          value = 1 /* Domain assumes to be [0 - 1] */,
          valueLeft = 0,
          event,
          x = 0,
          y = 0;

        var leftSide = side;

        function slider(selection) {
          //Line to represent the current value
          var valueLine = selection
            .append("line")
            .attr("id", function() {
              if (leftSide) {
                return "leftSliderFirstLine";
              } else {
                return "rightSliderFirstLine";
              }
            })
            .attr("x1", x)
            .attr("x2", x + width * value)
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke", function() {
              if (leftSide) {
                return "#d9d9d9";
              } else {
                return "#f2f2f2";
              }
            })
            .style({
              "stroke-linecap": "round",
              "stroke-width": 6
            });

          //Line to show the remaining value
          var emptyLine = selection
            .append("line")
            .attr("id", function() {
              if (leftSide) {
                return "leftSliderSecondLine";
              } else {
                return "rightSliderSecondLine";
              }
            })
            .attr("x1", x + width * value)
            .attr("x2", x + width)
            .attr("y1", y)
            .attr("y2", y)
            .style("stroke", function() {
              if (leftSide) {
                return "#f2f2f2";
              } else {
                return "#d9d9d9";
              }
            })
            .style({
              "stroke-linecap": "round",
              "stroke-width": 6
            });

          var drag = d3.behavior
            .drag()
            .on("dragstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function() {
              var newX = d3.mouse(this)[0];

              if (newX < x) {
                newX = x;
              } else if (newX > x + width) {
                newX = x + width;
              }

              value = (newX - x) / width;
              valueCircle.attr("cx", newX);
              //valueCircleLeft.attr('cx', newX);
              valueLine.attr("x2", x + width * value);
              emptyLine.attr("x1", x + width * value);

              if (event) {
                event();
              }
            })
            .on("dragend", function() {
              updateParentChildSpaceRegardingSelection();
            });

          //Draggable circle to represent the current value
          var valueCircle = selection
            .append("circle")
            .attr("id", function() {
              if (leftSide) {
                return "leftSliderCircle";
              } else {
                return "rightSliderCircle";
              }
            })
            .attr("cx", x + width * value)
            .attr("cy", y)
            .attr("r", 8)
            .style({
              stroke: "black",
              "stroke-width": 1.0,
              fill: "white"
            })
            .call(drag);

          var dragLeft = d3.behavior
            .drag()
            .on("dragstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function() {
              var newX = d3.mouse(this)[0];

              if (newX < x) {
                newX = x;
              } else if (newX > x + width) {
                newX = x + width;
              }

              valueLeft = (newX - x) / width;
              valueCircleLeft.attr("cx", newX);
              // valueCircle2.attr('cx', newX);
              valueLine.attr("x2", x + width * valueLeft);
              emptyLine.attr("x1", x + width * valueLeft);

              if (event) {
                event();
              }
            })
            .on("dragend", function() {
              updateParentChildSpaceRegardingSelection();
            });

          //Draggable circle to represent the current value
          if (leftSide) {
            var valueCircleLeft = selection
              .append("circle")
              .attr("id", "leftSliderCircleLeft")
              .attr("cx", x + width * valueLeft)
              .attr("cy", y)
              .attr("r", 8)
              .style({
                stroke: "black",
                "stroke-width": 1.0,
                fill: "black"
              })
              .call(dragLeft);
          }

          var text = selection
            .append("text")
            .attr("id", function() {
              if (leftSide) {
                return "leftSliderText";
              } else {
                return "rightSliderText";
              }
            })
            .text(function() {
              if (leftSide) {
                return ThreadReconstructionSettingsData.getCurrentLeftModel();
              } else {
                return ThreadReconstructionSettingsData.getCurrentRightModel();
              }
            })
            .attr("y", 120)
            .attr("x", function() {
              return x + width / 2 - 150;
            })
            .style("font-size", 25);
        }

        slider.x = function(val) {
          x = val;
          return slider;
        };

        slider.y = function(val) {
          y = val;
          return slider;
        };

        slider.value = function(val) {
          if (val) {
            value = val;
            return slider;
          } else {
            return value;
          }
        };

        slider.valueLeft = function(val) {
          if (val) {
            valueLeft = val;
            return slider;
          } else {
            return valueLeft;
          }
        };

        slider.width = function(val) {
          width = val;
          return slider;
        };

        slider.event = function(val) {
          event = val;
          return slider;
        };
        return slider;
      }

      function simpleVerticalSlider() {
        var height = 1000,
          value = 1.0 /* Domain assumes to be [0 - 1] */,
          valueTop = 0.0,
          event,
          x = 0,
          y = 0;

        function slider(selection) {
          //Line to represent the current value
          var valueLine = selection
            .append("line")
            .attr("id", "verticalSliderFirstLine")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", y + height * valueTop)
            .attr("y2", y + height * value)
            .style("stroke", "#d9d9d9")
            .style({
              "stroke-linecap": "round",
              "stroke-width": 6
            });

          //Line to show the remaining value
          var emptyLine = selection
            .append("line")
            .attr("id", "verticalSliderSecondLine")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", y + height * value)
            .attr("y2", y + height)
            .style("stroke", "#f2f2f2")
            .style({
              "stroke-linecap": "round",
              "stroke-width": 6
            });

          //Line to show the remaining value
          var emptyLineTop = selection
            .append("line")
            .attr("id", "verticalSliderSecondLineTop")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", y)
            .attr("y2", y + height * valueTop)
            .style("stroke", "#f2f2f2")
            .style({
              "stroke-linecap": "round",
              "stroke-width": 6
            });

          var drag = d3.behavior
            .drag()
            .on("dragstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function() {
              var newX = d3.mouse(this)[1];

              if (newX < y) {
                newX = y;
              } else if (newX > y + height) {
                newX = y + height;
              }

              value = (newX - y) / height;
              valueCircle.attr("cy", newX);
              // valueCircle2.attr('cx', newX);
              valueLine.attr("y2", y + height * value);
              emptyLine.attr("y1", y + height * value);

              if (event) {
                event();
              }
            })
            .on("dragend", function() {
              updateParentChildSpaceRegardingSelection();
            });

          //Draggable circle to represent the current value
          var valueCircle = selection
            .append("circle")
            .attr("id", "verticalSliderCircle")
            .attr("cx", x)
            .attr("cy", y + height * value)
            .attr("r", 8)
            .style({
              stroke: "black",
              "stroke-width": 1.0,
              fill: "black"
            })
            .call(drag);

          var dragTop = d3.behavior
            .drag()
            .on("dragstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("drag", function() {
              var newX = d3.mouse(this)[1];

              if (newX < y) {
                newX = y;
              } else if (newX > y + height) {
                newX = y + height;
              }

              valueTop = (newX - y) / height;
              valueCircleTop.attr("cy", newX);
              // valueCircle2.attr('cx', newX);
              valueLine.attr("y1", y + height * valueTop);
              emptyLineTop.attr("y2", y + height * valueTop);

              if (event) {
                event();
              }
            })
            .on("dragend", function() {
              updateParentChildSpaceRegardingSelection();
            });

          //Draggable circle to represent the current value
          var valueCircleTop = selection
            .append("circle")
            .attr("id", "verticalSliderCircleTop")
            .attr("cx", x)
            .attr("cy", y + height * valueTop)
            .attr("r", 8)
            .style({
              stroke: "black",
              "stroke-width": 1.0,
              fill: "white"
            })
            .call(dragTop);

          var text = selection
            .append("text")
            .attr("y", function() {
              return y + height / 2 - 150;
            })
            .attr("x", -150)
            .style("font-size", 25);
        }

        slider.x = function(val) {
          x = val;
          return slider;
        };

        slider.y = function(val) {
          y = val;
          return slider;
        };

        slider.value = function(val) {
          if (val) {
            value = val;
            return slider;
          } else {
            return value;
          }
        };

        slider.valueTop = function(val) {
          if (val) {
            valueTop = val;
            return slider;
          } else {
            return valueTop;
          }
        };

        slider.height = function(val) {
          height = val;
          return slider;
        };

        slider.event = function(val) {
          event = val;
          return slider;
        };
        return slider;
      }

      var sideOpen = "";
      var sliderLeft;
      var sliderRight;
      var verticalSlider;
      var currentRightPosition = 0;
      var currentVerticalPosition = 1;
      var currentVerticalPositionTop = 0;
      var currentLeftPosition = 1;
      var currentLeftPositionLeft = 1;
      var previousLeftPosition = 1;
      var verticalHeight = 0;
      var currentSelection = [];
      var currentSelectionHorizontal = [];
      var previousSelection = [];

      var getSlider = function(leftSide) {
        return new simpleSlider(leftSide);
      };

      var getVerticalSlider = function() {
        return new simpleVerticalSlider();
      };

      var createSliders = function(svg, properties, messages) {
        sliderLeft = getSlider(true);
        sliderLeft
          .width(600)
          .x(properties.messageWidth - 605)
          .y(properties.yStart - 20)
          .event(function() {
            currentLeftPosition = sliderLeft.value();
            currentLeftPositionLeft = sliderLeft.valueLeft();
            if (currentLeftPositionLeft !== undefined) {
              hideLeftLinks(currentLeftPosition, currentLeftPositionLeft);
            }
          })
          .value(1)
          .valueLeft(0);
        svg.call(sliderLeft);

        sliderRight = getSlider(false);
        sliderRight
          .width(600)
          .x(properties.messageWidth + 5)
          .y(properties.yStart - 20)
          .event(function() {
            currentRightPosition = sliderRight.value();
            hideRightLinks(currentRightPosition);
          })
          .value(0);
        sliderRight.value(0);
        svg.call(sliderRight);

        currentRightPosition = 0;
        currentLeftPosition = 1;
        currentLeftPositionLeft = 0;
        currentVerticalPositionTop = 0;
        currentVerticalPosition = 1;

        createVerticalSlider(svg, properties, messages);
      };

      var createVerticalSlider = function(svg, properties, messages) {
        verticalSlider = getVerticalSlider();
        verticalHeight = messages.length * properties.nodeHeight + 50;
        verticalSlider
          .height(verticalHeight)
          .x(properties.messageWidth - 620)
          .y(properties.yStart)
          .event(function() {
            currentVerticalPosition = verticalSlider.value();
            currentVerticalPositionTop = verticalSlider.valueTop();
            hideLinks(currentVerticalPosition, currentVerticalPositionTop);
          })
          .value(1.0);
        verticalSlider.valueTop(0.0);
        svg.call(verticalSlider);
      };

      var hideLeftLinks = function(position, positionLeft) {
        console.log(positionLeft);
        currentSelectionHorizontal = [];
        if (sideOpen === "") {
          //d3.select('#leftSliderText').text('GIVEN RELATIONS');
          d3.selectAll(".relationPathGivenForest").style(
            "visibility",
            "visible"
          );
          d3.selectAll(".relationPathGivenForest").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
                (1 - position) * 1200 ||
              10 * d.numericalContinuousFeatureToValue.DISTANCE >
                (1 - positionLeft) * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else if (sideOpen === "given") {
          //d3.select('#leftSliderText').text('GIVEN RELATIONS BEING NOT FOUND');
          d3.selectAll(".relationPathGivenForestNotFound").style(
            "visibility",
            "visible"
          );
          d3.selectAll(".relationPathGivenForestNotFound").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
                (1 - position) * 1200 ||
              10 * d.numericalContinuousFeatureToValue.DISTANCE >
                (1 - positionLeft) * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else if (sideOpen === "found") {
          //d3.select('#leftSliderText').text('CORRECTLY FOUND RELATIONS');
          d3.selectAll(
            ".relationPathForest.theSameAsGiven, .relationPathForest.transitiveSameAsGiven"
          ).style("visibility", "visible");
          d3.selectAll(
            ".relationPathForest.theSameAsGiven, .relationPathForest.transitiveSameAsGiven"
          ).each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
                (1 - position) * 1200 ||
              10 * d.numericalContinuousFeatureToValue.DISTANCE >
                (1 - positionLeft) * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else {
          //d3.select('#leftSliderText').text('FOUND RELATIONS');
          d3.selectAll(
            "#rightSliderFirstLine, #rightSliderSecondLine, #rightSliderCircle, #rightSliderText"
          ).style("visibility", "hidden");
          d3.selectAll(".relationPathForest").style("visibility", "visible");
          if (ThreadReconstructionSettingsData.isLeftModel()) {
            d3.selectAll(".relationPathGivenForest").each(function(d) {
              if (
                10 * d.numericalContinuousFeatureToValue.DISTANCE <
                  (1 - position) * 1200 ||
                10 * d.numericalContinuousFeatureToValue.DISTANCE >
                  (1 - positionLeft) * 1200 ||
                (d.y2 - 70 > currentVerticalPosition * verticalHeight ||
                  d.y1 - 70 < verticalHeight * currentVerticalPositionTop)
              ) {
                d3.select(this).style("visibility", "hidden");
                currentSelectionHorizontal.push(d.parentId + d.childId);
              }
            });
            ThreadReconstructionSettingsData.getTitleMessage().givenChildren.forEach(
              function(d) {
                if (
                  10 * d.numericalContinuousFeatureToValue.DISTANCE <
                    (1 - position) * 1200 ||
                  10 * d.numericalContinuousFeatureToValue.DISTANCE >
                    (1 - positionLeft) * 1200 ||
                  (d.y2 - 70 > currentVerticalPosition * verticalHeight ||
                    d.y1 - 70 < verticalHeight * currentVerticalPositionTop)
                ) {
                  currentSelectionHorizontal.push(d.parentId + d.childId);
                }
              }
            );
          } else {
            d3.selectAll(".relationPathForest").each(function(d) {
              if (
                10 * d.numericalContinuousFeatureToValue.DISTANCE <
                  (1 - position) * 1200 ||
                10 * d.numericalContinuousFeatureToValue.DISTANCE >
                  (1 - positionLeft) * 1200 ||
                (d.y2 - 70 > currentVerticalPosition * verticalHeight ||
                  d.y1 - 70 < verticalHeight * currentVerticalPositionTop)
              ) {
                d3.select(this).style("visibility", "hidden");
                currentSelectionHorizontal.push(d.parentId + d.childId);
              }
            });
            ThreadReconstructionSettingsData.getTitleMessage().foundChildren.forEach(
              function(d) {
                if (
                  10 * d.numericalContinuousFeatureToValue.DISTANCE <
                    (1 - position) * 1200 ||
                  10 * d.numericalContinuousFeatureToValue.DISTANCE >
                    (1 - positionLeft) * 1200 ||
                  (d.y2 - 70 > currentVerticalPosition * verticalHeight ||
                    d.y1 - 70 < verticalHeight * currentVerticalPositionTop)
                ) {
                  currentSelectionHorizontal.push(d.parentId + d.childId);
                }
              }
            );
          }
        }
      };

      var hideRightLinks = function(position) {
        if (sideOpen === "") {
          //d3.select('#rightSliderText').text('FOUND RELATIONS');
          d3.selectAll(".relationPathForest").style("visibility", "visible");
          d3.selectAll(".relationPathForest").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
              position * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else if (sideOpen === "given") {
          //d3.select('#rightSliderText').text('GIVEN RELATIONS FOUND CORRECTLY');
          d3.selectAll(
            ".relationPathGivenForest.theSameAsGiven, .relationPathGivenForest.transitiveSameAsGiven"
          ).style("visibility", "visible");
          d3.selectAll(
            ".relationPathGivenForest.theSameAsGiven, .relationPathGivenForest.transitiveSameAsGiven"
          ).each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
              position * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else if (sideOpen === "found") {
          //d3.select('#rightSliderText').text('INCORRECTLY FOUND RELATIONS');
          d3.selectAll(".relationPathForestNotGiven").style(
            "visibility",
            "visible"
          );
          d3.selectAll(".relationPathForestNotGiven").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
              position * 1200
            ) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        }
      };

      var hideLinks = function(position, positionTop) {
        currentSelection = [];

        if (ThreadReconstructionSettingsData.isLeftModel()) {
          d3.selectAll(".relationPathGivenForest").style(
            "visibility",
            "visible"
          );

          d3.selectAll(".relationPathGivenForest").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
                (1 - currentLeftPosition) * 1200 ||
              10 * d.numericalContinuousFeatureToValue.DISTANCE >
                (1 - currentLeftPositionLeft) * 1200 ||
              (d.y2 - 70 > position * verticalHeight ||
                d.y1 - 70 < verticalHeight * positionTop)
            ) {
              //if ((d.y1 > position * verticalHeight && d.y2 > position * verticalHeight) || (d.y1 < verticalHeight * positionTop && d.y2 < verticalHeight * positionTop)) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        } else {
          d3.selectAll(".relationPathForest").style("visibility", "visible");

          d3.selectAll(".relationPathForest").each(function(d) {
            if (
              10 * d.numericalContinuousFeatureToValue.DISTANCE <
                (1 - currentLeftPosition) * 1200 ||
              10 * d.numericalContinuousFeatureToValue.DISTANCE >
                (1 - currentLeftPositionLeft) * 1200 ||
              (d.y2 - 70 > position * verticalHeight ||
                d.y1 - 70 < verticalHeight * positionTop)
            ) {
              //if ((d.y1 > position * verticalHeight && d.y2 > position * verticalHeight) || (d.y1 < verticalHeight * positionTop && d.y2 < verticalHeight * positionTop)) {
              d3.select(this).style("visibility", "hidden");
            }
          });
        }

        d3.selectAll(".messageCircleGForest").each(function(d) {
          var t = d3.transform(d3.select(this).attr("transform"));
          var y = parseInt(t.translate[1]);
          if (
            y - 60 > verticalHeight * positionTop &&
            y - 70 < position * verticalHeight
          ) {
            currentSelection.push(d.id);
          }
        });
      };

      var updateParentChildSpaceRegardingSelection = function() {
        //if(previousSelection.length!==currentSelection.length) {
        d3.selectAll(".parentChildSpaceCircle").remove();
        d3.selectAll(".parentChildSpaceLine").remove();
        d3.selectAll(".parentCandidateRow").remove();
        d3.selectAll(".titleMessageNode").remove();
        d3.selectAll(".featureForeign").remove();
        d3.selectAll(".featureName").remove();
        var tempVisibleMessages = [];
        ThreadReconstructionSettingsData.getMessagesData().forEach(function(
          message
        ) {
          if (currentSelection.indexOf(message.id) > -1) {
            if (tempVisibleMessages.indexOf(message) === -1) {
              tempVisibleMessages.push(message);
            }
          }
        });
        ThreadReconstructionSettingsData.setTempVisibleMessagesInParentChildSpace(
          tempVisibleMessages
        );
        ThreadReconstructionSettingsData.setSortedOutRelations(
          currentSelectionHorizontal
        );

        var relevantMessageIds = [];
        relevantMessageIds.push(
          ThreadReconstructionSettingsData.getTitleMessage().id
        );
        tempVisibleMessages.forEach(function(d) {
          relevantMessageIds.push(d.id);
        });

        ThreadReconstructionSettingsData.setRelevantMessageIds(
          relevantMessageIds
        );

        if ($("#parentCandidateSummaryView").is(":visible")) {
          if (ThreadReconstructionSettingsData.isLeftModel()) {
            $rootScope.$broadcast("parentChildSpaceLM", true);
          } else {
            $rootScope.$broadcast("parentChildSpaceRM", true);
          }
        }
        //}
        previousSelection = currentSelection;
        previousLeftPosition = currentLeftPosition;
      };

      var setSideOpen = function(side) {
        //d3.selectAll('#rightSliderFirstLine, #rightSliderSecondLine, #rightSliderCircle, #rightSliderText').style('visibility', 'visible');
        sideOpen = side;
        if (side !== "") {
          hideLinks(currentVerticalPosition, currentVerticalPositionTop);
        } else {
          hideRightLinks(currentRightPosition);
          hideLeftLinks(currentLeftPosition, currentLeftPositionLeft);
        }
      };

      var hideSliders = function() {
        // d3.selectAll('#rightSliderFirstLine, #rightSliderSecondLine, #rightSliderCircle, #rightSliderText, #leftSliderFirstLine, #leftSliderSecondLine, #leftSliderCircle, #leftSliderCircleLeft, #leftSliderText').style('visibility', 'hidden');
      };

      var showSliders = function() {
        // d3.selectAll('#rightSliderFirstLine, #rightSliderSecondLine, #rightSliderCircle, #rightSliderText, #leftSliderFirstLine, #leftSliderSecondLine, #leftSliderCircle,#leftSliderCircleLeft, #leftSliderText').style('visibility', 'visible');
      };

      var hideVerticalSlider = function() {
        d3.selectAll(
          "#verticalSliderFirstLine, #verticalSliderSecondLine, #verticalSliderCircle, #verticalSliderSecondLineTop, #verticalSliderCircleTop"
        ).style("visibility", "hidden");
        d3.selectAll(
          "#rightSliderFirstLine, #rightSliderSecondLine, #rightSliderCircle, #rightSliderText, #leftSliderFirstLine, #leftSliderSecondLine, #leftSliderCircle, #leftSliderCircleLeft, #leftSliderText"
        ).style("visibility", "hidden");
      };

      var showVerticalSlider = function() {
        d3.selectAll(
          "#verticalSliderFirstLine, #verticalSliderSecondLine, #verticalSliderCircle, #verticalSliderSecondLineTop, #verticalSliderCircleTop"
        ).style("visibility", "visible");
        d3.selectAll(
          "#leftSliderFirstLine, #leftSliderSecondLine, #leftSliderCircle,#leftSliderCircleLeft, #leftSliderText"
        ).style("visibility", "visible");
      };

      // Public API here
      return {
        getSlider: getSlider,
        createSliders: createSliders,
        setSideOpen: setSideOpen,
        hideSliders: hideSliders,
        showSliders: showSliders,
        createVerticalSlider: createVerticalSlider,
        hideVerticalSlider: hideVerticalSlider,
        showVerticalSlider: showVerticalSlider
      };
    }
  ]);
