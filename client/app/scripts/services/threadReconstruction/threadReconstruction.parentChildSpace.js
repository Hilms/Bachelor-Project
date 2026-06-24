/**
 * Created by rita_temp on 30.08.17.
 */
/*global console, d3, $, angular */

angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionParentChildSpace", [
    "$rootScope",
    "$compile",
    "ThreadReconstructionSelectedMessage",
    "ThreadReconstructionSettingsData",
    "ThreadReconstructionHelperTemplates",
    "ThreadReconstructionSettingsTooltip",
    function(
      $rootScope,
      $compile,
      ThreadReconstructionSelectedMessage,
      ThreadReconstructionSettingsData,
      ThreadReconstructionHelperTemplates,
      ThreadReconstructionSettingsTooltip
    ) {
      "use strict";

      var posX = {};
      var posY = {};
      var maxPosition = 0;
      var space = 600;
      var positionForFirstNodes;
      var scaleLinkOpacity;
      var scaleLinkWidth;
      var parentToChildren;
      var colorScale;
      var title;
      var messagesWithTitle = [];
      var sumOfScores = [];
      var normalizeSumOfScores;
      var location;
      var storedRelations = [];
      var childToParentCandidates = [];
      var parentToParentChildFeatures = [];
      var relevantMessageIds = [];
      var results = {
        truePositives: 0,
        allFound: 0,
        allGiven: 0
      };
      var isLeftModel = false;

      var maxTime = 0;

      var showSpace = function(
        container,
        originalYPos,
        xPosition,
        titleNode,
        messages,
        location_,
        leftModel
      ) {
        results = {
          truePositives: 0,
          allFound: 0,
          allGiven: 0
        };

        isLeftModel = leftModel;

        positionForFirstNodes = xPosition + 110 + 24 * 17;

        //container.selectAll('.relationPathGivenForest').remove();
        title = titleNode;
        messagesWithTitle = [];
        messagesWithTitle.push(titleNode);
        messages.forEach(function(message) {
          messagesWithTitle.push(message);
        });
        location = location_;

        posX = {};
        posY = {};
        showFirstChildNodes(
          container,
          ThreadReconstructionSettingsData.getMessagesData(),
          originalYPos
        );
        createBrushSelection(container);
        addFoundParent(
          getParentToChildren(container),
          container,
          originalYPos,
          xPosition + 200,
          messages,
          location
        );
        showFeatures(container, messagesWithTitle, originalYPos, xPosition);
        updatePrecisionRecall();

        /**change slider name*/
        if (!leftModel)
          d3.select("#leftSliderText").text(
            ThreadReconstructionSettingsData.getCurrentRightModel()
          );
      };

      var showFirstChildNodes = function(container, messages, originalYPos) {
        var toggleClick = false;
        container
          .select("#forestG")
          .selectAll(".firstNodes")
          .data(messages)
          .enter()
          .append("circle")
          .attr("class", "parentChildSpaceCircleFirst")
          .attr("id", function(d) {
            return "parentChildSpaceCircleFirst" + d.id;
          })
          .attr("cx", positionForFirstNodes)
          .attr("cy", function(d) {
            return originalYPos[d.id];
          })
          .attr("r", function(d) {
            return container.select("#circle" + d.id).attr("r");
          })
          .attr("pointer-events", "all")
          .style("fill", function(d) {
            return "gray";
          })
          .on("click", function(d) {
            if (toggleClick) {
              d3.selectAll(".parentChildSpaceLine").classed(
                "fadedOutElement",
                false
              );
              d3.selectAll(
                ".relationPath, .relationPathGiven, .relationPathForest, .relationPathGivenForest"
              ).classed("fadedOutPath", false);
              toggleClick = false;
            } else {
              /** fade out other relations in parent child space */
              d3.selectAll(".parentChildSpaceLine").classed(
                "fadedOutElement",
                true
              );
              d3.selectAll(".parentChildSpaceLine" + d.id).classed(
                "fadedOutElement",
                false
              );
              d3.selectAll(
                ".relationPath, .relationPathGiven, .relationPathForest, .relationPathGivenForest"
              ).classed("fadedOutPath", true);
              d3.selectAll(
                "#relationPathGiven" +
                  d.foundParentId +
                  d.id +
                  ", #relationPathGivenForest" +
                  d.foundParentId +
                  d.id
              ).classed("fadedOutPath", false);
              d3.selectAll(
                "#relationPath" +
                  d.foundParentId +
                  d.id +
                  ", #relationPathForest" +
                  d.foundParentId +
                  d.id
              ).classed("fadedOutPath", false);
              toggleClick = true;
            }
          });

        d3.selectAll(".parentChildSpaceCircleFirst")
          .data(messages)
          .exit()
          .remove();
      };

      var getParentToChildren = function() {
        var timeFeat = "TIME_DISTANCE";

        var childToPreviousPosition = {};

        var sortedOutRelations = ThreadReconstructionSettingsData.getSortedOutRelations();

        parentToChildren = {};
        parentToParentChildFeatures = [];
        messagesWithTitle.forEach(function(d) {
          parentToChildren[d.id] = {};
          childToParentCandidates[d.id] = [];
          parentToParentChildFeatures[d.id] = [];
          childToPreviousPosition[d.id] = -1;
        });

        relevantMessageIds = ThreadReconstructionSettingsData.getRelevantMessageIds();

        var parentCandidates = [];
        messagesWithTitle.forEach(function(d) {
          if (isLeftModel) {
            if (parentToChildren[d.givenParentId] !== undefined) {
              if (sortedOutRelations.indexOf(d.givenParentId + d.id) === -1) {
                parentToChildren[d.givenParentId][0] = [];
              }
            }
          } else {
            if (parentToChildren[d.foundParentId] !== undefined) {
              if (sortedOutRelations.indexOf(d.foundParentId + d.id) === -1) {
                parentToChildren[d.foundParentId][0] = [];
              }
            }
          }

          if (isLeftModel) {
            parentCandidates = d.parentCandidatesObjectsLM;
          } else {
            parentCandidates = d.parentCandidatesObjectsRM;
          }
          parentCandidates.forEach(function(candidate, i) {
            if (parentToChildren[candidate.childId] !== undefined) {
              if (parentToChildren[candidate.parentId] !== undefined) {
                parentToChildren[candidate.parentId][i + 1] = [];
                if (maxPosition < i + 1) {
                  maxPosition = i + 1;
                }
              }
            }
          });
        });

        /*  var search = true;
         if(ThreadReconstructionSettingsData.getShowAgreement()){
         console.log(d.parentCandidatesObjectsLM[0]);
         console.log(d.parentCandidatesObjectsRM[0]);
         if(d.parentCandidatesObjectsLM[0]!==undefined && d.parentCandidatesObjectsRM[0] !== undefined) {
         if (d.parentCandidatesObjectsLM[0].parentId !== d.parentCandidatesObjectsRM[0].parentId) {
         search = false;
         }
         }else{
         search = false;
         }
         }
         if(search) {*/

        var children = [];
        var classifierResult;
        messagesWithTitle.forEach(function(d) {
          if (isLeftModel) {
            children = d.givenChildren;
            parentCandidates = d.parentCandidatesObjectsLM;
          } else {
            children = d.foundChildren;
            parentCandidates = d.parentCandidatesObjectsRM;
          }
          children.forEach(function(child) {
            if (
              sortedOutRelations.indexOf(child.parentId + child.childId) === -1
            ) {
              var search = true;
              if (ThreadReconstructionSettingsData.getShowAgreement()) {
                if (!child.theSameForBothModels) {
                  search = false;
                }
              }
              if (search) {
                if (child.classifierResult === null) {
                  classifierResult = 0;
                } else {
                  classifierResult =
                    child.classifierResult.classifierProbabilityTrue;
                }
                if (parentToChildren[child.childId] !== undefined) {
                  if (parentToChildren[child.parentId][0] !== undefined) {
                    childToParentCandidates[child.childId].push(child.parentId);
                    sumOfScores.push(child.sumOfScores);
                    parentToChildren[child.parentId][0].push({
                      id: child.childId,
                      theSameAsGiven: child.theSameAsGiven,
                      transitiveSameAsGiven: child.transitiveSameAsGiven,
                      sumOfScores: child.sumOfScores,
                      classifierScore: classifierResult,
                      featureValues: child.numericalContinuousFeatureToValue,
                      featureAgreementList: child.featureAgreementList
                    });
                    childToPreviousPosition[child.childId] =
                      childToPreviousPosition[child.childId] + 1;
                    child.temporalFeatureAgreementList.forEach(function(
                      feature
                    ) {
                      if (
                        parentToParentChildFeatures[child.parentId].indexOf(
                          feature
                        ) === -1
                      ) {
                        parentToParentChildFeatures[child.parentId].push(
                          feature
                        );
                      }
                    });
                  }
                }
              }
            }
          });

          parentCandidates.forEach(function(candidate, i) {
            var parentChildId = "";
            if (isLeftModel) {
              parentChildId = d.givenParentId + d.id;
            } else {
              parentChildId = d.foundParentId + d.id;
            }
            if (sortedOutRelations.indexOf(parentChildId) === -1) {
              var search = true;
              if (ThreadReconstructionSettingsData.getShowAgreement()) {
                if (!candidate.theSameForBothModels) {
                  search = false;
                }
              }
              if (search) {
                if (candidate.classifierResult === null) {
                  classifierResult = 0;
                } else {
                  classifierResult =
                    candidate.classifierResult.classifierProbabilityTrue;
                }
                var pos = childToPreviousPosition[candidate.childId] + 1;
                if (parentToChildren[candidate.childId] !== undefined) {
                  if (parentToChildren[candidate.parentId] !== undefined) {
                    if (
                      parentToChildren[candidate.parentId][pos] !== undefined
                    ) {
                      childToParentCandidates[d.id].push(candidate.parentId);
                      sumOfScores.push(candidate.sumOfScores);
                      parentToChildren[candidate.parentId][pos].push({
                        id: d.id,
                        theSameAsGiven: candidate.theSameAsGiven,
                        transitiveSameAsGiven: candidate.transitiveSameAsGiven,
                        sumOfScores: candidate.sumOfScores,
                        classifierScore: classifierResult,
                        featureValues:
                          candidate.numericalContinuousFeatureToValue,
                        featureAgreementList: candidate.featureAgreementList
                      });
                      candidate.temporalFeatureAgreementList.forEach(function(
                        feature
                      ) {
                        if (
                          parentToParentChildFeatures[
                            candidate.parentId
                          ].indexOf(feature) === -1
                        ) {
                          parentToParentChildFeatures[candidate.parentId].push(
                            feature
                          );
                        }
                      });
                      childToPreviousPosition[candidate.childId] =
                        childToPreviousPosition[candidate.childId] + 1;
                    }
                  }
                }

                if (
                  candidate.numericalContinuousFeatureToValue[timeFeat] >
                  maxTime
                ) {
                  maxTime =
                    candidate.numericalContinuousFeatureToValue[timeFeat];
                }
              }
            }
          });
        });

        scaleLinkOpacity = d3.scale
          .sqrt()
          .domain([d3.min(sumOfScores), d3.max(sumOfScores)])
          .range([0.8, 0.8]);

        scaleLinkWidth = d3.scale
          .sqrt()
          .domain([d3.min(sumOfScores), d3.max(sumOfScores)])
          .range([3, 3]);

        normalizeSumOfScores = d3.scale
          .sqrt()
          .domain([d3.min(sumOfScores), d3.max(sumOfScores)])
          .range([0, 1]);

        colorScale = d3.scale
          .linear()
          .domain([2, maxPosition + 1])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb("black"), d3.rgb("white")]);

        d3.selection.prototype.moveToBack = function() {
          return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
              this.parentNode.insertBefore(this, firstChild);
            }
          });
        };

        return parentToChildren;
      };

      var showButtonToStoreSelectedRelations = function() {
        var coordinates = d3.mouse(d3.select("body").node());
        $("#relationSelectionDiv").show();
        $("#relationSelectionDiv").css({
          left: coordinates[0],
          top: coordinates[1]
        });
      };

      var createBrushSelection = function(container) {
        container.on("contextmenu", function() {
          container
            .select("#forestG")
            .append("g")
            .attr("class", "tempg")
            .call(brush);
          d3.event.preventDefault();
        });

        function brushed() {}

        function brushend() {
          storedRelations = [];
          extent = d3.event.target.extent();
          container.selectAll(".parentChildSpaceCircle").each(function(d) {
            //if(d3.select(this).classed('selectedParentChildSpaceCircle') === false) {
            if (
              extent[0][0] <= d.x &&
              d.x < extent[1][0] &&
              extent[0][1] <= d.y &&
              d.y < extent[1][1]
            ) {
              console.log(d);
              storedRelations.push({ parent: d.parent, child: d.id });
              d3.select(this).classed("selectedParentChildSpaceCircle", true);
            }
            //}
          });
          $rootScope.$broadcast("storedRelations", storedRelations);
          showButtonToStoreSelectedRelations();
          brush.clear();
        }

        var brush = d3.svg
          .brush()
          .x(d3.scale.identity().domain([0, 10000]))
          .y(d3.scale.identity().domain([0, 10000]))
          .on("brushstart", brushed)
          .on("brushend", brushend);

        var extent = brush.extent();
      };

      var addFoundParent = function(
        parentToChildren,
        container,
        originalYPos,
        xStart,
        messages,
        location
      ) {
        //for each parent

        var dataCircles = [];
        var dataRows = [];
        var xPos, yPos;
        var parentCandidates = [];

        Object.keys(parentToChildren).forEach(function(parent) {
          if (Object.keys(parentToChildren[parent]).length !== 0) {
            dataRows.push({
              parent: parent,
              yPos: originalYPos[parent],
              rowLength:
                parseInt(
                  Object.keys(parentToChildren[parent])[
                    Object.keys(parentToChildren[parent]).length - 1
                  ]
                ) + 1
            });
          }

          // those are all bins (0-max) of children
          var children = parentToChildren[parent];
          //for each bin
          Object.keys(children).forEach(function(position) {
            position = parseInt(position);
            if (posX[position] === undefined) {
              posX[position] = {};
              posY[position] = {};
            }
            //get all children visiting this parent
            var candidates = children[position];
            // for each child in the particular bin
            candidates.forEach(function(candidate, i) {
              //get x y positions for circles
              xPos = xStart + position * space + space + i * 20;
              yPos = originalYPos[parent];

              if ((i + 1) * 20 - space > 0) {
                yPos = yPos + 20 * Math.floor((i * 20) / space);
                var tempi =
                  i - Math.ceil(space / 20) * Math.floor((i * 20) / space);
                xPos = xStart + position * space + space + tempi * 20;
              }
              posX[position][candidate.id] = xPos;
              posY[position][candidate.id] = yPos;
              if (isLeftModel) {
                parentCandidates = container
                  .select("#messageCircleGForest" + candidate.id)
                  .node().__data__.parentCandidatesObjectsLM;
              } else {
                parentCandidates = container
                  .select("#messageCircleGForest" + candidate.id)
                  .node().__data__.parentCandidatesObjectsRM;
              }
              dataCircles.push({
                id: candidate.id,
                xPos: xPos,
                yPos: yPos,
                radius: container.select("#circle" + candidate.id).attr("r"),
                parentCandidatesWithoutTitle: parentCandidates,
                foundParentId: container
                  .select("#messageCircleGForest" + candidate.id)
                  .node().__data__.foundParentId,
                position: position,
                parent: parent,
                originalYPos: originalYPos[candidate.id],
                theSameAsGiven: candidate.theSameAsGiven,
                transitiveSameAsGiven: candidate.transitiveSameAsGiven,
                sumOfScores: candidate.sumOfScores,
                classifierScore: candidate.classifierScore,
                featureValues: candidate.featureValues,
                featureAgreementList: candidate.featureAgreementList
              });
            });
          });
        });

        var dataLines = [];
        Object.keys(parentToChildren).forEach(function(parent) {
          // those are all bins (0-max) of children
          var children = parentToChildren[parent];
          var previousPosition = 0;
          //for each bin
          Object.keys(children).forEach(function(position) {
            position = parseInt(position);
            //get all children visiting this parent
            var candidates = children[position];
            // for each child in the particular bin
            candidates.forEach(function(candidate, i) {
              var y1 = 0;
              var x1 = 0;

              //draw line connecting this circle with the previous one being in the previous bin
              if (position > 0) {
                var listY = posY[position - 1];
                var listX = posX[position - 1];
                y1 = listY[candidate.id];
                x1 = listX[candidate.id];

                xPos = xStart + position * space + space + i * 20;
                yPos = originalYPos[parent];

                if ((i + 1) * 20 - space > 0) {
                  yPos = yPos + 20 * Math.floor((i * 20) / space);
                  var tempi =
                    i - Math.ceil(space / 20) * Math.floor((i * 20) / space);
                  xPos = xStart + position * space + space + tempi * 20;
                }
                if (isLeftModel) {
                  parentCandidates = container
                    .select("#messageCircleGForest" + candidate.id)
                    .node().__data__.parentCandidatesObjectsLM;
                } else {
                  parentCandidates = container
                    .select("#messageCircleGForest" + candidate.id)
                    .node().__data__.parentCandidatesObjectsRM;
                }
                dataLines.push({
                  id: candidate.id,
                  xPos1: x1,
                  xPos2: xPos,
                  yPos1: y1,
                  yPos2: yPos,
                  parentCandidatesWithoutTitle: parentCandidates,
                  foundParentId: container
                    .select("#messageCircleGForest" + candidate.id)
                    .node().__data__.foundParentId,
                  position: position,
                  parent: parent,
                  positionInRow: i,
                  originalYPos: originalYPos[candidate.id],
                  theSameAsGiven: candidate.theSameAsGiven,
                  transitiveSameAsGiven: candidate.transitiveSameAsGiven,
                  sumOfScores: candidate.sumOfScores,
                  featureValues: candidate.featureValues,
                  featureAgreementList: candidate.featureAgreementList
                });
              }
            });
            previousPosition = position;
          });
        });
        createObjects(
          container,
          dataCircles,
          dataLines,
          dataRows,
          xStart,
          messages,
          originalYPos
        );
      };

      var createObjects = function(
        container,
        dataCircles,
        dataLines,
        dataRows,
        xStart,
        messages,
        originalYPos
      ) {
        container
          .select("#forestG")
          .selectAll(".dataLinesCandidateSpace")
          .data(dataLines)
          .enter()
          .append("line")
          .attr("id", function(d) {
            return "parentChildSpaceLine" + d.position + d.id;
          })
          .attr("class", function(d) {
            var className =
              "parentChildSpaceLineAfterFirst parentChildSpaceLine parentChildSpaceLine" +
              d.id;
            if (d.theSameAsGiven) {
              className += " theSameAsGiven";
              if (ThreadReconstructionSettingsData.getShowTrueRelations()) {
                className += " theSameAsGivenShow";
              }
            }
            return className;
          })
          .attr("x1", function(d) {
            return d.xPos1;
          })
          .attr("x2", function(d) {
            return d.xPos2;
          })
          .attr("y1", function(d) {
            return d.yPos1;
          })
          .attr("y2", function(d) {
            return d.yPos2;
          })
          .attr("pointer-events", "all")
          .on("mouseover", function(d) {
            highlightOnePath(
              container,
              ".parentChildSpaceLine" + d.id,
              d.id,
              d.parentCandidatesWithoutTitle
            );
            showCandidateScores(dataCircles, d.id, container, d.position);
            showSummaryOfPath(
              d.parentCandidatesWithoutTitle,
              messages,
              d.id,
              d.foundParentId
            );
          })
          .on("mouseleave", function(d) {
            disHighlightOnePath(container, ".parentChildSpaceLine" + d.id);
          });
        //.style('opacity', function(d){return scaleLinkOpacity(d.sumOfScores);});
        //.style('stroke-width', function(d){return scaleLinkWidth(d.sumOfScores);});

        var coloredPaths = [];
        var coloredPathsBlue = [];
        var toggleClick = false;
        container
          .select("#forestG")
          .selectAll(".dataCirclesCandidateSpace")
          .data(dataCircles)
          .enter()
          .append("circle")
          .attr("class", function(d) {
            var className = "parentChildSpaceCircle";
            if (d.theSameAsGiven) {
              className += " theSameAsGiven";
              if (ThreadReconstructionSettingsData.getShowTrueRelations()) {
                className += " theSameAsGivenShow";
              }
            }
            return className;
          })
          .attr("id", function(d) {
            return "parentChildSpaceCircle" + d.position + d.id;
          })
          .attr("cx", function(d) {
            d.x = d.xPos;
            return d.xPos;
          })
          .attr("cy", function(d) {
            d.y = d.yPos;
            return d.yPos;
          })
          .attr("r", function(d) {
            return d.radius;
          })
          .attr("pointer-events", "all")
          .on("mouseover", function(d) {
            //highlightRow(container, posY[d.position][d.id], xStart, parseInt(Object.keys(parentToChildren[d.position])[Object.keys(parentToChildren[d.position]).length-1])+1);
            highlightOnePath(
              container,
              ".parentChildSpaceLine" + d.id,
              d.id,
              d.parentCandidatesWithoutTitle
            );
            showCandidateScores(dataCircles, d.id, container, d.position);
            showSummaryOfPath(
              d.parentCandidatesWithoutTitle,
              messages,
              d.id,
              d.foundParentId
            );
          })
          .on("mouseleave", function(d) {
            disHighlightOnePath(container, ".parentChildSpaceLine" + d.id);
          })
          .style("fill", function(d) {
            var found = false;
            ThreadReconstructionSettingsData.getStoredRelations().forEach(
              function(relation) {
                if (relation.parent === d.parent && relation.child === d.id) {
                  found = true;
                }
              }
            );
            if (d.theSameAsGiven) {
              if (d.position > 0) {
                colorPath(d.id, d.position, container);
                coloredPathsBlue.push(d.id);
              } else {
                coloredPaths.push(d.id);
              }
            }
            if (found) {
              return "#2db92d";
            } else {
              return "#848587";
            }
            //return '#848587';
            //if(d.transitiveSameAsGiven){return '#BFBA39';}
          })
          .on("click", function(d) {
            if (toggleClick) {
              d3.selectAll(".parentChildSpaceLine").classed(
                "fadedOutElement",
                false
              );
              d3.selectAll(
                ".relationPath, .relationPathGiven, .relationPathForest, .relationPathGivenForest"
              ).classed("fadedOutPath", false);
              toggleClick = false;
            } else {
              /** fade out other relations in parent child space */
              d3.selectAll(".parentChildSpaceLine").classed(
                "fadedOutElement",
                true
              );
              d3.selectAll(".parentChildSpaceLine" + d.id).classed(
                "fadedOutElement",
                false
              );
              d3.selectAll(
                ".relationPath, .relationPathGiven, .relationPathForest, .relationPathGivenForest"
              ).classed("fadedOutPath", true);
              d3.selectAll(
                "#relationPathGiven" +
                  d.foundParentId +
                  d.id +
                  ", #relationPathGivenForest" +
                  d.foundParentId +
                  d.id
              ).classed("fadedOutPath", false);
              d3.selectAll(
                "#relationPath" +
                  d.foundParentId +
                  d.id +
                  ", #relationPathForest" +
                  d.foundParentId +
                  d.id
              ).classed("fadedOutPath", false);
              toggleClick = true;
            }
          });

        var dataFirstLines = [];
        messages.forEach(function(message) {
          if (
            container.select("#parentChildSpaceCircle0" + message.id)[0][0] !==
            null
          ) {
            dataFirstLines.push(message);
          }
        });

        container
          .select("#forestG")
          .selectAll(".firstLines")
          .data(dataFirstLines)
          .enter()
          .append("line")
          .attr("id", function(d) {
            return "parentChildSpaceLine0" + d.id;
          })
          .attr("class", function(d) {
            var className =
              "parentChildSpaceLineFirst parentChildSpaceLine parentChildSpaceLine" +
              d.id;
            if (coloredPaths.indexOf(d.id) > -1) {
              if (d3.select("#parentChildSpaceCircle1" + d.id)[0][0] !== null) {
                className += " theSameAsGiven";
                if (
                  ThreadReconstructionSettingsData.getShowTrueRelations() ===
                  true
                ) {
                  className += " theSameAsGivenShow";
                }
              }
            }
            return className;
          })
          .attr("x1", positionForFirstNodes)
          .attr("x2", function(d) {
            return container
              .select("#parentChildSpaceCircle0" + d.id)
              .attr("cx");
          })
          .attr("y1", function(d) {
            return originalYPos[d.id];
          })
          .attr("y2", function(d) {
            return container
              .select("#parentChildSpaceCircle0" + d.id)
              .attr("cy");
          })
          .style("stroke", function(d) {
            results.allFound++;
            if (coloredPaths.indexOf(d.id) > -1) {
              results.truePositives++;
              if (d3.select("#parentChildSpaceCircle1" + d.id)[0][0] === null) {
                if (
                  ThreadReconstructionSettingsData.getShowTrueRelations() ===
                  true
                ) {
                  return "url(" + location + "#oneWayGradientColor)";
                } else {
                  return "url(" + location + "#oneWayGradient)";
                }
              }
            } else if (coloredPathsBlue.indexOf(d.id) > -1) {
              if (d3.select("#parentChildSpaceCircle1" + d.id)[0][0] === null) {
                return "url(" + location + "#oneWayGradientColorBlue)";
              } else {
                if (ThreadReconstructionSettingsData.getShowTrueRelations()) {
                  return "#A17200";
                }
              }
            } else {
              if (d3.select("#parentChildSpaceCircle1" + d.id)[0][0] === null) {
                return "url(" + location + "#oneWayGradient)";
              }
            }
          })
          .style("stroke-width", 15)
          .on("mouseover", function(d) {
            showCandidateScores(dataCircles, d.id, container, d.position);
            var parentCandidates = [];
            if (isLeftModel) {
              parentCandidates = container
                .select("#messageCircleGForest" + d.id)
                .node().__data__.parentCandidatesObjectsLM;
            } else {
              parentCandidates = container
                .select("#messageCircleGForest" + d.id)
                .node().__data__.parentCandidatesObjectsRM;
            }
            highlightOnePath(
              container,
              ".parentChildSpaceLine" + d.id,
              d.id,
              parentCandidates
            );
            showSummaryOfPath(
              parentCandidates,
              messages,
              d.id,
              d.foundParentId
            );
          })
          .on("mouseleave", function(d) {
            disHighlightOnePath(container, ".parentChildSpaceLine" + d.id);
          });

        container
          .select("#forestG")
          .selectAll(".parentRows")
          .data(dataRows)
          .enter()
          .append("rect")
          .attr("id", function(d) {
            return "rowRect" + d.parent;
          })
          .attr("class", "parentCandidateRow rowRect")
          .attr("x", xStart)
          .attr("y", function(d) {
            return d.yPos - 2;
          })
          .attr("width", function(d) {
            return d.rowLength * space;
          })
          .attr("height", 4)
          .style("fill", "#D8D8D8")
          .style("opacity", 0.1);
        //.on('mouseover', function(d){return highlightRow(container, d.parent);})
        //.on('mouseout', function(){return disHighlightRow(container);})

        container
          .select("#forestG")
          .selectAll(".parentRowsShort")
          .data(dataRows)
          .enter()
          .append("rect")
          .attr("class", "parentCandidateRow rowRect")
          .attr("x", xStart)
          .attr("y", function(d) {
            return d.yPos - 2;
          })
          .attr("width", 300)
          .attr("height", 4)
          .style("fill", "#D8D8D8")
          .style("opacity", 0.1)
          .on("mouseover", function(d) {
            return highlightRow(container, d.parent);
          })
          .on("mouseout", function() {
            return disHighlightRow(container);
          });

        d3.selection.prototype.moveToFront = function() {
          return this.each(function() {
            this.parentNode.appendChild(this);
          });
        };

        d3.selectAll(".parentChildSpaceCircle").moveToFront();
        d3.selectAll(".messageCircleGForest").moveToFront();
        d3.selectAll(".parentChildSpaceCircle")
          .data(dataCircles)
          .exit()
          .remove();
        d3.selectAll(".parentChildSpaceLineAfterFirst")
          .data(dataLines)
          .exit()
          .remove();
        d3.selectAll(".parentChildSpaceLineFirst")
          .data(dataFirstLines)
          .exit()
          .remove();
        d3.selectAll(".parentCandidateRow")
          .data(dataRows)
          .exit()
          .remove();
        d3.selectAll(".titleMessageNode")
          .data([title])
          .exit()
          .remove();
        d3.selectAll(".parentChildSpaceCircleFirst").moveToFront();
      };

      var colorPath = function(candidate, position, container) {
        position = parseInt(position);
        for (var i = 0; i < position + 1; i++) {
          if (ThreadReconstructionSettingsData.getShowTrueRelations()) {
            container
              .selectAll("#parentChildSpaceLine" + i + candidate)
              .style("stroke", "#A17200");
          }
        }
      };

      var highlightRow = function(container, parent) {
        container
          .selectAll(".parentChildSpaceLine")
          .classed("dishighlightedCandidatePath", true);
        //when mouse over message in the forest, highlight the whole row and connections in the forest
        container.select("#rowRect" + parent).style("opacity", 0.5);
        d3.selectAll(".featureForeign").style("opacity", 0.1);
        d3.selectAll(".featureForeign" + parent).style("opacity", 1);
        d3.selectAll(".featureIconDiv" + parent)
          .transition()
          .delay(0)
          .duration(600)
          .style("width", 25 + "px")
          .style("height", 25 + "px")
          .style("border", "thin solid black");
        d3.selectAll(".featureIconImg" + parent)
          .transition()
          .delay(0)
          .duration(600)
          .attr("width", 14 + "px")
          .attr("height", 14 + "px")
          .style("margin-top", 5 + "px")
          .style("margin-left", 4 + "px");
      };

      var disHighlightRow = function(container) {
        container
          .selectAll(".parentChildSpaceLine")
          .classed("dishighlightedCandidatePath", false);
        container.selectAll(".rowRect").style("opacity", 0.1);
        d3.selectAll(".featureForeign").style("opacity", 1);
        d3.selectAll(".featureIconDiv")
          .transition()
          .duration(200)
          .style("width", 16 + "px")
          .style("height", 16 + "px")
          .style("border", "none");
        d3.selectAll(".featureIconImg")
          .transition()
          .duration(200)
          .attr("width", 10 + "px")
          .attr("height", 10 + "px")
          .style("margin-top", -2 + "px")
          .style("margin-left", 3 + "px");
      };

      var highlightOnePath = function(
        container,
        classname,
        candidate,
        parentCandidates
      ) {
        //highlightFirstLine(container, classname, candidate, y1, x1, pathWidth);
        highlightInForest(container, candidate, parentCandidates);
        highlightFeatures(candidate);
        container
          .selectAll(".parentChildSpaceLine:not(" + classname + ")")
          .classed("dishighlightedCandidatePath", true);
        container
          .selectAll(classname)
          .classed("highlightedCandidatePath", true);
        //container.selectAll(classname).style('opacity', 1);
      };

      var highlightFirstLine = function(
        container,
        classname,
        candidate,
        y1,
        x1,
        pathWidth
      ) {
        container
          .select("#forestG")
          .append("line")
          .attr(
            "class",
            "parentChildSpaceLine parentChildSpaceFirstLine parentChildSpaceLine" +
              candidate
          )
          .attr("id", "parentChildSpaceLine" + candidate)
          .attr("x1", x1)
          .attr(
            "x2",
            container.select("#parentChildSpaceCircle0" + candidate).attr("cx")
          )
          .attr("y1", y1)
          .attr(
            "y2",
            container.select("#parentChildSpaceCircle0" + candidate).attr("cy")
          )
          .style("stroke-width", pathWidth)
          .style("stroke", function() {
            if (
              container
                .select("#parentChildSpaceLine0" + candidate)
                .style("stroke") ===
              'url("/threadReconstruction#oneWayGradientColor")'
            ) {
              return "#54CDC2";
            }
          });

        container.selectAll(".parentChildSpaceFirstLine").moveToBack();
      };

      var highlightInForest = function(container, candidate, parentCandidates) {
        var parents = childToParentCandidates[candidate];
        d3.selectAll(".relationPathForest").classed("fadeOutRelation", true);
        parents.forEach(function(parent) {
          container
            .select("#relationPathForest" + parent + candidate)
            .classed("fadeOutRelation", false);
        });

        d3.selectAll(".relationPathGivenForest").classed(
          "fadeOutRelation",
          true
        );
        parents.forEach(function(parent) {
          container
            .select("#relationPathGivenForest" + parent + candidate)
            .classed("fadeOutRelation", false);
        });

        d3.selectAll(".messageCircleGForest").classed("fadeOutRelation", true);
        parents.forEach(function(parent) {
          container
            .select("#messageCircleGForest" + parent)
            .classed("fadeOutRelation", false);
          container
            .select("#messageCircleGForest" + candidate)
            .classed("fadeOutRelation", false);
        });

        parentCandidates.forEach(function(parent) {
          container
            .select("#messageCircleGForest" + parent.parentId)
            .classed("fadeOutRelation", false);
        });
      };

      var highlightFeatures = function(candidate) {
        d3.selectAll(".featureForeign").style("opacity", 0.1);
        d3.selectAll(".featureName").style("opacity", 0.1);
        var featureCounts = {};
        childToParentCandidates[candidate].forEach(function(parent) {
          d3.selectAll(".featureForeign" + parent).style("opacity", 1);
          //transition for feature subset
          d3.selectAll(".featureForeign" + parent).each(function(d) {
            if (featureCounts[d.feature] === undefined) {
              featureCounts[d.feature] = 1;
            } else {
              featureCounts[d.feature] = featureCounts[d.feature] + 1;
            }
          });
        });
        var subset = [];
        Object.keys(featureCounts).forEach(function(feature) {
          if (
            childToParentCandidates[candidate].length === featureCounts[feature]
          ) {
            subset.push(feature);
          }
        });

        //show feature subset with transition
        subset.forEach(function(feature) {
          childToParentCandidates[candidate].forEach(function(parent) {
            //highlight names
            d3.selectAll("#featureName" + feature)
              .style("opacity", 1)
              .style("font-weight", "bold");
            //highlight icons
            d3.selectAll(".featureIconDiv" + feature + parent)
              .transition()
              .delay(0)
              .duration(600)
              .style("width", 25 + "px")
              .style("height", 25 + "px")
              .style("border", "thin solid black");
            d3.selectAll(".featureIconImg" + feature + parent)
              .transition()
              .delay(0)
              .duration(600)
              .attr("width", 14 + "px")
              .attr("height", 14 + "px")
              .style("margin-top", 5 + "px")
              .style("margin-left", 4 + "px");
          });
        });
      };

      var dishighlightFeatures = function() {
        d3.selectAll(".featureIconDiv")
          .transition()
          .duration(200)
          .style("width", 16 + "px")
          .style("height", 16 + "px")
          .style("border", "none");
        d3.selectAll(".featureIconImg")
          .transition()
          .duration(200)
          .attr("width", 10 + "px")
          .attr("height", 10 + "px")
          .style("margin-top", -2 + "px")
          .style("margin-left", 3 + "px");

        d3.selectAll(".featureName")
          .style("opacity", 1)
          .style("font-weight", "normal");
      };

      var disHighlightOnePath = function(container, id) {
        container
          .selectAll(".parentChildSpaceLine")
          .classed("dishighlightedCandidatePath", false);
        container.selectAll(id).classed("highlightedCandidatePath", false);
        container.selectAll(".parentChildSpaceFirstLine").remove();
        d3.selectAll(".relationPathForest").classed("fadeOutRelation", false);
        d3.selectAll(".featureForeign").style("opacity", 1);
        dishighlightFeatures();
        d3.selectAll(".textForScore").remove();
        d3.selectAll(".featureToRemove").remove();
        d3.selectAll(".messageCircleGForest").classed("fadeOutRelation", false);
      };

      var showSummaryOfPath = function(
        parentCandidates,
        messages,
        childId,
        parentId
      ) {
        angular.element("#parentCandidateSummaryView").empty();
        var text = "";

        messages.forEach(function(message) {
          if (message.id === childId) {
            text +=
              "<h3>CHILD:</h3>" +
              ThreadReconstructionSelectedMessage.getMessage(message);
          }
        });

        messagesWithTitle.forEach(function(message) {
          if (message.id === parentId) {
            text +=
              "<h3>PARENT:</h3>" +
              ThreadReconstructionSelectedMessage.getMessage(message);
          }
        });

        text += "<h3>PARENT CANDIDATES:</h3>";
        parentCandidates.forEach(function(candidate) {
          messagesWithTitle.forEach(function(message) {
            if (message.id === candidate.parentId) {
              //text += '<h5>SCORE:'+ normalizeSumOfScores(candidate.sumOfScores).toFixed(2) +'</h5>';
              text += ThreadReconstructionSelectedMessage.getMessage(message);
            }
          });
        });

        angular.element("#parentCandidateSummaryView").append(text);
        $compile(text)($rootScope);

        if (ThreadReconstructionSettingsData.getQueryData() !== undefined) {
          ThreadReconstructionSettingsData.getQueryData().forEach(function(
            data
          ) {
            if (data.dataType === "structure") {
              d3.selectAll(".messageContentInBottomDiv." + data.name).classed(
                "coloredWordOccurrences",
                true
              );
            }
          });
        }
      };

      var showCandidateScores = function(
        parentCandidates,
        childId,
        container,
        position
      ) {
        if (ThreadReconstructionSettingsData.getCurrentClassifier() !== "") {
          parentCandidates.forEach(function(child) {
            if (child.id === childId) {
              container
                .select("#forestG")
                .append("text")
                .text(function(d) {
                  return child.classifierScore.toFixed(2);
                })
                .attr("class", "textForScore")
                .attr("x", function(d) {
                  return child.xPos - 120;
                })
                .attr("y", function(d) {
                  return child.yPos - 10;
                })
                .style("font-size", 60)
                .style("font-weight", "bold");
            }
          });
        }

        parentCandidates.forEach(function(child) {
          if (child.id === childId) {
            var list = [];
            var fList = ThreadReconstructionSettingsData.getFeatureDataRM();
            if (ThreadReconstructionSettingsData.isLeftModel()) {
              fList = ThreadReconstructionSettingsData.getFeatureDataLM();
            }
            var fToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesRM();
            if (ThreadReconstructionSettingsData.isLeftModel()) {
              fToCategories = ThreadReconstructionSettingsData.getFeaturesToCategoriesLM();
            }
            fList.forEach(function(f) {
              if (child.featureAgreementList.indexOf(f) > -1) {
                if (child.featureValues[f] > 0) {
                  list.push(f);
                }
              }
            });
            var i = 0;
            list.forEach(function(feature) {
              if (fList.indexOf(feature) > -1) {
                if (fToCategories[feature].usedInQuery) {
                  container
                    .select("#forestG")
                    .append("foreignObject")
                    .attr("class", function(d) {
                      return "featureToRemove";
                    })
                    .attr("x", function(d) {
                      return child.xPos + 32 * i;
                    })
                    .attr("y", function(d) {
                      return child.yPos - 40;
                    })
                    .attr("width", 30)
                    .attr("height", 30)
                    .append("xhtml:div")
                    .style("font", "14px 'Helvetica Neue'")
                    .html(function() {
                      var className = "";
                      if (fToCategories[feature].usedInQuery) {
                        className +=
                          fToCategories[feature].category + "IconBackground";
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

                  if (feature in child.featureValues) {
                    if (child.featureValues[feature] > 0) {
                      if (fToCategories[feature].category === "content") {
                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr("height", 60)
                          .style("fill", "#DD8A95")
                          .style("stroke", "#DD8A95");

                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr(
                            "height",
                            Math.min(
                              60 * (1 - child.featureValues[feature]),
                              58
                            )
                          )
                          .style("fill", "white")
                          .style("stroke", "#DD8A95");

                        container
                          .select("#forestG")
                          .append("text")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 102;
                          })
                          .text(child.featureValues[feature].toFixed(2))
                          .style("font-size", "8");
                      } else if (feature === "DISTANCE") {
                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr("height", 60)
                          .style("fill", "#AF6E9B")
                          .style("stroke", "#AF6E9B");

                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr(
                            "height",
                            Math.min(
                              60 *
                                (1 -
                                  child.featureValues[feature] /
                                    messagesWithTitle.length),
                              58
                            )
                          )
                          .style("fill", "white")
                          .style("stroke", "#AF6E9B");

                        container
                          .select("#forestG")
                          .append("text")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 102;
                          })
                          .text(child.featureValues[feature].toFixed(2))
                          .style("font-size", "8");
                      } else if (feature === "TIME_DISTANCE") {
                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr("height", 60)
                          .style("fill", "#AF6E9B")
                          .style("stroke", "#AF6E9B");

                        container
                          .select("#forestG")
                          .append("rect")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 100;
                          })
                          .attr("width", 20)
                          .attr(
                            "height",
                            Math.min(
                              60 * (1 - child.featureValues[feature] / maxTime),
                              58
                            )
                          )
                          .style("fill", "white")
                          .style("stroke", "#AF6E9B");

                        container
                          .select("#forestG")
                          .append("text")
                          .attr("class", function(d) {
                            return "featureToRemove";
                          })
                          .attr("x", child.xPos + 32 * i + 5)
                          .attr("y", function(d) {
                            return child.yPos - 102;
                          })
                          .text(child.featureValues[feature].toFixed(2))
                          .style("font-size", "8");
                      }
                    }
                  }
                  i++;
                }
              }
            });
          }
        });
      };

      var showSummaryOfParent = function(
        messages,
        parentId,
        container,
        originalYPos,
        xStart
      ) {
        highlightRow(container, parentId);

        angular.element("#parentCandidateSummaryView").empty();
        var text = "";

        var foundChildrenIds = [];
        var children = [];
        messages.forEach(function(message) {
          if (message.id === parentId) {
            text +=
              "<h3>PARENT:</h3>" +
              ThreadReconstructionSelectedMessage.getMessage(message);
            text += "<h3>CHILDREN:</h3>";
            if (isLeftModel) {
              children = message.givenChildren;
            } else {
              children = message.foundChildren;
            }
            children.forEach(function(child) {
              foundChildrenIds.push(child.childId);
              messagesWithTitle.forEach(function(messageChild) {
                if (messageChild.id === child.childId) {
                  text += ThreadReconstructionSelectedMessage.getMessage(
                    messageChild
                  );
                }
              });
            });
          }
        });

        text += "<h3>CHILD CANDIDATES:</h3>";

        if (parentToChildren[parentId] !== undefined) {
          var children = parentToChildren[parentId];
          //for each bin
          Object.keys(children).forEach(function(position) {
            position = parseInt(position);
            //get all children visiting this parent
            var candidates = children[position];
            // for each child in the particular bin
            candidates.forEach(function(candidate) {
              if (foundChildrenIds.indexOf(candidate.id) === -1) {
                messagesWithTitle.forEach(function(message) {
                  if (message.id === candidate.id) {
                    //text += '<h5>SCORE:' + normalizeSumOfScores(candidate.sumOfScores).toFixed(2) + '</h5>';
                    text += ThreadReconstructionSelectedMessage.getMessage(
                      message
                    );
                  }
                });
              } else {
                //console.log(candidate.sumOfScores);
              }
            });
          });
        }

        angular.element("#parentCandidateSummaryView").append(text);
        $compile(text)($rootScope);

        if (ThreadReconstructionSettingsData.getQueryData() !== undefined) {
          ThreadReconstructionSettingsData.getQueryData().forEach(function(
            data
          ) {
            if (data.dataType === "structure") {
              d3.selectAll(".messageContentInBottomDiv." + data.name).classed(
                "coloredWordOccurrences",
                true
              );
            }
          });
        }
      };

      var addTitleNode = function(
        container,
        titleMessage,
        originalYPos,
        properties,
        scale
      ) {
        var g = container
          .select("#forestG")
          .selectAll(".titleMessage")
          .data([titleMessage])
          .enter()
          .append("g")
          .attr("class", function(d) {
            return "messageCircleG messageCircleGForest titleMessageNode";
          })
          .attr("id", function(d) {
            return "messageCircleGForest" + d.id;
          })
          .attr("transform", function(d, i) {
            originalYPos[d.id] =
              properties.yStart +
              i * properties.nodeHeight +
              properties.nodePadding -
              150;
            return (
              "translate(" +
              properties.messageWidth +
              "," +
              (properties.yStart +
                i * properties.nodeHeight +
                properties.nodePadding -
                150) +
              ")"
            );
          })
          .on("mouseover", function(d) {
            showSummaryOfParent(
              [titleMessage],
              d.id,
              container,
              originalYPos,
              properties.messageWidth
            );
          });

        g.append("text")
          .text("TITLE")
          .style("font-size", 25)
          .attr("x", -30)
          .attr("y", -5);

        g.append("circle")
          .attr("class", "messageCircleForest")
          .attr("id", function(d) {
            return "circle" + d.id;
          })
          .attr("r", function(d) {
            return scale(d.scoreMap.MESSAGE_LENGTH);
          });
      };

      var showFeatures = function(
        container,
        messagesWithTitle,
        originalYPos,
        xStart
      ) {
        var featureData = ThreadReconstructionSettingsData.getData();
        var features = [];
        var featureToCategory = {};
        var fList = ThreadReconstructionSettingsData.getRightModelQueryData();
        if (ThreadReconstructionSettingsData.isLeftModel()) {
          fList = ThreadReconstructionSettingsData.getLeftModelQueryData();
        }
        Object.keys(featureData).forEach(function(category) {
          featureData[category].forEach(function(feature) {
            var found = false;
            fList.forEach(function(queryFeature) {
              if (queryFeature.name === feature.name) {
                found = true;
              }
            });
            features.push(feature.name);
            featureToCategory[feature.name] = {
              category: category,
              usedInQuery: found
            };
          });
        });

        var data = [];
        Object.keys(parentToParentChildFeatures).forEach(function(parent) {
          parentToParentChildFeatures[parent].forEach(function(feature) {
            data.push({
              feature: feature,
              xPos: xStart + 60 + 24 * features.indexOf(feature),
              yPos: originalYPos[parent] - 10,
              category: featureToCategory[feature].category,
              parent: parent,
              usedInQuery: featureToCategory[feature].usedInQuery
            });
          });
        });

        var dataForNames = [];
        features.forEach(function(feature) {
          dataForNames.push({
            feature: feature,
            xPos: xStart + 60 + 24 * features.indexOf(feature)
          });
        });

        //create tooltip
        ThreadReconstructionSettingsTooltip.createTooltipParentChildSpace(
          "threadReconstructionForestView"
        );
        container
          .select("#forestG")
          .selectAll(".featureIcon")
          .data(data)
          .enter()
          .append("foreignObject")
          .attr("class", function(d) {
            return (
              "featureForeign featureForeign" +
              d.parent +
              " featureForeign" +
              d.feature
            );
          })
          .attr("x", function(d) {
            return d.xPos;
          })
          .attr("y", function(d) {
            return d.yPos;
          })
          .attr("width", 20)
          .attr("height", 20)
          .on("mouseover", function(d) {
            return ThreadReconstructionSettingsTooltip.mouseOverParentChildSpace(
              d.feature
            );
          })
          .on("mousemove", function() {
            return ThreadReconstructionSettingsTooltip.mouseMoveParentChildSpace(
              parseInt(
                angular.element("#threadReconstructionForestView").scrollTop()
              ),
              parseInt(
                angular.element("#threadReconstructionForestView").scrollLeft()
              )
            );
          })
          .on("mouseout", function() {
            return ThreadReconstructionSettingsTooltip.mouseOutParentChildSpace();
          })
          .append("xhtml:div")
          .style("font", "14px 'Helvetica Neue'")
          .html(function(d) {
            var className = "";
            if (d.usedInQuery) {
              className += d.category + "IconBackground";
            } else {
              className += "grayIconBackground";
            }
            return (
              "<div class='iconBackgroundSmall " +
              className +
              " featureIconDiv featureIconDiv" +
              d.parent +
              " featureIconDiv" +
              d.feature +
              d.parent +
              "'><img class='featureIconImg featureIconImg" +
              d.parent +
              " featureIconImg" +
              d.feature +
              d.parent +
              "' src='svgIcons/threadIcons/" +
              d.feature +
              ".svg' height=10; width=10;></span></div>"
            );
          });

        showFeatureNames(container, dataForNames);
        d3.selectAll(".featureForeign")
          .data(data)
          .exit()
          .remove();
      };

      var showFeatureNames = function(container, features) {
        container
          .select("#forestG")
          .selectAll(".featureName")
          .data(features)
          .enter()
          .append("text")
          .attr("id", function(d) {
            return "featureName" + d.feature;
          })
          .attr("class", "featureName")
          .attr("x", function() {
            return 30;
          })
          .attr("y", function(d) {
            return d.xPos + 10;
          })
          .text(function(d) {
            return d.feature;
          })
          .style("text-anchor", "start")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-90)");

        d3.selectAll(".featureName")
          .data(features)
          .exit()
          .remove();
      };

      var updatePrecisionRecall = function() {
        messagesWithTitle.forEach(function(message) {
          message.givenChildren.forEach(function(child) {
            if (relevantMessageIds.indexOf(child.childId) > -1) {
              results.allGiven++;
            }
          });
        });
        var finalResults = {};
        finalResults.precision = results.truePositives / results.allFound;
        finalResults.recall = results.truePositives / results.allGiven;
        finalResults.fScore =
          (2 * finalResults.precision * finalResults.recall) /
          (finalResults.precision + finalResults.recall);
        if (
          isNaN(finalResults.precision) ||
          isNaN(finalResults.recall) ||
          isNaN(finalResults.fScore)
        ) {
          finalResults.precision = 0;
          finalResults.recall = 0;
          finalResults.fScore = 0;
        }
        if (ThreadReconstructionSettingsData.isLeftModel()) {
          $rootScope.$broadcast("statisticsChangedLeftModel", finalResults);
        } else {
          $rootScope.$broadcast("statisticsChangedRightModel", finalResults);
        }
      };

      // Public API here
      return {
        showSpace: showSpace,
        showSummaryOfParent: showSummaryOfParent,
        disHighlightRow: disHighlightRow,
        addTitleNode: addTitleNode
      };
    }
  ]);
