/**
 * @ngdoc service
 * @name visArgueClientApp.eventColorizer
 * @description
 * # eventColorizer
 * Factory in the visArgueClientApp.
 */
angular
  .module("visArgueClientApp")
  .factory("ihtmStreamingColorService", function($rootScope) {
    "use strict";

    var minSimilarity = 1;
    var maxSimilarity = 0;
    var varianceMap = new Map();
    var varianceToParentMap = new Map();
    var nodeSimilarityMap = new Map();

    let appliedSpecExecStrategy = undefined;

    var colorBrewerSet1 = [
      "#984ea3",
      "#4daf4a",
      "#377eb8",
      "#e41a1c",
      "#ff7f00",
      // '#ffff33',
      // '#a65628',
      "#f781bf",
      // '#999999',
      // '#cfffff',
      "#a6cee3",
      // '#1f78b4',
      "#b2df8a",
      // '#33a02c',
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
      "#6a3d9a",
      "#ffff99",
      "#b15928",
      "#8dd3c7",
      "#ffffb3",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#fccde5",
      "#d9d9d9",
      "#bc80bd",
      "#ccebc5",
      "#ffed6f",
      "#b3e2cd",
      "#fdcdac",
      "#cbd5e8",
      "#f4cae4",
      "#e6f5c9",
      "#fff2ae",
      "#f1e2cc"
    ];

    // const colors2 = [
    //   '#8dd3c7',
    //   '#bc80bd',
    //   '#80b1d3',
    //   '#fb8072',
    //   '#b3de69',
    //   '#fdb462',
    //   '#fccde5',
    //   '#d9d9d9',
    //   '#ccebc5',
    //   '#ffed6f',
    //   '#ffffb3',
    //   '#bebada'
    // ];

    function isObject(item) {
      return typeof item === "object" && !Array.isArray(item) && item !== null;
    }

    function getSpeakerName(node, index) {
      var speakers = node.childSpeakerIndex;
      if (speakers !== undefined) {
        for (var speaker in speakers) {
          if (!speakers.hasOwnProperty(speaker)) {
            continue;
          }
          if (speakers[speaker] === index) {
            return speaker;
          }
        }
        throw "there was no speaker for node ";
      } else {
        return node.speaker;
      }
    }

    var selectedNodeColorMap = "speaker";
    var selectedEdgeColorMap = "similarity";
    var selectedEdgeGlowMap = "none";

    var speakerColorMap = d3.scale
      .ordinal()
      .domain([
        "backbone root",
        "backbone",
        "OBAMA",
        "ROMNEY",
        "CROWLEY",
        "QUESTION"
      ])
      .range(colorBrewerSet1);

    var varianceColorMap = d3.scale
      .quantize()
      .domain([1, 0])
      .range([
        "#a50026",
        "#d73027",
        "#f46d43",
        "#fdae61",
        "#fee08b",
        "#d9ef8b",
        "#a6d96a",
        "#66bd63",
        "#1a9850",
        "#006837"
      ]);

    var varianceToParentColorMap = d3.scale
      .quantize()
      .domain([1, 0])
      .range([
        "#a50026",
        "#d73027",
        "#f46d43",
        "#fdae61",
        "#fee08b",
        "#d9ef8b",
        "#a6d96a",
        "#66bd63",
        "#1a9850",
        "#006837"
      ]);

    var nodeSimilarityColorMap = d3.scale
      .quantize()
      .domain([0, 1])
      .range([
        "#a50026",
        "#d73027",
        "#f46d43",
        "#fdae61",
        "#fee08b",
        "#d9ef8b",
        "#a6d96a",
        "#66bd63",
        "#1a9850",
        "#006837"
      ]);

    var outlierSimilarityMap = {};
    var outlierSimilarityColorMap = d3.scale
      .quantize()
      .domain([1, 0])
      .range([
        "#fee5d9",
        "#fcbba1",
        "#fc9272",
        "#fb6a4a",
        "#de2d26",
        "#a50f15"
      ]);

    var mostSimilarNodesSimilarityMap = {};
    var mostSimilarNodesColorMap = d3.scale
      .quantize()
      .domain([1, 0])
      .range([
        "#edf8e9",
        "#c7e9c0",
        "#a1d99b",
        "#74c476",
        "#31a354",
        "#006d2c"
      ]);

    var varianceStarMap = d3.scale
      .quantize()
      .domain([0, 1])
      .range([8, 10, 12, 14, 16]);

    var maxInsertCertainty = 1;
    var insertCertaintyColourMap = d3.scale
      .quantize()
      .domain([maxInsertCertainty, 0])
      .range([
        "#f0f0f0",
        "#d9d9d9",
        "#bdbdbd",
        "#969696",
        "#737373",
        "#525252",
        "#252525"
      ]);

    const metricColours = {
      // COHERENCE: '#339966',
      // PMI: '#996633',
      // VARIANCE: '#993366',
      // TOPIC_CERTAINTY: '#336699',
      COHERENCE: "#1b9e77",
      PMI: "#d95f02",
      VARIANCE: "#7570b3",
      TOPIC_CERTAINTY: "#e7298a",
      ALL_BRANCHING: "#66a61e",
      TOPIC_BRANCHING: "#e6ab02",
      NODE_RATIO: "#a6761d",
      SPEAKER_COUNT: "#666666",
      TOPIC_SIZE: "#000",
      TOPIC_COUNT: "#ff0000",
      SEPARATION: "#39CCCC",
      DISTINCTIVENESS: "#85144b"
    };

    var service = {
      colorDuration: 250,
      metricColourMap: function(metric, strategy) {
        const hcl = d3.hcl(metricColours[metric.type]);
        const darker = hcl.darker(0.5);
        const brighter = hcl.brighter(2).rgb();
        const brighter0 =
          "rgba(" + brighter.r + "," + brighter.g + "," + brighter.b + ",0)";
        const brighter75 =
          "rgba(" + brighter.r + "," + brighter.g + "," + brighter.b + ",0.75)";

        // legend
        if (strategy === "legend") {
          if (metric.selected === true) {
            return darker;
          }
          return brighter75;
        }

        // spec exec line
        if (strategy !== undefined) {
          if (strategy === appliedSpecExecStrategy) {
            // applied strategy line, make darker
            return darker;
          } else if (appliedSpecExecStrategy === undefined) {
            // no strategy selected, display faded lines for all of them
            return brighter75;
          }
          // hide unselected strategy lines
          return brighter0;
        }

        // normal mode
        if (metric.selected === true) {
          return darker;
        }

        return brighter75;

        // console.log('checking', strategy, 'against', appliedSpecExecStrategy);
        // console.log(strategy, appliedSpecExecStrategy, strategy === appliedSpecExecStrategy);
        // if (strategy !== undefined && strategy !== appliedSpecExecStrategy) {
        //   return hcl.darker(0.5);
        // }
        // if ((strategy === 'legend' || appliedSpecExecStrategy === undefined) && metric.selected === true) {
        //   console.log('return darker');
        //   return hcl.darker(0.5);
        // }
        // if (strategy === appliedSpecExecStrategy) {
        //   console.log('return darker');
        //   return hcl.darker(0.5);
        // }
        // console.log('return brighter');
        // // return 'rgba(' + brighter.r + ',' + brighter.g + ',' + brighter.b + ',0.75)';
        // return brighter75;
      },
      // node color map
      colorMap: function(node, data, index) {
        if (isObject(node)) {
          switch (selectedNodeColorMap) {
            case "speaker":
              return speakerColorMap(getSpeakerName(node, index));
            case "variance":
              return varianceColorMap(+node.variance * 10000);
            default:
              throw "currently not implemented";
          }
        } else {
          return speakerColorMap(node);
        }
      },
      edgeColorMap: function(edge) {
        switch (selectedEdgeColorMap) {
          case "grey":
            return "#ccc";
          case "similarity":
            return nodeSimilarityColorMap(
              nodeSimilarityMap.get(edge.target.id + "-" + edge.source.id)
            );
          case "variance":
            if (edge.target.varianceToParent === undefined) {
              edge.source.varianceToParent = 0;
            }
            return varianceToParentColorMap(
              +edge.source.varianceToParent * 10000
            );
        }
      },
      glowEdgeColorMap: function(edge) {
        switch (selectedEdgeGlowMap) {
          case "none":
            return "#ccc";
          case "variance":
            if (edge.target.varianceToParent === undefined) {
              edge.source.varianceToParent = 0;
            }
            return varianceToParentColorMap(
              +edge.source.varianceToParent * 10000
            );
        }
      },
      starMap: function(node) {
        if (node.variance === undefined) {
          return 0;
        }
        if (node.variance === 0) {
          return 0;
        }
        return varianceStarMap(+node.variance * 10000);
      },
      updateOutlierMap: function(min, max, newMap) {
        outlierSimilarityMap = newMap;
        outlierSimilarityColorMap = d3.scale
          .quantize()
          .domain([max, min])
          .range(["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26"]);
      },
      outlierColorMap: function(edge) {
        return outlierSimilarityColorMap(
          outlierSimilarityMap[edge.source.id + "-" + edge.target.id]
        );
      },
      updateMostSimilarNodesMap: function(min, max, newMap) {
        mostSimilarNodesSimilarityMap = newMap;
        mostSimilarNodesColorMap = d3.scale
          .quantize()
          .domain([min, max])
          .range(["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354"]);
      },
      mostSimilarNodesMap: function(edge) {
        return mostSimilarNodesColorMap(
          mostSimilarNodesSimilarityMap[edge.source.id + "-" + edge.target.id]
        );
      },
      insertCertaintyMap: function(node) {
        var ic = node.insertCertainty;
        return insertCertaintyColourMap(ic);
      }
    };

    $rootScope.$on("ihtm.streaming.data.speakers", function(event, data) {
      const names = [];
      const colours = [];

      if (data === null) {
        return;
      }

      console.log(data);
      let i = 0;
      for (const speaker of data) {
        names.push(speaker.name);
        if (speaker.positionColor) {
          colours.push(speaker.positionColor);
        } else {
          colours.push(colorBrewerSet1[i++]);
        }
      }
      speakerColorMap = d3.scale
        .ordinal()
        .domain(names)
        .range(colours);
      //.range(colours);
    });

    $rootScope.$on("ihtm.streaming.specexec.select", function(event, strategy) {
      appliedSpecExecStrategy = strategy;
    });

    $rootScope.$on("ihtm.streaming.settings.nodes.color", function(
      event,
      color
    ) {
      selectedNodeColorMap = color;
      $rootScope.$broadcast("ihtm.streaming.settings.nodes.color.updated");
    });

    $rootScope.$on("ihtm.streaming.settings.edges.color", function(
      event,
      color
    ) {
      selectedEdgeColorMap = color;
      $rootScope.$broadcast("ihtm.streaming.settings.edges.color.updated");
    });

    $rootScope.$on("ihtm.streaming.settings.edges.glow", function(
      event,
      color
    ) {
      selectedEdgeGlowMap = color;
      $rootScope.$broadcast("ihtm.streaming.settings.edges.glow.updated");
    });

    // check if we have to adjust the color scales
    $rootScope.$on("ihtm.streaming.data.new", function(event, data) {
      switch (data.operation) {
        case "INSERTCERTAINTY":
          var certainty = data.certainty;
          if (certainty > maxInsertCertainty) {
            maxInsertCertainty = certainty;

            insertCertaintyColourMap = d3.scale
              .quantize()
              .domain([maxInsertCertainty, 0])
              .range([
                "#f0f0f0",
                "#d9d9d9",
                "#bdbdbd",
                "#969696",
                "#737373",
                "#525252",
                "#252525"
              ]);
          }
          break;
        case "SIMILARITY":
          var similarityMapUpdate = data.similarities;
          for (var nodes in similarityMapUpdate) {
            if (!similarityMapUpdate.hasOwnProperty(nodes)) {
              continue;
            }
            var sim = similarityMapUpdate[nodes];
            nodeSimilarityMap.set(nodes, sim);

            if (sim < minSimilarity) {
              minSimilarity = sim;
            }
            if (sim > maxSimilarity) {
              maxSimilarity = sim;
            }
          }

          nodeSimilarityColorMap = d3.scale
            .quantize()
            .domain([minSimilarity, maxSimilarity])
            .range([
              "#d9d9d9",
              "#bdbdbd",
              "#969696",
              "#737373",
              "#525252",
              "#252525"
            ]);

          $rootScope.$broadcast("ihtm.streaming.settings.edges.color.updated");
          break;
        case "VARIANCE":
          var varianceMapUpdate = data.varianceMap;
          var varianceToParentMapUpdate = data.varianceToParentMap;

          for (var nodeID in varianceMapUpdate) {
            if (!varianceMapUpdate.hasOwnProperty(nodeID)) {
              continue;
            }

            var variance = varianceMapUpdate[nodeID];
            var varianceToParent = varianceToParentMapUpdate[nodeID];

            varianceMap.set(nodeID, variance * 10000);
            varianceToParentMap.set(nodeID, varianceToParent * 10000);
          }
          break;
        case "NODE_COMPLETE":
          varianceColorMap = d3.scale
            .quantize()
            .domain([
              d3.max(Array.from(varianceMap.values())),
              d3.min(Array.from(varianceMap.values()))
            ])
            .range([
              "#d73027",
              "#f46d43",
              "#fdae61",
              // '#fee08b',
              // '#d9ef8b',
              "#a6d96a",
              "#66bd63",
              "#1a9850"
            ]);

          varianceStarMap = d3.scale
            .quantize()
            .domain([
              d3.min(Array.from(varianceMap.values())),
              d3.max(Array.from(varianceMap.values()))
            ])
            .range([8, 10, 12, 14, 16]);

          varianceToParentColorMap = d3.scale
            .quantize()
            .domain([
              d3.max(Array.from(varianceToParentMap.values())),
              d3.min(Array.from(varianceToParentMap.values()))
            ])
            .range([
              "#fee0d2",
              "#fcbba1",
              "#fc9272",
              "#fb6a4a",
              "#ef3b2c",
              "#cb181d"
            ]);
          break;
        default:
        //
      }
    });

    return service;
  });
