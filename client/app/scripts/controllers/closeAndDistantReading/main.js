/**
 * Created by Hilmi-Can on 27.12.19.
 * BACHELOR PROJECT
 */

let app = angular.module("visArgueClientApp");
app.controller("MainCloseAndDistantReadingCtrl", function(
  $scope,
  $rootScope, // communicate between several files/controller
  $http, // communicate with server
  APIURL, // localhost:8080/
  $uibModal,
  $timeout
) {
  "use strict";

  // initialize layout
  let windowHeight = $(window).height();

  $scope.layout = {
    height: windowHeight - 100 + "px"
  };

  $scope.layoutTextContainer = {
    height: windowHeight - 170 + "px"
  };

  $scope.layoutOverviewContainer = {
    height: windowHeight - 170 + "px"
  };

  $scope.layoutToolContainer = {
    height: windowHeight - 170 + "px"
  };

  // if window get resized calc new layout
  angular.element(document).ready(function() {
    window.addEventListener("resize", setLayout);
  });

  // if one tab is clicked then hide intro
  let once = true;
  let tabsClicked = [];
  $("#documentTabs-cdr").on("click", "li", function() {
    $scope.activeTab = $(this)[0].innerText;

    if (once) {
      $scope.$apply(function() {
        $scope.showIntro = false;
      });
      once = false;
    }

    if (!tabsClicked.includes($scope.activeTab)) {
      tabsClicked.push($scope.activeTab);
      // the dimensions like width and height of the content in a tab
      // is computed after the tab is clicked
      // timeout is needed so that getBoundingClientRect() returns no null values
      setTimeout(function() {
        $rootScope.$broadcast("tabClicked", { tab: $scope.activeTab });
      }, 1000);
    }
  });

  // get data from server
  $http
    .get(APIURL + "closeAndDistantReading/data")
    .then(
      function(response) {
        // this data only corresponds to one debate, since server cant process multiple input-files
        $scope.data = response.data;

        // hide loading indicator after receiving data
        // show intro after receiving data
        $scope.showIntro = true;

        d3.select("#loading_indicator-cdr").style("display", "none");

        // for creating different tabs, but since server cant process multiple input-files, only one tab will shown
        $scope.extractFileName = function() {
          const filenames = $scope.data["filenames"];
          return filenames;
        };

        // extract and parse features from data
        $scope.filenames = $scope.data["filenames"];

        $scope.speakerOrderList = [];
        $scope.speakerOrderList.push($scope.data["speakerOrder"]);

        $scope.speakerList = [];
        $scope.speakerList.push($scope.data["speaker"]);

        $scope.debateList = [];
        $scope.debateList.push(
          parseJsonStringsToObjects($scope.data["debateJson"])
        );

        $scope.posTagLabelsList = [];
        $scope.posTagLabelsList.push(
          parseJsonStringsToObjects($scope.data["posTagLabelJson"])
        );

        $scope.sentimentsList = [];
        $scope.sentimentsList.push(
          parseJsonStringsToObjects($scope.data["sentimentJson"])
        );

        $scope.wordFrequenciesList = [];
        $scope.wordFrequenciesList.push(
          parseJsonStringsToObjects($scope.data["wordFrequenciesJson"])
        );

        $scope.frequencyWordsToUtteranceList = [];
        $scope.frequencyWordsToUtteranceList.push(
          parseJsonStringsToObjects(
            $scope.data["frequencyWordsToUtteranceJson"]
          )
        );

        $scope.posTagSetList = [];
        $scope.posTagSetList.push($scope.data["posTagSet"]);

        $scope.namedEntitiesOriginList = [];
        $scope.namedEntitiesOriginList.push(
          parseJsonStringsToObjects($scope.data["namedEntitiesJson"])
        );

        $scope.namedEntitiesList = angular.copy($scope.namedEntitiesOriginList);

        // for contextmenu-list (edit)
        $scope.namedEntitiesCategoriesList = [];
        let temp = [];
        for (let i = 0; i < $scope.namedEntitiesOriginList[0].length; i++) {
          let obj = $scope.namedEntitiesOriginList[0][i];
          for (let [key, _] of Object.entries(obj)) {
            temp.push(key);
          }
        }
        $scope.namedEntitiesCategoriesList.push(temp);

        $scope.topicModellingAlgorithm = $scope.data["topicModellingAlgorithm"];

        $scope.topicsList = [];
        $scope.topicsList.push(
          parseJsonStringsToObjects($scope.data["topicsUtteranceJson"])
        );

        $scope.topicDescriptorsList = [];
        $scope.topicDescriptorsList.push(
          parseJsonStringsToObjects($scope.data["topicDescriptorJson"])
        );

        $scope.topicNumbersList = [];
        $scope.topicNumbersList.push($scope.data["topicNumbers"]);

        $scope.measuresList = [];
        $scope.measuresList.push(
          parseJsonStringsToObjects($scope.data["measureJson"])
        );

        $scope.measureNamesList = [];
        $scope.measureNamesList.push(
          parseJsonStringsToObjects($scope.data["measureList"])
        );

        // item list for dropdown overview annotation
        $scope.featureList = [
          "SENTIMENT WORD",
          "SENTIMENT SENTENCE",
          "SENTIMENT UTTERANCE",
          "NAMED ENTITIES",
          "TOPICS",
          "SPEAKER",
          "POS"
        ];

        // assign pos tags a category
        $scope.posTagCategoryMap = {
          NN: "noun",
          NNS: "noun",
          NNP: "noun",
          NNPS: "noun",
          VB: "verb",
          VBD: "verb",
          VBG: "verb",
          VBN: "verb",
          VBP: "verb",
          VBZ: "verb",
          JJ: "adjective",
          JJR: "adjective",
          JJS: "adjective",
          RB: "adverb",
          RBR: "adverb",
          RBS: "adverb",
          IN: "conjunction",
          POS: "other",
          PRP: "pronoun",
          PRP$: "pronoun",
          DT: "determiner",
          CC: "conjunction",
          CD: "number",
          WDT: "wh",
          WP: "wh",
          WP$: "wh",
          WRB: "wh",
          EX: "other",
          FW: "other",
          LS: "other",
          MD: "other",
          PDT: "determiner",
          RP: "other",
          SYM: "other",
          TO: "other",
          UH: "other"
        };

        $scope.posTagdomain = [
          "noun",
          "verb",
          "adjective",
          "adverb",
          "pronoun",
          "wh",
          "determiner",
          "number",
          "conjunction",
          "other"
        ];

        $scope.posTagColor = d3
          .scaleOrdinal()
          .domain($scope.posTagdomain)
          .range(d3.schemeCategory10);

        // create dynamically an object and store for each tab a key value pair
        // necessary to decide on which tab the pos checkbox was checked to display the categories
        $scope.showCategoriesPos = {};
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.showCategoriesPos["showCategoriesPosOfTab" + i] = false;
        }

        // declare for each tab a list that will track the selected categories for pos tags
        $scope.checkedPosCategoriesOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedPosCategoriesOfTab[i] = [];
        }

        $scope.checkedPos = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedPos[i] = false;
        }

        /**
         * This Method annotates the pos tag labels for a word
         * 10 colors are used to encode pos tags, therefore they are grouped into categories.
         * Further update tracker height, also update speaker annotation when checked and
         * since annotation can move visible sentence out of container, bring it back with a scroll.
         */
        $scope.annotate_pos = function(checked, tab, debateIndex) {
          $scope.showCategoriesPos[
            "showCategoriesPosOfTab" + debateIndex
          ] = checked;

          $scope.checkedPos[debateIndex] = checked;

          let element = getFirstSentenceInViewport(tab)[0];

          d3.select("#posCheckBox-cdr\\ " + tab).classed(
            "featureChecked",
            checked
          );

          if (checked === true) {
            for (let i = 0; i < $scope.debateList[debateIndex].length; i++) {
              let utteranceTags =
                $scope.posTagLabelsList[debateIndex][i]["utterance" + (i + 1)];
              let sentenceCount = 1;

              for (let sentenceTags in utteranceTags) {
                let wordTags = angular.copy(utteranceTags[sentenceTags]);
                let wordCount = 1;
                for (let wordTag in wordTags) {
                  let posTag = wordTags[wordTag];

                  d3.select(
                    "#utterance" +
                      (i + 1) +
                      "\\ " +
                      "sentence" +
                      sentenceCount +
                      "\\ " +
                      "wordContainer" +
                      wordCount +
                      "\\ " +
                      tab
                  )
                    .insert("text", "div")
                    .classed("posTag-cdr", true)
                    .classed(tab, true)
                    .classed(posTag, true)
                    .style("color", function() {
                      if ($scope.posTagSetList[debateIndex].includes(posTag)) {
                        let category = $scope.posTagCategoryMap[posTag];
                        return $scope.posTagColor(category);
                      } else {
                        //default color also for punctuation
                        return "grey";
                      }
                    })
                    .text(posTag)
                    .style("margin-left", "2px")
                    .style("margin-bottom", "-5px")
                    .style("font-size", "12px");

                  // extra div element so that a further annotation can placed on top of it
                  // effect: assigns extra space in layout
                  // Solution: display none
                  d3.select(
                    "#utterance" +
                      (i + 1) +
                      "\\ " +
                      "sentence" +
                      sentenceCount +
                      "\\ " +
                      "wordContainer" +
                      wordCount +
                      "\\ " +
                      tab
                  )
                    .insert("div", "text")
                    .classed("extraDivPos-cdr", true)
                    .classed(tab, true)
                    .style("display", "none");

                  wordCount++;
                }
                sentenceCount++;
              }

              // increase gap between utterances
              let object = d3.select("#object" + (i + 1) + "\\ " + tab);
              object.style("margin-bottom", function() {
                let margin = parseInt(object.style("margin-bottom"));

                return margin + 10 + "px";
              });
            }

            // initialize tracking checkboxes
            for (
              let i = 0;
              i < $scope.posTagSetList[debateIndex].length + 1;
              i++
            ) {
              $scope.checkedPosCategoriesOfTab[debateIndex][i] = false;
            }
          } else {
            // text
            d3.selectAll(".posTag-cdr." + tab).remove();

            // overview
            if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
              d3.selectAll(".posAnnotationOverviewHidden-cdr." + tab)
                .classed("posAnnotationOverviewHidden-cdr", false)
                .style("fill", function() {
                  return d3.select(this).attr("pixelColor");
                });
            }

            d3.selectAll(".extraDivPos-cdr." + tab).remove();

            // decrease gap between utterances
            let margin = parseInt(
              d3.select(".object-cdr." + tab).style("margin-bottom")
            );
            d3.selectAll(".object-cdr." + tab).style(
              "margin-bottom",
              function() {
                return margin - 10 + "px";
              }
            );

            if ($scope.checkedPosCategoriesOfTab[debateIndex].includes(true)) {
              // disable clear btn
              d3.select(".viewOptionsPosClearBtn-cdr." + tab).property(
                "disabled",
                true
              );

              // clear selected view options from list
              $scope.selectedCategoriesPosTagLists[debateIndex] = [];

              // uncheck checked checkboxes
              for (
                let i = 0;
                i < $scope.posTagSetList[debateIndex].length + 1;
                i++
              ) {
                $scope.checkedPosCategoriesOfTab[debateIndex][i] = false;
              }
            }
          }

          // keep visible sentence in container
          // build container ID and get container
          let containerID =
            "text_container-cdr " + $scope.filenames[debateIndex];
          let container = document.getElementById(containerID);
          let space = 20;

          // scroll sentence back into viewport
          container.scrollTop = element.offsetTop - space;

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        // create for each tab a own list which stores the selected pos tags from the view options
        $scope.selectedCategoriesPosTagLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedCategoriesPosTagLists[i] = [];
        }

        /**
         * This method manages a list of selected pos tags
         * of its corresponding tab.
         * Further it hides or show the selected tags in the text.
         * Speaker annotation and pixel-tracker should be updated.
         */
        $scope.showSelectedPosCategories = function(
          tag,
          checked,
          tab,
          debateIndex
        ) {
          if (checked) {
            // store element
            $scope.selectedCategoriesPosTagLists[debateIndex].push(tag);

            // show only selected ones
            if (
              $scope.selectedCategoriesPosTagLists[debateIndex].length === 1
            ) {
              // hide rest

              // text
              d3.selectAll(".posTag-cdr." + tab + ":not(." + tag + ")")
                .classed("posAnnotationHidden-cdr", true)
                .style("width", "0px")
                .style("visibility", "hidden");

              // overview
              if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
                d3.selectAll(
                  ".posAnnotationOverview-cdr." +
                    tab +
                    ":not(.posAnnotationOverview" +
                    tag +
                    ")"
                )
                  .classed("posAnnotationOverviewHidden-cdr", true)
                  .style("fill", "lightgrey");
              }

              // enable clear btn
              d3.select(".viewOptionsPosClearBtn-cdr." + tab).property(
                "disabled",
                false
              );
            } else {
              // show again

              // text
              d3.selectAll(".posTag-cdr." + tab + "." + tag)
                .style("visibility", "unset")
                .style("width", "unset")
                .classed("posAnnotationHidden-cdr", false);

              // overview
              if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
                d3.selectAll(
                  ".posAnnotationOverview-cdr." +
                    tab +
                    ".posAnnotationOverview" +
                    tag
                )
                  .classed("posAnnotationOverviewHidden-cdr", false)
                  .style("fill", function() {
                    return d3.select(this).attr("pixelColor");
                  });
              }
            }
          } else {
            // remove the element
            $scope.selectedCategoriesPosTagLists[debateIndex].splice(
              $scope.selectedCategoriesPosTagLists[debateIndex].indexOf(tag),
              1
            );

            if (
              $scope.selectedCategoriesPosTagLists[debateIndex].length === 0
            ) {
              // show all

              //text
              d3.selectAll(".posTag-cdr." + tab + ":not(." + tag + ")")
                .classed("posAnnotationHidden-cdr", false)
                .style("width", "unset")
                .style("visibility", "unset");

              // overview
              if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
                d3.selectAll(
                  ".posAnnotationOverview-cdr." +
                    tab +
                    ":not(.posAnnotationOverview" +
                    tag +
                    ")"
                )
                  .classed("posAnnotationOverviewHidden-cdr", false)
                  .style("fill", function() {
                    return d3.select(this).attr("pixelColor");
                  });
              }

              // disable clear btn
              d3.select(".viewOptionsPosClearBtn-cdr." + tab).property(
                "disabled",
                true
              );
            } else {
              // hide element

              // text
              d3.selectAll(".posTag-cdr." + tab + "." + tag)
                .classed("posAnnotationHidden-cdr", true)
                .style("width", "0px")
                .style("visibility", "hidden");

              // overview
              if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
                d3.selectAll(
                  ".posAnnotationOverview-cdr." +
                    tab +
                    ".posAnnotationOverview" +
                    tag
                )
                  .classed("posAnnotationOverviewHidden-cdr", true)
                  .style("fill", "lightgrey");
              }
            }
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method resets the selected view option for pos tags.
         * Display all annotation again.
         * Uncheck checkboxes and reset tracking list.
         * Disable clear btn.
         * Recalculate speaker annotation when is checked and update pixel-tracker.
         */
        $scope.clearViewOptionsPos = function(tab, debateIndex) {
          // show all
          // text
          d3.selectAll(".posTag-cdr." + tab + ".posAnnotationHidden-cdr")
            .classed("posAnnotationHidden-cdr", false)
            .style("width", "unset")
            .style("visibility", "unset");

          // overview
          if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
            d3.selectAll(
              ".posAnnotationOverview-cdr." +
                tab +
                ".posAnnotationOverviewHidden-cdr"
            )
              .classed("posAnnotationOverviewHidden-cdr", false)
              .style("fill", function() {
                return d3.select(this).attr("pixelColor");
              });
          }

          // disable clear btn
          d3.select(".viewOptionsPosClearBtn-cdr." + tab).property(
            "disabled",
            true
          );

          // clear selected view options from list
          $scope.selectedCategoriesPosTagLists[debateIndex] = [];

          // uncheck checked checkboxes
          // add one since we extend list with P (punctuation)
          // https://stackoverflow.com/questions/38671184/uncheck-all-checkboxes-in-angularjs
          for (
            let i = 0;
            i < $scope.posTagSetList[debateIndex].length + 1;
            i++
          ) {
            $scope.checkedPosCategoriesOfTab[debateIndex][i] = false;
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        // hardcoded since i can't get a mapping from server for pos-tags to word-types
        // https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html
        $scope.pennTreeBankTags = {
          P: "punctuation",
          CC: "coordinating conjunction",
          CD: "cardinal number",
          DT: "determiner",
          EX: "existential there",
          FW: "foreign word",
          IN: "preposition or subordinating conjunction",
          JJ: "adjective",
          JJR: "adjective, comparative",
          JJS: "adjective superlative",
          LS: "list item marker",
          MD: "modal",
          NN: "noun, singular or mass",
          NNS: "noun, plural",
          NNP: "proper noun, singular",
          NNPS: "proper noun, plural",
          PDT: "predeterminer",
          POS: "possessive ending",
          PRP: "personal pronoun",
          PRP$: "possessive pronoun",
          RB: "adverb",
          RBR: "adverb, comparative",
          RBS: "adverb, superlative",
          RP: "particle",
          SYM: "symbol",
          TO: "to",
          UH: "interjection",
          VB: "verb, base form",
          VBD: "verb, past tense",
          VBG: "verb, gerund or present tense",
          VBN: "verb, past participle",
          VBP: "verb, non-3rd person singular present",
          VBZ: "verb, 3rd person singular present",
          WDT: "wh-determiner",
          WP: "wh-pronoun",
          WP$: "possessive wh-pronoun",
          WRB: "wh-adverb"
        };

        /**
         * This method creates a modal window and displays
         * a description and the color encoding for the tag-set
         */
        $scope.launchPosTagInfo = function(debateIndex) {
          $uibModal
            .open({
              templateUrl: "views/modalWindowPosTagInfoCDR.html",
              controller: "modalWindowPosTagInfoController",
              scope: $scope,
              backdrop: false
            })
            .rendered.then(function() {
              let size = Object.keys($scope.pennTreeBankTags).length;

              let index = 0;
              for (const [key, value] of Object.entries(
                $scope.pennTreeBankTags
              )) {
                let tag = key;
                let description = value;
                let color;

                // check if a tag from the list (penn tree bank) also occurs in the posTagSet
                // if so, assign the corresponding color for that tag
                // punctuations are not in the posTagSet, assign them grey as color
                // assign no color (white) for the rest
                if ($scope.posTagSetList[debateIndex].includes(tag)) {
                  let category = $scope.posTagCategoryMap[tag];
                  color = $scope.posTagColor(category);
                } else {
                  if (tag === "P") {
                    // for punctuation
                    color = "lightgrey";
                  } else {
                    // unused tags
                    color = "white";
                  }
                }

                // for better layout
                let position;
                if (index <= size / 2) {
                  position = "#leftPosTagEncoding";
                } else {
                  position = "#rightPosTagEncoding";
                }

                // place colored rectangle (pos tag color)
                let div = d3
                  .select(position)
                  .append("div")
                  .classed("posTagColorEncoding" + index, true)
                  .style("display", "flex")
                  .style("margin-bottom", "2px");

                let svg = div
                  .append("svg")
                  .attr("width", 10)
                  .attr("height", 10);

                svg
                  .append("rect")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", 10)
                  .attr("height", 10)
                  .attr("fill", color);

                // append label and description
                // reduce opacity for tags which not occur in the tag-set (white color)
                d3.select(".posTagColorEncoding" + index)
                  .append("div")
                  .text(tag + " - " + description)
                  .style("opacity", function() {
                    if (color === "white") {
                      return 0.3;
                    }
                  })
                  .style("margin-left", "5px")
                  .style("margin-top", "-5px");

                index++;
              }
            });
        };

        $scope.sentimentColor = d3.scale
          .sqrt()
          .domain([-1, 0, 1])
          .range(["red", "darkgrey", "green"])
          .interpolate(d3.interpolateRgb.gamma(2));

        // create dynamically an object and store for each tab a key value pair
        // necessary to decide on which tab the sentiment checkbox was checked to display the categories
        $scope.showCategoriesSentiment = {};
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.showCategoriesSentiment[
            "showCategoriesSentimentOfTab" + i
          ] = false;
        }

        // declare for each tab a list that will track the selected categories for pos tags
        $scope.checkedSentimentCategoriesOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedSentimentCategoriesOfTab[i] = [];
        }

        $scope.checkedSentiment = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedSentiment[i] = false;
        }

        /**
         * This method annotates the sentiment for a word also for a sentence.
         * A positive word will be bold and green, a negative one italic and red.
         * Neutral words will not be highlighted.
         * A sentence will be encoded through an colored rectangle with an average value.
         */
        $scope.annotate_sentiment = function(checked, tab, debateIndex) {
          $scope.showCategoriesSentiment[
            "showCategoriesSentimentOfTab" + debateIndex
          ] = checked;

          $scope.checkedSentiment[debateIndex] = checked;

          d3.select("#sentimentCheckBox-cdr\\ " + tab).classed(
            "featureChecked",
            checked
          );

          if (checked === true) {
            for (let i = 0; i < $scope.debateList[debateIndex].length; i++) {
              let utteranceSentiments =
                $scope.sentimentsList[debateIndex][i]["utterance" + (i + 1)];

              let sentenceCount = 1;

              for (let sentenceSentiments in utteranceSentiments) {
                let avgSentenceSentiment = 0;
                let wordSentiments = angular.copy(
                  utteranceSentiments[sentenceSentiments]
                );
                let wordCount = 1;

                // assign encoding to each word
                for (let wordSentiment in wordSentiments) {
                  let sentiment = wordSentiments[wordSentiment];

                  avgSentenceSentiment += sentiment;

                  let word = d3.select(
                    "#utterance" +
                      (i + 1) +
                      "\\ " +
                      "sentence" +
                      sentenceCount +
                      "\\ " +
                      "word" +
                      wordCount +
                      "\\ " +
                      tab
                  );

                  word
                    .style("font-style", function() {
                      // default style for neutral
                      let style = "unset";

                      if (sentiment === -1) {
                        style = "italic";
                      } else if (sentiment === 1) {
                        d3.select(
                          "#utterance" +
                            (i + 1) +
                            "\\ " +
                            "sentence" +
                            sentenceCount +
                            "\\ " +
                            "word" +
                            wordCount +
                            "\\ " +
                            tab
                        ).style("font-weight", "bold");
                      }

                      return style;
                    })
                    .style("color", function() {
                      // default color for neutral
                      let color = "unset";

                      if (sentiment === -1) {
                        color = "red";
                      } else if (sentiment === 1) {
                        color = "green";
                      }
                      return color;
                    });

                  if (sentiment === -1) {
                    word.classed("sentimentHighlightedNegative-cdr", true);
                  } else if (sentiment === 1) {
                    word.classed("sentimentHighlightedPositive-cdr", true);
                  }

                  wordCount++;
                }
                avgSentenceSentiment = avgSentenceSentiment / (wordCount - 1);

                // assign average sentiment to each sentence
                let svg = d3
                  .select(
                    "#utterance" +
                      (i + 1) +
                      "\\ " +
                      "sentence" +
                      sentenceCount +
                      "\\ " +
                      "wordContainer" +
                      (wordCount - 1) +
                      "\\ " +
                      tab
                  )
                  .select(".wordDiv-cdr." + tab)
                  .append("svg")
                  .classed("avgSentiment-cdr", true)
                  .classed(tab, true)
                  .attr("width", 9)
                  .attr("height", 9)
                  .style("margin-left", 3);

                svg
                  .append("rect")
                  .attr("width", 9)
                  .attr("height", 9)
                  .style("fill", function() {
                    return $scope.sentimentColor(avgSentenceSentiment);
                  });

                sentenceCount++;
              }
            }

            // initialize tracking checkboxes
            $scope.checkedSentimentCategoriesOfTab[debateIndex][0] = false;
            $scope.checkedSentimentCategoriesOfTab[debateIndex][1] = false;
          } else {
            // text
            d3.selectAll(".sentimentHighlightedNegative-cdr." + tab)
              .classed("sentimentHighlightedNegative-cdr", false)
              .style("font-style", "unset")
              .style("color", "unset");

            d3.selectAll(".sentimentHighlightedPositive-cdr." + tab)
              .classed("sentimentHighlightedPositive-cdr", false)
              .style("font-weight", "unset")
              .style("color", "unset");

            d3.selectAll(".avgSentiment-cdr." + tab).remove();

            // overview
            if ($scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD") {
              d3.selectAll(".sentimentAnnotationOverviewHidden-cdr." + tab)
                .classed("sentimentAnnotationOverviewHidden-cdr", false)
                .style("fill", function() {
                  return d3.select(this).attr("pixelColor");
                });
            }
            // reset datastructures
            if (
              $scope.checkedSentimentCategoriesOfTab[debateIndex].includes(true)
            ) {
              // disable clear btn
              d3.select(".viewOptionsSentimentClearBtn-cdr." + tab).property(
                "disabled",
                true
              );

              // clear selected view options from list
              $scope.selectedCategoriesSentimentLists[debateIndex] = [];

              // uncheck checked checkboxes
              $scope.checkedSentimentCategoriesOfTab[debateIndex][0] = false;
              $scope.checkedSentimentCategoriesOfTab[debateIndex][1] = false;
            }
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        // create for each tab a own list which stores the selected sentiment categories from the view options
        $scope.selectedCategoriesSentimentLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedCategoriesSentimentLists[i] = [];
        }

        /**
         * This method manages a list of selected sentiment categories
         * of its corresponding tab.
         * Further it hides or show the selected category in the text.
         */
        $scope.showSelectedSentimentCategories = function(
          sentiment,
          checked,
          tab,
          debateIndex
        ) {
          if (checked) {
            // push element into list
            $scope.selectedCategoriesSentimentLists[debateIndex].push(
              sentiment
            );

            if (
              $scope.selectedCategoriesSentimentLists[debateIndex].length === 1
            ) {
              // hide rest

              if (sentiment === "positive") {
                // text
                d3.selectAll(".sentimentHighlightedNegative-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", true)
                  .style("color", "black")
                  .style("font-style", "unset");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.negativeSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", true)
                    .style("fill", "lightgrey");
                }
              } else {
                // text
                d3.selectAll(".sentimentHighlightedPositive-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", true)
                  .style("color", "black")
                  .style("font-weight", "unset");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.positiveSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", true)
                    .style("fill", "lightgrey");
                }
              }

              // enable clear btn
              d3.select(".viewOptionsSentimentClearBtn-cdr." + tab).property(
                "disabled",
                false
              );
            } else {
              // show again
              if (sentiment === "positive") {
                // text
                d3.selectAll(".sentimentHighlightedPositive-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", false)
                  .style("color", "green")
                  .style("font-weight", "bold");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.positiveSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                }
              } else {
                // text
                d3.selectAll(".sentimentHighlightedNegative-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", false)
                  .style("color", "red")
                  .style("font-style", "italic");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.negativeSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                }
              }
            }
          } else {
            // remove the element
            $scope.selectedCategoriesSentimentLists[debateIndex].splice(
              $scope.selectedCategoriesSentimentLists[debateIndex].indexOf(
                sentiment
              ),
              1
            );

            if (
              $scope.selectedCategoriesSentimentLists[debateIndex].length === 0
            ) {
              if (sentiment === "positive") {
                // text
                d3.selectAll(".sentimentHighlightedNegative-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", false)
                  .style("color", "red")
                  .style("font-style", "italic");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.negativeSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                }
              } else {
                // text
                d3.selectAll(".sentimentHighlightedPositive-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", false)
                  .style("color", "green")
                  .style("font-weight", "bold");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.positiveSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                }
              }
              // disable clear btn
              d3.select(".viewOptionsSentimentClearBtn-cdr." + tab).property(
                "disabled",
                true
              );
            } else {
              // hide element
              if (sentiment === "positive") {
                // text
                d3.selectAll(".sentimentHighlightedPositive-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", true)
                  .style("color", "black")
                  .style("font-weight", "unset");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.positiveSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", true)
                    .style("fill", "lightgrey");
                }
              } else {
                // text
                d3.selectAll(".sentimentHighlightedNegative-cdr." + tab)
                  .classed("sentimentAnnotationHidden-cdr", true)
                  .style("color", "black")
                  .style("font-style", "unset");

                // overview
                if (
                  $scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD"
                ) {
                  d3.selectAll(
                    ".sentimentAnnotationOverview-cdr.negativeSentimentOverview-cdr." +
                      tab
                  )
                    .classed("sentimentAnnotationOverviewHidden-cdr", true)
                    .style("fill", "lightgrey");
                }
              }
            }
          }

          // update tracker
          textScrollListener();

          // update speaker annotation
          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method resets the selected view option for sentiment categories.
         * Display all sentiment annotations again.
         * Uncheck checkboxes and reset tracking list.
         * Disable clear btn.
         * Recalculate speaker annotation when is checked and update pixel-tracker.
         */
        $scope.clearViewOptionsSentiment = function(tab, debateIndex) {
          // show all
          // text
          d3.selectAll(".sentimentAnnotationHidden-cdr." + tab)
            .classed("sentimentAnnotationHidden-cdr", false)
            .style("color", function() {
              let color;
              if (d3.select(this).classed("sentimentHighlightedPositive-cdr")) {
                color = "green";
              } else {
                color = "red";
              }

              return color;
            })
            .style("font-style", function() {
              let style = "unset";

              if (d3.select(this).classed("sentimentHighlightedPositive-cdr")) {
                d3.select(this).style("font-weight", "bold");
              } else {
                style = "italic";
              }
              return style;
            });

          // overview
          d3.selectAll(".sentimentAnnotationOverviewHidden-cdr." + tab)
            .classed("sentimentAnnotationOverviewHidden-cdr", false)
            .style("fill", function() {
              return d3.select(this).attr("pixelColor");
            });

          // disable clear btn
          d3.select(".viewOptionsSentimentClearBtn-cdr." + tab).property(
            "disabled",
            true
          );

          // clear selected view options from list
          $scope.selectedCategoriesSentimentLists[debateIndex] = [];

          // uncheck checked checkboxes
          $scope.checkedSentimentCategoriesOfTab[debateIndex][0] = false;
          $scope.checkedSentimentCategoriesOfTab[debateIndex][1] = false;

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method creates a modal window and displays
         * a description and the color encoding for sentiment
         */
        $scope.launchSentimentInfo = function() {
          $uibModal
            .open({
              templateUrl: "views/modalWindowSentimentInfoCDR.html",
              controller: "modalWindowSentimentInfoController",
              scope: $scope,
              backdrop: false
            })
            .rendered.then(function() {
              // https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
              // size of color-scale
              const width = 300;
              const height = 50;

              const svg = d3
                .select("#sentimentEncoding")
                .append("svg")
                .classed("svgSentimentLegend-cdr", true)
                .style("height", height + 20)
                .style("width", "100%");

              // gradient definition
              const defs = svg.append("defs");

              const linearGradient = defs
                .append("linearGradient")
                .attr("id", "linear-gradient-sentiment");

              // direction of gradient left to right
              linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

              //Set the color for the start (0%)
              linearGradient
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "red");

              //Set the color for the end (50%)
              linearGradient
                .append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "darkgrey");

              //Set the color for the end (100%)
              linearGradient
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "green");

              //Draw the rectangle and fill with gradient
              let rect = svg
                .append("rect")
                .style("width", width)
                .style("height", height - 10)
                .style("fill", "url(#linear-gradient-sentiment)");

              // for shifting the color-scale to the center of the svg
              let xShift =
                parseInt(d3.select(".svgSentimentLegend-cdr").style("width")) /
                  2 -
                width / 2;

              rect.attr("transform", "translate(" + xShift + ",0)");

              // draw axis and title
              let y = d3
                .scaleLinear()
                .range([width - 1, 0])
                .domain([1, -1]);

              let tickLabels = ["negative -1", "neutral 0", "positive 1"];
              let ticks = [-1, 0, 1];

              let yAxis = d3.svg
                .axis()
                .scale(y)
                .tickValues(ticks)
                .tickFormat(function(d, i) {
                  return tickLabels[i];
                });

              svg
                .append("g")
                .attr("class", "y axis")
                .attr(
                  "transform",
                  "translate(" + (xShift + 0.5) + "," + (height - 10) + ")"
                )
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("dy", ".71em")
                .style("text-anchor", "end");
            });
        };

        $scope.speakerChecked = {
          checked: false,
          tab: null,
          index: null
        };

        $scope.checkedSpeaker = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedSpeaker[i] = false;
        }

        /**
         * This method annotates the speakers to their corresponding utterance
         */
        $scope.annotate_speaker = function(checked, tab, debateIndex) {
          $scope.speakerColors = d3.scaleOrdinal(
            $scope.speakerList[debateIndex],
            d3.schemeDark2
          );

          $scope.speakerChecked["checked"] = checked;
          $scope.speakerChecked["tab"] = tab;
          $scope.speakerChecked["index"] = debateIndex;

          $scope.checkedSpeaker[debateIndex] = checked;

          d3.select("#speakerCheckBox-cdr\\ " + tab).classed(
            "featureChecked",
            checked
          );

          if (checked === true) {
            d3.selectAll(".object-cdr." + tab)
              .data($scope.speakerOrderList[debateIndex])
              .each(function(d, i) {
                d3.select(this)
                  .classed("speaker-cdr-" + d, true)
                  .attr("speaker", d)
                  .insert("div", "div")
                  .classed("speakerTag-cdr", true)
                  .classed(tab, true)
                  .style("height", function() {
                    return calcHeightOfSpeakerAnnotation(i, tab);
                  })
                  .style("width", "5px")
                  .style("margin-right", "2px")
                  .style("margin-top", "2px")
                  .style("background-color", function(d) {
                    return $scope.speakerColors(d);
                  })
                  .append("svg")
                  .style("vertical-align", "baseline")
                  .style("height", "100%")
                  .style("width", "100%")
                  .on("mouseover", function(d) {
                    d3.select(this)
                      .append("svg:title")
                      .classed("speakerText-cdr", true)
                      .classed(tab, true)
                      .text(function() {
                        return d;
                      });
                  })
                  .on("mouseout", function() {
                    d3.select(".speakerText-cdr." + tab).remove();
                  });

                // add margin to last object - better layout in container
                if (i === $scope.speakerOrderList[debateIndex].length - 1) {
                  d3.select(this)
                    .select(".utteranceGlyphTopicContainer-cdr." + tab)
                    .style("margin-bottom", "10px")
                    .classed("marginLastElement", true);
                }
              });

            // initialize tracking checkboxes
            for (let i = 0; i < $scope.speakerList[debateIndex].length; i++) {
              $scope.checkedSpeakerOfTab[debateIndex][i] = false;
            }

            // sometimes it is necessary to recalculate annotation height, for example if
            // multiple features are selected and the corresponding utterance-container increase in size when speaker gets annotated
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          } else {
            d3.selectAll(".speakerTag-cdr." + tab).remove();

            d3.selectAll(".object-cdr." + tab).attr("speaker", null);

            d3.select(".marginLastElement")
              .classed("marginLastElement", false)
              .style("margin-bottom", "unset");

            if ($scope.checkedSpeakerOfTab[debateIndex].includes(true)) {
              $scope.clearFilterSpeaker(tab, debateIndex);
            }
          }

          // update tracker
          textScrollListener();
        };

        /**
         * This Method is called while rendering the filter List.
         * It calculates the number of utterances a speaker spoke.
         */
        $scope.countUtterancesSpeaker = function(speaker, debateIndex) {
          let counter = 0;
          for (
            let i = 0;
            i < $scope.speakerOrderList[debateIndex].length;
            i++
          ) {
            if (speaker === $scope.speakerOrderList[debateIndex][i]) {
              counter++;
            }
          }
          return counter;
        };

        // declare for each tab a list that will track the selected filter for speaker
        $scope.checkedSpeakerOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedSpeakerOfTab[i] = [];
        }

        // create for each tab a own list which stores the selected speaker from the filter list
        $scope.selectedSpeakerLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedSpeakerLists[i] = [];
        }

        /**
         * This method manages a list of selected speaker of its corresponding tab.
         * Further it hides or show the corresponding utterances in the text and in
         * the overview for the filtered speakers and always check if topic filters are selected.
         * For overview also the attributes for pixel positions has to be reset, so that the tracker works correctly.
         * Further reset overview and text after each filter to top of container.
         * Also check if search is active to set or remove the highlighting of the words in those utterances.
         */
        $scope.filterSpeaker = function(speaker, checked, tab, debateIndex) {
          // reset sentence y start and end positions
          resetYPositionsSentences(tab);

          let element = getFirstSentenceInViewport(tab)[0];

          if (checked) {
            // store element
            $scope.selectedSpeakerLists[debateIndex].push(speaker);

            if ($scope.selectedSpeakerLists[debateIndex].length === 1) {
              if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
                // topics filtered

                // text
                // filter utterances by selected speaker
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.speaker-cdr-" + speaker + ")"
                )
                  .classed("utteranceFiltered-cdr", true)
                  .style("display", "none");

                // filter now utterances by selected topics
                d3.selectAll(".speaker-cdr-" + speaker + "." + tab).each(
                  function() {
                    if (
                      !$scope.selectedTopicsLists[debateIndex].includes(
                        parseInt(d3.select(this).attr("topic"))
                      )
                    ) {
                      d3.select(this)
                        .style("display", "none")
                        .classed("utteranceFiltered-cdr", true);
                    }
                  }
                );

                // overview
                // filter utterances by selected speaker
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.speakerOverview-cdr-" +
                    speaker +
                    ")"
                )
                  .style("display", "none")
                  .classed("overviewFiltered-cdr", true);

                // filter now utterances in overview by selected speakers
                d3.selectAll(
                  ".speakerOverview-cdr-" + speaker + "." + tab
                ).each(function() {
                  if (
                    !$scope.selectedTopicsLists[debateIndex].includes(
                      parseInt(d3.select(this).attr("topic"))
                    )
                  ) {
                    d3.select(this)
                      .style("display", "none")
                      .classed("overviewFiltered-cdr", true);
                  }
                });

                alignUtterancePixelInOverview(tab);
              } else {
                // topics not filtered

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.speaker-cdr-" + speaker + ")"
                )
                  .classed("utteranceFiltered-cdr", true)
                  .style("display", "none");

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.speakerOverview-cdr-" +
                    speaker +
                    ")"
                )
                  .style("display", "none")
                  .classed("overviewFiltered-cdr", true);

                alignUtterancePixelInOverview(tab);
              }

              // enable clear btn
              d3.select(".filterSpeakerClearBtn-cdr." + tab).property(
                "disabled",
                false
              );
            } else {
              if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
                // topics filtered
                // show utterances matching selected speaker
                // hide utterances that not match one of the selected topics

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ".speaker-cdr-" + speaker
                ).each(function() {
                  if (
                    !$scope.selectedTopicsLists[debateIndex].includes(
                      parseInt(d3.select(this).attr("topic"))
                    )
                  ) {
                    d3.select(this)
                      .classed("utteranceFiltered-cdr", true)
                      .style("display", "none");
                  } else {
                    d3.select(this)
                      .classed("utteranceFiltered-cdr", false)
                      .style("display", "flex");
                  }
                });

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ".speakerOverview-cdr-" +
                    speaker
                ).each(function() {
                  if (
                    !$scope.selectedTopicsLists[debateIndex].includes(
                      parseInt(d3.select(this).attr("topic"))
                    )
                  ) {
                    d3.select(this)
                      .style("display", "none")
                      .classed("overviewFiltered-cdr", true);
                  } else {
                    d3.select(this)
                      .style("display", "block")
                      .classed("overviewFiltered-cdr", false);
                  }
                });

                alignUtterancePixelInOverview(tab);
              } else {
                // topics not filtered
                // show utterance matching selected speaker

                // text
                d3.selectAll(".object-cdr." + tab + ".speaker-cdr-" + speaker)
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ".speakerOverview-cdr-" +
                    speaker
                )
                  .style("display", "block")
                  .classed("overviewFiltered-cdr", false);
                alignUtterancePixelInOverview(tab);
              }
            }
          } else {
            // remove the element
            $scope.selectedSpeakerLists[debateIndex].splice(
              $scope.selectedSpeakerLists[debateIndex].indexOf(speaker),
              1
            );

            if ($scope.selectedSpeakerLists[debateIndex].length === 0) {
              if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
                // topics filtered
                // show rest but only matching topics

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.speaker-cdr-" + speaker + ")"
                ).each(function() {
                  if (
                    $scope.selectedTopicsLists[debateIndex].includes(
                      parseInt(d3.select(this).attr("topic"))
                    )
                  ) {
                    d3.select(this)
                      .classed("utteranceFiltered-cdr", false)
                      .style("display", "flex");
                  }
                });

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.speakerOverview-cdr-" +
                    speaker +
                    ")"
                ).each(function() {
                  if (
                    $scope.selectedTopicsLists[debateIndex].includes(
                      parseInt(d3.select(this).attr("topic"))
                    )
                  ) {
                    d3.select(this)
                      .style("display", "block")
                      .classed("overviewFiltered-cdr", false);
                  }
                });
                alignUtterancePixelInOverview(tab);
              } else {
                // topics not filtered
                // show rest

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.speaker-cdr-" + speaker + ")"
                )
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");

                // overview
                d3.selectAll(".objectOverview-cdr." + tab)
                  .style("display", "block")
                  .style("transform", "translate(0px,0px)");

                d3.selectAll(".overviewFiltered-cdr." + tab).classed(
                  "overviewFiltered-cdr",
                  false
                );

                d3.select(".overviewSvg-cdr." + tab).style(
                  "height",
                  svgHeightTab[debateIndex]
                );
              }

              // enable clear btn
              d3.select(".filterSpeakerClearBtn-cdr." + tab).property(
                "disabled",
                true
              );
            } else {
              // hide

              // text
              d3.selectAll(".object-cdr." + tab + ".speaker-cdr-" + speaker)
                .classed("utteranceFiltered-cdr", true)
                .style("display", "none");

              // overview
              d3.selectAll(
                ".objectOverview-cdr." + tab + ".speakerOverview-cdr-" + speaker
              )
                .style("display", "none")
                .classed("overviewFiltered-cdr", true);
              alignUtterancePixelInOverview(tab);
            }
          }

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          // sometimes it happens that speaker annotation height is not correct
          // so recalculate height
          recalcSpeakerAnnotationHeight(
            $scope.speakerOrderList[$scope.speakerChecked.index],
            $scope.speakerChecked.tab
          );

          // check search is active and rerun search
          if ($scope.searchActiveOfTab[debateIndex]) {
            let word = $scope.lastSearchOfTab[debateIndex];
            $scope.cleanSearch(tab, debateIndex);
            $scope.search_words(word, tab, debateIndex);
          }
        };

        /**
         * This method resets the speaker filter selection.
         * Display all utterances again, further it checks if topics are filtered
         * and show only matching ones.
         * Same for the overview
         * Uncheck checkboxes and reset tracking list.
         * Disable clear btn.
         * Recalculate speaker annotation.
         */
        $scope.clearFilterSpeaker = function(tab, debateIndex) {
          // reset sentence y start and end positions
          resetYPositionsSentences(tab);

          // keep track of first sentence
          let element = getFirstSentenceInViewport(tab)[0];

          // check if topics filters selected
          if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
            // show only utterances matching topic

            // text
            d3.selectAll(".object-cdr." + tab).each(function() {
              if (
                $scope.selectedTopicsLists[debateIndex].includes(
                  parseInt(d3.select(this).attr("topic"))
                )
              ) {
                d3.select(this)
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");
              }
            });

            // overview
            d3.selectAll(".objectOverview-cdr." + tab).each(function() {
              if (
                $scope.selectedTopicsLists[debateIndex].includes(
                  parseInt(d3.select(this).attr("topic"))
                )
              ) {
                d3.select(this)
                  .style("display", "block")
                  .classed("overviewFiltered-cdr", false);
              }
            });

            alignUtterancePixelInOverview(tab);
          } else {
            // show all utterances

            //text
            d3.selectAll(".object-cdr." + tab)
              .classed("utteranceFiltered-cdr", false)
              .style("display", "flex");

            // overview
            d3.selectAll(".objectOverview-cdr." + tab)
              .style("display", "block")
              .style("transform", "translate(0px,0px)");

            d3.selectAll(".overviewFiltered-cdr." + tab).classed(
              "overviewFiltered-cdr",
              false
            );

            d3.select(".overviewSvg-cdr." + tab).style(
              "height",
              svgHeightTab[debateIndex]
            );
          }

          // clear selected speakers from list
          $scope.selectedSpeakerLists[debateIndex] = [];

          // disable clear btn
          d3.select(".filterSpeakerClearBtn-cdr." + tab).property(
            "disabled",
            true
          );

          // uncheck checked checkboxes
          // https://stackoverflow.com/questions/38671184/uncheck-all-checkboxes-in-angularjs
          for (let i = 0; i < $scope.speakerList[debateIndex].length; i++) {
            $scope.checkedSpeakerOfTab[debateIndex][i] = false;
          }

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          // need to be recalculated, since clearing the selection and
          // showing all utterances, lead to that the annotation height for
          // some utterances are to short. Especially then when further features
          // are annotated.
          recalcSpeakerAnnotationHeight(
            $scope.speakerOrderList[$scope.speakerChecked.index],
            $scope.speakerChecked.tab
          );

          // check search is active and rerun search
          if ($scope.searchActiveOfTab[debateIndex]) {
            let word = $scope.lastSearchOfTab[debateIndex];
            $scope.cleanSearch(tab, debateIndex);
            $scope.search_words(word, tab, debateIndex);
          }
        };

        /**
         * This method creates a modal window and displays
         * a description and the color encoding for the speaker
         */
        $scope.launchSpeakerInfo = function(debateIndex) {
          $uibModal
            .open({
              templateUrl: "views/modalWindowSpeakerInfoCDR.html",
              controller: "modalWindowSpeakerInfoController",
              scope: $scope,
              backdrop: false
            })
            .rendered.then(function() {
              $scope.speakerColors = d3.scaleOrdinal(
                $scope.speakerList[debateIndex],
                d3.schemeDark2
              );

              for (let i = 0; i < $scope.speakerList[debateIndex].length; i++) {
                let speaker = $scope.speakerList[debateIndex][i];

                let div = d3
                  .select("#speakerEncodingContainer")
                  .append("div")
                  .classed("speakerColorEncoding" + i, true)
                  .style("display", "flex")
                  .style("margin-top", "2px");

                let svg = div
                  .append("svg")
                  .attr("width", 10)
                  .attr("height", 10);

                svg
                  .append("rect")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", 10)
                  .attr("height", 10)
                  .attr("fill", $scope.speakerColors(speaker));

                // append speaker name
                d3.select(".speakerColorEncoding" + i)
                  .append("div")
                  .text(speaker)
                  .style("margin-left", "5px")
                  .style("margin-top", "-5px");
              }
            });
        };

        $scope.colorScaleNamedEntities = {
          CONTEXT: "#7F8BDB",
          "I-LOC": "#59CA8C",
          "I-ORG": "#61D4E1",
          "I-PER": "#E0882E",
          MEASURE: "#FED62E",
          NEGATIVE: "#EE736E",
          NUMBER: "#49495B",
          POSITIVE: "#9CB237",
          POLITENESS: "#B28C71",
          SPEAKER: "#E0882E",
          STATISTIC: "#E15DA5",
          TIME: "#AEB1A7",
          TITLE: "#BC6310"
        };

        // create dynamically an object and store for each tab a key value pair
        // necessary to decide on which tab the named entity checkbox was checked to display the categories
        $scope.showCategoriesNamedEntities = {};
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.showCategoriesNamedEntities[
            "showCategoriesNamedEntitiesOfTab" + i
          ] = false;
        }

        // declare for each tab a list that will track the selected categories for named entities
        $scope.checkedNamedEntityCategoriesOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedNamedEntityCategoriesOfTab[i] = [];
        }

        $scope.checkedNamedEntities = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedNamedEntities[i] = false;
        }

        /**
         * This method annotates the named entities in the data.
         * Check word by word if a word appears in one category, assign class and
         * annotate the word by its corresponding icon.
         * Further some keywords in the category itself can consist of multiple words,
         * therefore check the word and the following ones if they match the keyword.
         * Highlight them with dotted lines to visually show that they belong together.
         */ $scope.annotate_namedEntities = function(
          checked,
          tab,
          debateIndex
        ) {
          $scope.showCategoriesNamedEntities[
            "showCategoriesNamedEntitiesOfTab" + debateIndex
          ] = checked;

          $scope.checkedNamedEntities[debateIndex] = checked;

          let sentenceElement = getFirstSentenceInViewport(tab)[0];

          if (checked) {
            let words = [];
            // prepare data
            d3.selectAll(".wordDiv-cdr." + tab).each(function() {
              words.push(
                d3
                  .select(this)
                  .text()
                  .toLowerCase()
              );
            });

            d3.selectAll(".wordDiv-cdr." + tab)
              .data(words)
              .each(function(data, index) {
                let word = data;

                let found = false;
                let secondCheckFound = false;

                for (
                  let i = 0;
                  i < $scope.namedEntitiesList[debateIndex].length;
                  i++
                ) {
                  let obj = $scope.namedEntitiesList[debateIndex][i];
                  let key = Object.keys(angular.copy(obj))[0];
                  let values = Object.values(obj)[0];

                  // avoid that a word gets annotated twice by same icon
                  // a word at this point can contain an annotation, see while loop below
                  // PROBLEM: a word can be in multiple lists, but only one category will be shown
                  if (
                    values.includes(word) &&
                    // d3.select(this).attr("namedEntityCategory") !== key
                    !d3
                      .select(this)
                      .select("text")
                      .classed("namedEntityAnnotation-cdr") &&
                    !d3.select(this).classed("namedEntityAnnotationRemoved-cdr")
                    //&& !d3.select(this).classed("namedEntityAnnotationChanged-cdr")
                  ) {
                    // need second check if a ngram starts with the word
                    let matchedSequence = null;
                    for (let i = 0; i < values.length; i++) {
                      let val = values[i];
                      if (
                        val.startsWith(word + " ") ||
                        val.startsWith(word + "_")
                      ) {
                        let counter = 1;
                        let splitVal;
                        if (val.match(/_/g)) {
                          splitVal = val.split("_");
                        } else if (val.match(/\s/g)) {
                          splitVal = val.split(" ");
                        }

                        for (let j = 1; j < splitVal.length; j++) {
                          let nextPart = splitVal[j];
                          if (nextPart === words[index + j]) {
                            counter++;
                          }
                        }

                        // all matched
                        if (counter === splitVal.length) {
                          secondCheckFound = true;
                          matchedSequence = val;
                          break;
                        }
                      }
                    }

                    if (matchedSequence === null) {
                      if (modifiedFlag) {
                        for (
                          let i = 0;
                          i < changedNamedEntityAnnotationList.length;
                          i++
                        ) {
                          let entity = changedNamedEntityAnnotationList[i];
                          if (
                            entity.startsWith(word + " ") ||
                            entity.startsWith(word + "_")
                          ) {
                            let counter = 1;
                            let splitEntity;
                            if (entity.match(/_/g)) {
                              splitEntity = entity.split("_");
                            } else if (entity.match(/\s/g)) {
                              splitEntity = entity.split(" ");
                            }

                            for (let j = 1; j < splitEntity.length; j++) {
                              let nextPart = splitEntity[j];
                              if (nextPart === words[index + j]) {
                                counter++;
                              }
                            }

                            // all matched
                            if (counter === splitEntity.length) {
                              secondCheckFound = true;
                              break;
                            }
                          }
                        }
                      }
                    }

                    // if ngram not found then apply annotation to the word
                    if (!secondCheckFound) {
                      let wordDiv = d3.select(this);

                      wordDiv
                        .classed("namedEntity-cdr", true)
                        .classed(key, true)
                        .attr("namedEntityCategory", key)
                        .attr("assignedCategories", 1);

                      let icon = wordDiv.append("img");
                      icon
                        .classed("namedEntityIcon-cdr", true)
                        .classed(tab, true)
                        .classed(key, true)
                        .attr("namedEntityCategory", key)
                        .attr("src", function() {
                          return "svgIcons/entityIcons/" + key + ".svg";
                        })
                        .attr("data-toggle", "tooltip")
                        .attr("title", key)
                        .style("height", "20px")
                        .style("width", "20px")
                        .style("margin-top", "-1px")
                        .style("margin-left", "-3px");

                      let text = wordDiv.select("text");

                      text.classed("namedEntityAnnotation-cdr", true);

                      icon
                        .attr("previous", "none")
                        .attr("next", "false")
                        .attr("getWordId", text.attr("id"))
                        .attr("id", text.attr("id") + " icon1")
                        .attr("iconNum", 1);

                      found = true;
                    }
                  } else if (
                    d3.select(this).classed("namedEntityAnnotationRemoved-cdr")
                  ) {
                    found = true;
                  } else if (
                    values.includes(word) &&
                    d3.select(this).attr("namedEntityCategory") !== key &&
                    d3
                      .select(this)
                      .select("text")
                      .classed("namedEntityAnnotation-cdr")
                  ) {
                    // SOLUTION: for words in multiple lists
                    if (
                      d3
                        .select(this)
                        .select("text")
                        .attr("next") === "false" &&
                      d3
                        .select(this)
                        .select("text")
                        .attr("previous") === "none"
                    ) {
                      let wordDiv = d3.select(this);

                      let temp = parseInt(wordDiv.attr("assignedCategories"));
                      temp += 1;

                      wordDiv
                        .classed(key, true)
                        .attr("assignedCategories", temp);

                      let icon = wordDiv.append("img");
                      icon
                        .classed("namedEntityIcon-cdr", true)
                        .classed(tab, true)
                        .classed(key, true)
                        .attr("namedEntityCategory", key)
                        .attr("src", function() {
                          return "svgIcons/entityIcons/" + key + ".svg";
                        })
                        .attr("data-toggle", "tooltip")
                        .attr("title", key)
                        .style("height", "20px")
                        .style("width", "20px")
                        .style("margin-top", "-1px")
                        .style("margin-left", "-3px");

                      let text = wordDiv.select("text");

                      text.classed("namedEntityAnnotation-cdr", true);

                      icon
                        .attr("previous", "none")
                        .attr("next", "false")
                        .attr("getWordId", text.attr("id"))
                        .attr("id", text.attr("id") + " icon" + temp)
                        .attr("iconNum", temp);

                      found = true;
                    }
                  }
                }

                // ngram found
                if (!found) {
                  let assignedCounter = 0;

                  for (
                    let i = 0;
                    i < $scope.namedEntitiesList[debateIndex].length;
                    i++
                  ) {
                    let obj = $scope.namedEntitiesList[debateIndex][i];
                    let key = Object.keys(angular.copy(obj))[0];
                    let values = Object.values(obj)[0];

                    // if a word in category list consist of multiple words
                    for (let j = 0; j < values.length; j++) {
                      let value = values[j];

                      // check if category-word contains current word
                      // further improvement use stem of word?
                      if (
                        value.startsWith(word + " ") ||
                        value.startsWith(word + "_")
                      ) {
                        // separate category-word into independent words
                        let split;
                        if (value.match(/\s/g)) {
                          split = value.split(" ");
                        } else if (value.match(/_/g)) {
                          split = value.split("_");
                        }

                        let matchCounter = 0;
                        let nextWord = word;

                        // match separated-word with word
                        for (let k = 0; k < split.length; k++) {
                          let part = split[k];
                          if (part === nextWord) {
                            matchCounter++;
                            // get following word
                            nextWord = words[index + k + 1];
                          }
                        }

                        let prevList = [];

                        if (matchCounter === split.length) {
                          let parentNode = this.parentNode;

                          assignedCounter += 1;

                          let wordDiv = d3
                            .select(parentNode)
                            .select(".wordDiv-cdr");

                          let text = wordDiv.select("text");

                          prevList.push(text.attr("id"));

                          text
                            .classed("namedEntityOverline-cdr", true)
                            .classed(key, true)
                            .classed(tab, true)
                            .classed("namedEntityAnnotation-cdr", true)
                            .attr("namedEntityCategory", key)
                            .style(
                              "text-decoration",
                              "overline dotted " +
                                $scope.colorScaleNamedEntities[key]
                            )
                            .attr("previous", "none")
                            .attr("next", "true");

                          let nextSibling = parentNode.nextSibling;

                          while (matchCounter - 1 > 0) {
                            if (nextSibling !== null) {
                              if (nextSibling.nodeName === "#comment") {
                                // check if next element exists and skip ng-repeat comment
                                if (nextSibling.nextSibling !== null) {
                                  nextSibling = nextSibling.nextSibling;
                                }
                              } else {
                                matchCounter--;

                                if (matchCounter === 1) {
                                  // if last word - place icon after word
                                  // further assign prevList (id's of words in n-gram entity)
                                  // to the last element also for the icon
                                  // next and previous attributes initialized in content directive
                                  // for editing annotation

                                  let nextWordDiv = d3
                                    .select(nextSibling)
                                    .select(".wordDiv-cdr");

                                  let nextText = nextWordDiv.select("text");

                                  prevList.push(nextText.attr("id"));

                                  nextText
                                    .classed("namedEntityOverline-cdr", true)
                                    .classed(key, true)
                                    .classed(tab, true)
                                    .classed("namedEntityAnnotation-cdr", true)
                                    .attr("namedEntityCategory", key)
                                    .style(
                                      "text-decoration",
                                      "overline dotted " +
                                        $scope.colorScaleNamedEntities[key]
                                    )
                                    .attr("previous", function() {
                                      return JSON.stringify(prevList);
                                    })
                                    .attr("next", "false");

                                  nextWordDiv
                                    .classed("namedEntity-cdr", true)
                                    .classed(key, true)
                                    .attr("namedEntityCategory", key)
                                    .attr("assignedCategories", assignedCounter)
                                    .append("img")
                                    .classed("namedEntityIcon-cdr", true)
                                    .classed(tab, true)
                                    .classed(key, true)
                                    .attr("namedEntityCategory", key)
                                    .attr("src", function() {
                                      return (
                                        "svgIcons/entityIcons/" + key + ".svg"
                                      );
                                    })
                                    .attr("data-toggle", "tooltip")
                                    .attr("title", key)
                                    .style("height", "20px")
                                    .style("width", "20px")
                                    .style("margin-top", "-1px")
                                    .style("margin-left", "-3px")
                                    .attr("previous", function() {
                                      return JSON.stringify(prevList);
                                    })
                                    .attr("next", "false")
                                    .attr("id", nextText.attr("id") + " icon1")
                                    .attr("iconNum", 1);
                                } else {
                                  let next = d3
                                    .select(nextSibling)
                                    .select(".wordDiv-cdr")
                                    .select("text");

                                  prevList.push(next.attr("id"));

                                  next
                                    .classed("namedEntityOverline-cdr", true)
                                    .classed(key, true)
                                    .classed(tab, true)
                                    .classed("namedEntityAnnotation-cdr", true)
                                    .attr("namedEntityCategory", key)
                                    .style(
                                      "text-decoration",
                                      "overline dotted " +
                                        $scope.colorScaleNamedEntities[key]
                                    )
                                    .attr("previous", "none")
                                    .attr("next", "true");

                                  nextSibling = nextSibling.nextSibling;
                                }
                              }
                            } else {
                              break;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              });

            for (
              let i = 0;
              i < $scope.namedEntitiesList[debateIndex].length;
              i++
            ) {
              $scope.checkedNamedEntityCategoriesOfTab[debateIndex][i] = false;
            }

            // enable edit btn
            d3.select(".editNamedEntitiesBtn-cdr." + tab).property(
              "disabled",
              false
            );
          } else {
            // text
            d3.selectAll(".namedEntityIcon-cdr." + tab).remove();

            d3.selectAll(".namedEntityOverline-cdr." + tab)
              .style("text-decoration", "unset")
              .classed("namedEntityOverline-cdr", false);

            // need to be reset so that annotation after an uncheck correctly works
            d3.selectAll(".namedEntity-cdr." + tab).each(function() {
              let wordDiv = d3.select(this);
              let cat = wordDiv.attr("namedEntityCategory");

              wordDiv.classed(cat, false).attr("namedEntityCategory", null);

              wordDiv
                .select("text")
                .classed(cat, false)
                .classed("namedEntityAnnotation-cdr", false)
                .attr("namedEntityCategory", null)
                .attr("previous", "none")
                .attr("next", "false");
            });

            // overview
            if ($scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES") {
              d3.selectAll(
                ".namedEntityOverview-cdr.namedEntityAnnotationOverviewHidden-cdr." +
                  tab
              )
                .classed("namedEntityAnnotationOverviewHidden-cdr", false)
                .style("fill", function() {
                  return d3.select(this).attr("pixelColor");
                });
            }

            // reset datastructures
            if (
              $scope.checkedNamedEntityCategoriesOfTab[debateIndex].includes(
                true
              )
            ) {
              // disable clear btn
              d3.select(
                ".viewOptionsNamedEntitiesClearBtn-cdr." + tab
              ).property("disabled", true);

              // clear selected view options from list
              $scope.selectedCategoriesNamedEntityLists[debateIndex] = [];

              // clear tracking checkboxes
              for (
                let i = 0;
                i < $scope.namedEntitiesList[debateIndex].length;
                i++
              ) {
                $scope.checkedNamedEntityCategoriesOfTab[debateIndex] = [];
              }
            }

            let btn = d3.select(".editNamedEntitiesBtn-cdr." + tab);

            // reset edit btn
            if (btn.classed("editActive")) {
              flagEditNamedEntitiesBtnChecked = 0;
              $scope.namedEntitesEditChecked = false;

              document.removeEventListener("keydown", listener, true);

              btn.style("background", "#337ab7").classed("editActive", false);

              // enable view option list
              d3.selectAll(".categoryNamedEntityCheckbox-cdr." + tab).property(
                "disabled",
                false
              );

              // enable interaction with other features
              // pos tags
              d3.select("#posCheckBox-cdr\\ " + tab).property(
                "disabled",
                false
              );
              // sentiment
              d3.select("#sentimentCheckBox-cdr\\ " + tab).property(
                "disabled",
                false
              );
              // topics
              d3.select("#topicsCheckBox-cdr\\ " + tab).property(
                "disabled",
                false
              );
              // speaker
              d3.select("#speakerCheckBox-cdr\\ " + tab).property(
                "disabled",
                false
              );
              // dialog quality measures
              d3.select("#glyphCheckBox-cdr\\ " + tab).property(
                "disabled",
                false
              );
              // overview
              d3.select("#dropdownOverviewBtn-cdr\\ " + tab).property(
                "disabled",
                false
              );

              // remove event listeners
              removeEditListeners(tab);

              // reset nGram select mode
              if (nGramSelectMode) {
                nGramSelectMode = false;
                flagKeydown = 0;
                // remove event listeners
                removeEditListeners(tab);
                // disable indicator
                d3.select(".editMultiSelectIndicator-cdr." + tab).style(
                  "background-color",
                  "lightgrey"
                );
              }
            }

            // disable edit btn
            btn.property("disabled", true);
          }

          // keep visible sentence in container
          // build container ID and get container
          let containerID =
            "text_container-cdr " + $scope.filenames[debateIndex];
          let container = document.getElementById(containerID);
          let space = 20;

          // scroll sentence back into viewport
          container.scrollTop = sentenceElement.offsetTop - space;

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        // create for each tab a own list which stores the selected categories from the view options
        $scope.selectedCategoriesNamedEntityLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedCategoriesNamedEntityLists[i] = [];
        }

        /**
         * This method manages a list of selected named entity categories
         * of its corresponding tab.
         * Further it hides or show the selected category in the data.
         * Speaker annotation and pixel-tracker should be updated.
         */
        $scope.showSelectedNamedEntityCategories = function(
          namedEntity,
          checked,
          tab,
          debateIndex
        ) {
          if (checked) {
            // store element
            $scope.selectedCategoriesNamedEntityLists[debateIndex].push(
              namedEntity
            );

            // show only selected ones
            if (
              $scope.selectedCategoriesNamedEntityLists[debateIndex].length ===
              1
            ) {
              // hide rest
              d3.selectAll(
                ".namedEntityIcon-cdr." + tab + ":not(." + namedEntity + ")"
              )
                .classed("namedEntityAnnotationHidden-cdr", true)
                .style("display", "none");

              d3.selectAll(
                ".namedEntityOverline-cdr." + tab + ":not(." + namedEntity + ")"
              )
                .classed("namedEntityAnnotationHidden-cdr", true)
                .style("text-decoration", "unset");

              // enable clear btn
              d3.select(
                ".viewOptionsNamedEntitiesClearBtn-cdr." + tab
              ).property("disabled", false);

              // also in overview if it is selected
              if (
                $scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES"
              ) {
                d3.selectAll(
                  ".namedEntityOverview-cdr." +
                    tab +
                    ":not(." +
                    namedEntity +
                    ")"
                )
                  .classed("namedEntityAnnotationOverviewHidden-cdr", true)
                  .style("fill", "lightgrey");
              }
            } else {
              // show again
              d3.selectAll(".namedEntityIcon-cdr." + tab + "." + namedEntity)
                .style("display", "inline")
                .classed("namedEntityAnnotationHidden-cdr", false);

              d3.selectAll(
                ".namedEntityOverline-cdr." + tab + "." + namedEntity
              )
                .classed("namedEntityAnnotationHidden-cdr", false)
                .style("text-decoration", function() {
                  return (
                    "overline dotted " +
                    $scope.colorScaleNamedEntities[
                      d3.select(this).attr("namedEntityCategory")
                    ]
                  );
                });

              // also in overview if it is selected
              if (
                $scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES"
              ) {
                d3.selectAll(
                  ".namedEntityOverview-cdr." + tab + "." + namedEntity
                ).each(function() {
                  d3.select(this)
                    .classed("namedEntityAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                });
              }
            }
          } else {
            // remove the element
            $scope.selectedCategoriesNamedEntityLists[debateIndex].splice(
              $scope.selectedCategoriesNamedEntityLists[debateIndex].indexOf(
                namedEntity
              ),
              1
            );

            if (
              $scope.selectedCategoriesNamedEntityLists[debateIndex].length ===
              0
            ) {
              // show all
              d3.selectAll(
                ".namedEntityIcon-cdr." + tab + ":not(." + namedEntity + ")"
              )
                .classed("namedEntityAnnotationHidden-cdr", false)
                .style("display", "inline");

              d3.selectAll(
                ".namedEntityOverline-cdr." + tab + ":not(." + namedEntity + ")"
              )
                .classed("namedEntityAnnotationHidden-cdr", false)
                .style("text-decoration", function() {
                  return (
                    "overline dotted " +
                    $scope.colorScaleNamedEntities[
                      d3.select(this).attr("namedEntityCategory")
                    ]
                  );
                });

              // disable clear btn
              d3.select(
                ".viewOptionsNamedEntitiesClearBtn-cdr." + tab
              ).property("disabled", true);

              // also in overview if it is selected
              if (
                $scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES"
              ) {
                d3.selectAll(
                  ".namedEntityOverview-cdr." +
                    tab +
                    ":not(." +
                    namedEntity +
                    ")"
                ).each(function() {
                  d3.select(this)
                    .classed("namedEntityAnnotationOverviewHidden-cdr", false)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    });
                });
              }
            } else {
              // hide element
              d3.selectAll(".namedEntityIcon-cdr." + tab + "." + namedEntity)
                .classed("namedEntityAnnotationHidden-cdr", true)
                .style("display", "none");

              d3.selectAll(
                ".namedEntityOverline-cdr." + tab + "." + namedEntity
              )
                .classed("namedEntityAnnotationHidden-cdr", true)
                .style("text-decoration", "unset");

              // also in overview if it is selected
              if (
                $scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES"
              ) {
                d3.selectAll(
                  ".namedEntityOverview-cdr." + tab + "." + namedEntity
                )
                  .classed("namedEntityAnnotationOverviewHidden-cdr", false)
                  .style("fill", "lightgrey");
              }
            }
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method resets the selected view options for named entities.
         * Display all annotation again.
         * Uncheck checkboxes and reset tracking list.
         * Disable clear btn.
         * Recalculate speaker annotation when is checked and update pixel-tracker.
         */ $scope.clearViewOptionsNamedEntities = function(tab, debateIndex) {
          // show all
          d3.selectAll(
            ".namedEntityIcon-cdr." + tab + ".namedEntityAnnotationHidden-cdr"
          )
            .classed("namedEntityAnnotationHidden-cdr", false)
            .style("display", "inline");

          d3.selectAll(
            ".namedEntityOverline-cdr." +
              tab +
              ".namedEntityAnnotationHidden-cdr"
          )
            .classed("namedEntityAnnotationHidden-cdr", false)
            .style("text-decoration", function() {
              return (
                "overline dotted " +
                $scope.colorScaleNamedEntities[
                  d3.select(this).attr("namedEntityCategory")
                ]
              );
            });

          // disable clear btn
          d3.select(".viewOptionsNamedEntitiesClearBtn-cdr." + tab).property(
            "disabled",
            true
          );

          // enable edit btn
          d3.select(".editNamedEntitiesBtn-cdr." + tab).property(
            "disabled",
            false
          );

          // also in overview if it is selected
          if ($scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES") {
            d3.selectAll(
              ".namedEntityOverview-cdr." +
                tab +
                ".namedEntityAnnotationOverviewHidden-cdr"
            ).each(function() {
              d3.select(this)
                .classed("namedEntityAnnotationOverviewHidden-cdr", false)
                .style("fill", d3.select(this).attr("pixelColor"));
            });
          }

          // clear selected view options from list
          $scope.selectedCategoriesNamedEntityLists[debateIndex] = [];

          // uncheck checked checkboxes
          // https://stackoverflow.com/questions/38671184/uncheck-all-checkboxes-in-angularjs
          for (
            let i = 0;
            i < $scope.namedEntitiesList[debateIndex].length;
            i++
          ) {
            $scope.checkedNamedEntityCategoriesOfTab[debateIndex][i] = false;
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method creates a modal window and displays
         * a description and the encoding for named entities
         */
        $scope.launchNamedEntitiesInfo = function(debateIndex) {
          $uibModal
            .open({
              templateUrl: "views/modalWindowNamedEntitiesInfoCDR.html",
              controller: "modalWindowNamedEntitiesInfoController",
              scope: $scope,
              backdrop: false
            })
            .rendered.then(function() {
              let categoryList = [];
              // get available categories from data
              for (
                let i = 0;
                i < $scope.namedEntitiesList[debateIndex].length;
                i++
              ) {
                categoryList.push(
                  Object.keys(
                    angular.copy($scope.namedEntitiesList[debateIndex][i])
                  )[0]
                );
              }

              // select encoding container of modal window
              // append a div for each category in which icon and text are placed
              let div = d3
                .select("#namedEntityEncoding")
                .selectAll("div")
                .data(categoryList)
                .enter()
                .append("div")
                .style("display", "flex")
                .style("flex-wrap", "wrap")
                .style("flex-direction", "row");

              // append the category icons
              div
                .append("img")
                .attr("src", function(d) {
                  return "svgIcons/entityIcons/" + d + ".svg";
                })
                .style("height", "28px")
                .style("width", "28px");

              // append category name
              div
                .append("text")
                .text(function(d) {
                  return d;
                })
                .style("line-height", "2em");
            });
        };

        // ########################### NAMED ENTITIES EDIT ########################

        // TODO: apply changes to all occurrences - match list

        let flagEditNamedEntitiesBtnChecked = 0;
        let createContentMenuOnce = false;
        let menuNotAnnotated = [];
        let menuAnnotated = [
          {
            title: "remove annotation"
          }
        ];
        let nGramSelectMode = false;
        let flagKeydown = 0;
        let nGramSelectionIds = [];
        let nGramSelectionWords = [];
        $scope.namedEntitiesModifiedList = [];
        $scope.namedEntitesEditChecked = false;

        // https://stackoverflow.com/questions/256754/how-to-pass-arguments-to-addeventlistener-listener-function
        // https://medium.com/@DavideRama/removeeventlistener-and-anonymous-functions-ab9dbabd3e7b
        let listener;

        $scope.editNamedEntities = function(tab, debateIndex) {
          if (createContentMenuOnce === false) {
            for (
              let i = 0;
              i < $scope.namedEntitiesCategoriesList[debateIndex].length;
              i++
            ) {
              menuNotAnnotated.push({
                title: $scope.namedEntitiesCategoriesList[debateIndex][i]
              });
              menuAnnotated.push({
                title: $scope.namedEntitiesCategoriesList[debateIndex][i]
              });
            }

            // create copy of named entity data once - for manipulation
            $scope.namedEntitiesModifiedList = angular.copy(
              $scope.namedEntitiesOriginList
            );
            createContentMenuOnce = true;
          }

          if (flagEditNamedEntitiesBtnChecked === 0) {
            // btn clicked
            $scope.namedEntitesEditChecked = true;
            d3.select("#loading_indicator-cdr").style("display", "flex");

            flagEditNamedEntitiesBtnChecked = 1;
            d3.select(".editNamedEntitiesBtn-cdr." + tab)
              .style("background", "green")
              .classed("editActive", true);

            // reset all applied view options and filters for edit-mode
            // reset named entity view options
            if (
              $scope.checkedNamedEntityCategoriesOfTab[debateIndex].includes(
                true
              )
            ) {
              $scope.clearViewOptionsNamedEntities(tab, debateIndex);
            }
            // disable view option list
            d3.selectAll(".categoryNamedEntityCheckbox-cdr." + tab).property(
              "disabled",
              true
            );

            // reset filter for topics
            if ($scope.checkedTopicsOfTab[debateIndex].includes(true)) {
              $scope.clearFilterTopics(tab, debateIndex);
            }
            // reset filter for speaker
            if ($scope.checkedSpeakerOfTab[debateIndex].includes(true)) {
              $scope.clearFilterSpeaker(tab, debateIndex);
            }

            // uncheck all other features and disable interaction
            // pos tags
            if (
              d3.select("#posCheckBox-cdr\\ " + tab).classed("featureChecked")
            ) {
              $scope.annotate_pos(false, tab, debateIndex);
            }
            d3.select("#posCheckBox-cdr\\ " + tab).property("disabled", true);
            // sentiment
            if (
              d3
                .select("#sentimentCheckBox-cdr\\ " + tab)
                .classed("featureChecked")
            ) {
              $scope.annotate_sentiment(false, tab, debateIndex);
            }
            d3.select("#sentimentCheckBox-cdr\\ " + tab).property(
              "disabled",
              true
            );
            // topics
            if (
              d3
                .select("#topicsCheckBox-cdr\\ " + tab)
                .classed("featureChecked")
            ) {
              $scope.annotate_topics(false, tab, debateIndex);
            }
            d3.select("#topicsCheckBox-cdr\\ " + tab).property(
              "disabled",
              true
            );
            // speaker
            if (
              d3
                .select("#speakerCheckBox-cdr\\ " + tab)
                .classed("featureChecked")
            ) {
              $scope.annotate_speaker(false, tab, debateIndex);
            }
            d3.select("#speakerCheckBox-cdr\\ " + tab).property(
              "disabled",
              true
            );
            // dialog quality measures
            if (
              d3.select("#glyphCheckBox-cdr\\ " + tab).classed("featureChecked")
            ) {
              if (
                d3
                  .select(".glyphAnnotateBtn-cdr." + tab)
                  .classed("featureChecked")
              ) {
                $scope.remove_glyph_annotation(tab, debateIndex);
              }

              $scope.showGlyphFeatures(false, tab, debateIndex);
            }
            d3.select("#glyphCheckBox-cdr\\ " + tab).property("disabled", true);
            // overview
            if ($scope.featureOverviewOfTab[debateIndex] !== "DEFAULT") {
              $scope.renderOverview("DEFAULT", tab, debateIndex);
            }
            d3.select("#dropdownOverviewBtn-cdr\\ " + tab).property(
              "disabled",
              true
            );

            setTimeout(function() {
              // append edit event listeners
              initEditListeners(tab);

              d3.select("#loading_indicator-cdr").style("display", "none");
            }, 0);

            listener = function(evt) {
              // if edit mode is active and search field not in focus
              if (
                d3
                  .select(".editNamedEntitiesBtn-cdr." + tab)
                  .classed("editActive") &&
                document.getElementById("searchWords-cdr " + tab) !==
                  document.activeElement
              ) {
                // Q is pressed
                if (evt.key === "q") {
                  if (flagKeydown === 0) {
                    console.log("multi mode");
                    nGramSelectMode = true;
                    flagKeydown = 1;
                    initEditListeners(tab);
                    // enable indicator
                    d3.select(".editMultiSelectIndicator-cdr." + tab).style(
                      "background-color",
                      "greenyellow"
                    );
                  } else {
                    console.log("single mode");
                    removeEditListeners(tab);
                    nGramSelectMode = false;
                    flagKeydown = 0;

                    // discard selection when e.g. words are selected but key is pressed
                    if (nGramSelectionIds.length !== 0) {
                      for (let i = 0; i < nGramSelectionIds.length; i++) {
                        let textId = nGramSelectionIds[i];
                        let text = d3.select(
                          "#" + textId.replace(/\s/g, "\\ ")
                        );

                        text
                          .style("border", "none")
                          .classed("nGramSelection", false);
                      }
                      nGramSelectionIds = [];
                      nGramSelectionWords = [];
                    }

                    // disable indicator
                    d3.select(".editMultiSelectIndicator-cdr." + tab).style(
                      "background-color",
                      "lightgrey"
                    );
                  }
                }
              }
            };
            document.addEventListener("keydown", listener, true);
          } else {
            flagEditNamedEntitiesBtnChecked = 0;

            $scope.namedEntitesEditChecked = false;

            // remove event listeners
            removeEditListeners(tab);

            document.removeEventListener("keydown", listener, true);

            d3.select(".editNamedEntitiesBtn-cdr." + tab)
              .style("background", "#337ab7")
              .classed("editActive", false);

            // enable view option list named entities
            d3.selectAll(".categoryNamedEntityCheckbox-cdr." + tab).property(
              "disabled",
              false
            );

            if (nGramSelectMode) {
              nGramSelectMode = false;
              flagKeydown = 0;
              // remove event listeners
              removeEditListeners(tab);
              // disable indicator
              d3.select(".editMultiSelectIndicator-cdr." + tab).style(
                "background-color",
                "lightgrey"
              );
            }

            // enable interaction with other features
            // pos tags
            d3.select("#posCheckBox-cdr\\ " + tab).property("disabled", false);
            // sentiment
            d3.select("#sentimentCheckBox-cdr\\ " + tab).property(
              "disabled",
              false
            );
            // topics
            d3.select("#topicsCheckBox-cdr\\ " + tab).property(
              "disabled",
              false
            );
            // speaker
            d3.select("#speakerCheckBox-cdr\\ " + tab).property(
              "disabled",
              false
            );
            // dialog quality measures
            d3.select("#glyphCheckBox-cdr\\ " + tab).property(
              "disabled",
              false
            );
            // overview
            d3.select("#dropdownOverviewBtn-cdr\\ " + tab).property(
              "disabled",
              false
            );
          }
        };

        let appliedCategory;

        function initEditListeners(tab) {
          // set new listeners

          if (!nGramSelectMode) {
            // contextmenu for not annotated words
            d3.selectAll(".word-cdr:not(.namedEntityAnnotation-cdr)." + tab)
              .on(
                "contextmenu",
                d3.contextMenu(menuNotAnnotated, "noCategory", tab)
              )
              .style("cursor", "pointer");

            d3.selectAll(".word-cdr.namedEntityAnnotation-cdr." + tab)
              .on("contextmenu", function() {
                d3.event.preventDefault();
              })
              .style("cursor", "unset");

            // contextmenu for icons (annotated)
            d3.selectAll(".namedEntityIcon-cdr." + tab).each(function() {
              let elem = d3.select(this);
              let category = elem.attr("namedEntityCategory");

              elem
                .style("cursor", "pointer")
                .on(
                  "contextmenu",
                  d3.contextMenu(menuAnnotated, category, tab)
                );
            });
          } else {
            // keep contextmenu for annotated words (icon)
            // keep contextmenu for not annotated words
            // add click event for not annotated words
            d3.selectAll(
              ".word-cdr." + tab + ":not(.namedEntityAnnotation-cdr)"
            )
              .style("cursor", "pointer")
              .each(function() {
                d3.select(this).on("click", function() {
                  let text = d3.select(this);
                  let textId = text.attr("id");
                  let word = text.attr("value");

                  // avoid punctuation in selection
                  if (
                    word !== "punct" &&
                    !text.classed("namedEntityAnnotation-cdr")
                  ) {
                    if (!nGramSelectionIds.includes(textId)) {
                      // not in list

                      if (nGramSelectionIds.length === 0) {
                        // store first element
                        nGramSelectionIds.push(textId);
                        nGramSelectionWords.push(word);
                        // highlight selection
                        text
                          .style("border", "solid 1px black")
                          .classed("nGramSelection", true);
                      } else {
                        // check if we had to insert element before or after (for ordering)
                        // further check if element id difference is max 1:
                        //  * n-grams can only be selected if their are neighboring and in the same
                        //  * utterance>sentence hierarchy

                        if (nGramSelectionIds.length === 1) {
                          // get stored id
                          let storedId = nGramSelectionIds[0].match(/(\d+)/g);

                          let storedUtterId = storedId[0];
                          let storedSentId = storedId[1];
                          let storedWordId = storedId[2];

                          let selectedId = textId.match(/(\d+)/g);
                          let selectedUtterId = selectedId[0];
                          let selectedSentId = selectedId[1];
                          let selectedWordId = selectedId[2];

                          let diff = storedWordId - selectedWordId;

                          // same utterance, same sentence, neighbor
                          if (
                            storedUtterId === selectedUtterId &&
                            storedSentId === selectedSentId &&
                            Math.abs(diff) === 1
                          ) {
                            // check difference for insertion order
                            if (diff > 0) {
                              // before
                              nGramSelectionIds.unshift(textId);
                              nGramSelectionWords.unshift(word);
                            } else {
                              // after
                              nGramSelectionIds.push(textId);
                              nGramSelectionWords.push(word);
                            }

                            // highlight selection
                            text
                              .style("border", "solid 1px black")
                              .classed("nGramSelection", true);
                          }
                        } else {
                          // more than one element in list
                          // get first and last element - calc difference (max 1) - determine sequence ordering

                          let storedIdFirst = nGramSelectionIds[0].match(
                            /(\d+)/g
                          );
                          let storedIdLast = nGramSelectionIds[
                            nGramSelectionIds.length - 1
                          ].match(/(\d+)/g);

                          let storedUtterIdFirst = storedIdFirst[0];
                          let storedSentIdFirst = storedIdFirst[1];
                          let storedWordIdFirst = storedIdFirst[2];

                          let storedWordIdLast = storedIdLast[2];

                          let selectedId = textId.match(/(\d+)/g);
                          let selectedUtterId = selectedId[0];
                          let selectedSentId = selectedId[1];
                          let selectedWordId = selectedId[2];

                          let diffFirst = storedWordIdFirst - selectedWordId;
                          let diffLast = storedWordIdLast - selectedWordId;

                          // same utterance, same sentence, neighbor
                          if (
                            storedUtterIdFirst === selectedUtterId &&
                            storedSentIdFirst === selectedSentId &&
                            (Math.abs(diffFirst) === 1 ||
                              Math.abs(diffLast) === 1)
                          ) {
                            // determine insertion order
                            if (Math.abs(diffFirst) === 1) {
                              // before
                              nGramSelectionIds.unshift(textId);
                              nGramSelectionWords.unshift(word);
                            } else {
                              // after
                              nGramSelectionIds.push(textId);
                              nGramSelectionWords.push(word);
                            }

                            // highlight selection
                            text
                              .style("border", "solid 1px black")
                              .classed("nGramSelection", true);
                          }
                        }
                      }
                    } else {
                      // in list - remove from list

                      // if element between first and last - not remove

                      if (
                        nGramSelectionIds.indexOf(textId) === 0 ||
                        nGramSelectionIds.indexOf(textId) ===
                          nGramSelectionIds.length - 1
                      ) {
                        nGramSelectionIds.splice(
                          nGramSelectionIds.indexOf(textId),
                          1
                        );
                        nGramSelectionWords.splice(
                          nGramSelectionWords.indexOf(word),
                          1
                        );

                        // remove highlight from selection
                        text
                          .style("border", "none")
                          .classed("nGramSelection", false);
                      }
                    }
                  }
                });
              });
          }
        }

        function removeEditListeners(tab) {
          if (!nGramSelectMode) {
            d3.selectAll(".word-cdr." + tab)
              .on("contextmenu", null)
              .style("cursor", "unset");

            d3.selectAll(".namedEntityIcon-cdr." + tab)
              .on("contextmenu", null)
              .style("cursor", "unset");
          } else {
            // ngram select mode

            // remove click event from not annotated words
            // keep contextmenu
            d3.selectAll(
              ".word-cdr." + tab + ":not(.namedEntityAnnotation-cdr)"
            ).on("click", null);
          }
        }

        function updateEditListener(tab, id, appliedCategory) {
          if (!nGramSelectMode) {
            if (appliedCategory === "remove") {
              // apply new listener to word
              d3.select("#" + id.replace(/\s/g, "\\ "))
                .on(
                  "contextmenu",
                  d3.contextMenu(menuNotAnnotated, "noCategory", tab)
                )
                .style("cursor", "pointer");
            } else {
              // remove context from word
              d3.select("#" + id.replace(/\s/g, "\\ "))
                .on("contextmenu", null)
                .style("cursor", "unset");

              // apply context menu to icon
              let idIcon = id + " icon1";
              d3.select("#" + idIcon.replace(/\s/g, "\\ "))
                .style("cursor", "pointer")
                .on(
                  "contextmenu",
                  d3.contextMenu(menuAnnotated, appliedCategory, tab)
                );
            }
          } else {
            // ngram selection mode
            // still have click event and contextmenu

            if (appliedCategory === "remove") {
              // apply click listener to word
              d3.select("#" + id.replace(/\s/g, "\\ "))
                .style("cursor", "pointer")
                .on("click", function() {
                  let text = d3.select(this);
                  let textId = text.attr("id");
                  let word = text.attr("value");

                  // avoid punctuation in selection
                  if (word !== "punct") {
                    if (!nGramSelectionIds.includes(textId)) {
                      // not in list

                      if (nGramSelectionIds.length === 0) {
                        // store first element
                        nGramSelectionIds.push(textId);
                        nGramSelectionWords.push(word);
                        // highlight selection
                        text
                          .style("border", "solid 1px black")
                          .classed("nGramSelection", true);
                      } else {
                        // check if we had to insert element before or after (for ordering)
                        // further check if element id difference is max 1:
                        //  * n-grams can only be selected if their are neighboring and in the same
                        //  * utterance>sentence hierarchy

                        if (nGramSelectionIds.length === 1) {
                          // get stored id
                          let storedId = nGramSelectionIds[0].match(/(\d+)/g);

                          let storedUtterId = storedId[0];
                          let storedSentId = storedId[1];
                          let storedWordId = storedId[2];

                          let selectedId = textId.match(/(\d+)/g);
                          let selectedUtterId = selectedId[0];
                          let selectedSentId = selectedId[1];
                          let selectedWordId = selectedId[2];

                          let diff = storedWordId - selectedWordId;

                          // same utterance, same sentence, neighbor
                          if (
                            storedUtterId === selectedUtterId &&
                            storedSentId === selectedSentId &&
                            Math.abs(diff) === 1
                          ) {
                            // check difference for insertion order
                            if (diff > 0) {
                              // before
                              nGramSelectionIds.unshift(textId);
                              nGramSelectionWords.unshift(word);
                            } else {
                              // after
                              nGramSelectionIds.push(textId);
                              nGramSelectionWords.push(word);
                            }

                            // highlight selection
                            text
                              .style("border", "solid 1px black")
                              .classed("nGramSelection", true);
                          }
                        } else {
                          // more than one element in list
                          // get first and last element - calc difference (max 1) - determine sequence ordering

                          let storedIdFirst = nGramSelectionIds[0].match(
                            /(\d+)/g
                          );
                          let storedIdLast = nGramSelectionIds[
                            nGramSelectionIds.length - 1
                          ].match(/(\d+)/g);

                          let storedUtterIdFirst = storedIdFirst[0];
                          let storedSentIdFirst = storedIdFirst[1];
                          let storedWordIdFirst = storedIdFirst[2];

                          let storedWordIdLast = storedIdLast[2];

                          let selectedId = textId.match(/(\d+)/g);
                          let selectedUtterId = selectedId[0];
                          let selectedSentId = selectedId[1];
                          let selectedWordId = selectedId[2];

                          let diffFirst = storedWordIdFirst - selectedWordId;
                          let diffLast = storedWordIdLast - selectedWordId;

                          // same utterance, same sentence, neighbor
                          if (
                            storedUtterIdFirst === selectedUtterId &&
                            storedSentIdFirst === selectedSentId &&
                            (Math.abs(diffFirst) === 1 ||
                              Math.abs(diffLast) === 1)
                          ) {
                            // determine insertion order
                            if (Math.abs(diffFirst) === 1) {
                              // before
                              nGramSelectionIds.unshift(textId);
                              nGramSelectionWords.unshift(word);
                            } else {
                              // after
                              nGramSelectionIds.push(textId);
                              nGramSelectionWords.push(word);
                            }

                            // highlight selection
                            text
                              .style("border", "solid 1px black")
                              .classed("nGramSelection", true);
                          }
                        }
                      }
                    } else {
                      // in list - remove from list

                      // if element between first and last - not remove

                      if (
                        nGramSelectionIds.indexOf(textId) === 0 ||
                        nGramSelectionIds.indexOf(textId) ===
                          nGramSelectionIds.length - 1
                      ) {
                        nGramSelectionIds.splice(
                          nGramSelectionIds.indexOf(textId),
                          1
                        );
                        nGramSelectionWords.splice(
                          nGramSelectionWords.indexOf(word),
                          1
                        );

                        // remove highlight from selection
                        text
                          .style("border", "none")
                          .classed("nGramSelection", false);
                      }
                    }
                  }
                })
                .on(
                  "contextmenu",
                  d3.contextMenu(menuNotAnnotated, "noCategory", tab)
                );
            } else {
              // change / apply annotation

              // remove click event
              d3.select("#" + id.replace(/\s/g, "\\ "))
                .on("click", null)
                .style("cursor", "unset");

              // apply context to icon
              let idIcon = id + " icon";
              d3.select("#" + idIcon.replace(/\s/g, "\\ "))
                .style("cursor", "pointer")
                .on(
                  "contextmenu",
                  d3.contextMenu(menuAnnotated, appliedCategory, tab)
                );
            }
          }
        }

        d3.contextMenu = function(menu, category, tab, openCallback) {
          // create the div element that will hold the context menu
          d3.selectAll(".d3-context-menu")
            .data([1])
            .enter()
            .append("div")
            .attr("class", "d3-context-menu");

          // close menu
          d3.select("body").on("click.d3-context-menu", function() {
            d3.select(".d3-context-menu").style("display", "none");
          });

          // this gets executed when a contextmenu event occurs
          return function(data, indx) {
            let elm = this;

            let filteredMenu = menu;

            if (!nGramSelectMode) {
              // single word selected

              // preprocess the data with Array.filter
              // remove own category from options
              if (category !== "noCategory") {
                filteredMenu = filteredMenu.filter(d => {
                  return d.title !== category;
                });
              }

              d3.selectAll(".d3-context-menu").html("");
              let list = d3.selectAll(".d3-context-menu").append("ul");
              list
                .selectAll("li")
                .data(filteredMenu)
                .enter()
                .append("li")
                .style("cursor", "pointer")
                .style("padding", "5px 18px")
                .style("color", function(d) {
                  if (d.title === "remove annotation") {
                    return "red";
                  } else {
                    return "unset";
                  }
                })
                .html(function(d) {
                  return d.title;
                })
                .on("click", function(d) {
                  // d3.select(elm) refers to a word if not annotated
                  // d3.select(elm) refers to an icon if a word is annotated

                  if (
                    d3.select(elm).attr("next") === "false" &&
                    d3.select(elm).attr("previous") === "none"
                  ) {
                    // single entity

                    if (d.title === "remove annotation") {
                      // remove annotation - icon clicked
                      let icon = d3.select(elm);
                      let id = icon.attr("getWordId");
                      let category = icon.attr("namedEntityCategory");

                      let wordDiv = d3.select(elm.parentNode);

                      let num = parseInt(wordDiv.attr("assignedCategories"));

                      let iconNumber = icon.attr("iconNum");

                      if (num > 1) {
                        num -= 1;

                        wordDiv
                          .classed(category, false)
                          .attr("assignedCategories", num);

                        icon.remove();

                        let text = d3.select("#" + id.replace(/\s/g, "\\ "));
                        // update data
                        removeFromNamedEntityModifiedData(
                          tab,
                          category,
                          text.attr("value")
                        );

                        // apply modification to all other occurrences
                        text.classed("currentModified", true);
                        // get all occurrences of the word (ids)
                        let editList = [];

                        d3.selectAll(
                          ".word-cdr.word_" +
                            text.attr("value") +
                            "." +
                            tab +
                            ":not(.currentModified)"
                        )
                          .filter(function() {
                            return (
                              d3.select(this).attr("next") === "false" &&
                              d3.select(this).attr("previous") === "none"
                            );
                          })
                          .each(function() {
                            editList.push(d3.select(this).attr("id"));
                          });

                        text.classed("currentModified", false);

                        // modify annotation for those
                        for (let i = 0; i < editList.length; i++) {
                          // get id
                          let id = editList[i];
                          // get icon and remove
                          let icon = d3.select(
                            "#" +
                              id.replace(/\s/g, "\\ ") +
                              "\\ icon" +
                              iconNumber
                          );

                          // get wordDiv and modify attributes
                          let wordDiv = icon.node().parentNode;

                          d3.select(wordDiv)
                            .classed(category, false)
                            .attr("assignedCategories", num);

                          icon.remove();

                          updateEditListener(tab, id, appliedCategory);
                        }
                      } else {
                        wordDiv
                          .classed("namedEntity-cdr", false)
                          .classed("namedEntityAnnotationRemoved-cdr", true)
                          .classed("namedEntityAnnotationChanged-cdr", false)
                          .classed(category, false)
                          .attr("namedEntityCategory", null);

                        let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                        text
                          .classed("namedEntityAnnotation-cdr", false)
                          .classed(category, false)
                          .attr("namedEntityCategory", null);

                        icon.remove();
                        appliedCategory = "remove";
                        updateEditListener(tab, id, appliedCategory);

                        // update data
                        removeFromNamedEntityModifiedData(
                          tab,
                          category,
                          text.attr("value")
                        );

                        removedNamedEntityAnnotationList.push(
                          text.attr("value")
                        );

                        if (
                          changedNamedEntityAnnotationList.includes(
                            text.attr("value")
                          )
                        ) {
                          changedNamedEntityAnnotationList.splice(
                            changedNamedEntityAnnotationList.indexOf(
                              text.attr("value")
                            ),
                            1
                          );
                        }

                        // apply modification to all other occurrences
                        text.classed("currentModified", true);
                        // get all occurrences of the word (ids)
                        let editList = [];

                        d3.selectAll(
                          ".word-cdr.word_" +
                            text.attr("value") +
                            "." +
                            tab +
                            ":not(.currentModified)"
                        )
                          .filter(function() {
                            return (
                              d3.select(this).attr("next") === "false" &&
                              d3.select(this).attr("previous") === "none"
                            );
                          })
                          .each(function() {
                            editList.push(d3.select(this).attr("id"));
                          });

                        text.classed("currentModified", false);

                        // modify annotation for those
                        for (let i = 0; i < editList.length; i++) {
                          // get id
                          let id = editList[i];
                          // get icon and remove
                          let icon = d3.select(
                            "#" +
                              id.replace(/\s/g, "\\ ") +
                              "\\ icon" +
                              iconNumber
                          );

                          let text = d3.select("#" + id.replace(/\s/g, "\\ "));
                          text
                            .classed("namedEntityAnnotation-cdr", false)
                            .classed(category, false)
                            .attr("namedEntityCategory", null);

                          // get wordDiv and modify attributes
                          let wordDiv = icon.node().parentNode;

                          d3.select(wordDiv)
                            .classed("namedEntity-cdr", false)
                            .classed("namedEntityAnnotationRemoved-cdr", true)
                            .classed("namedEntityAnnotationChanged-cdr", false)
                            .classed(category, false)
                            .attr("namedEntityCategory", null);

                          icon.remove();

                          updateEditListener(tab, id, appliedCategory);
                        }
                      }
                    } else {
                      // apply
                      // if word has no annotation
                      if (!d3.select(elm).classed("namedEntityIcon-cdr")) {
                        let text = d3.select(elm);
                        let id = text.attr("id");

                        text
                          .classed("namedEntityAnnotation-cdr", true)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title);

                        // skip "span"-parent
                        let wordDiv = d3.select(elm.parentNode.parentNode);

                        wordDiv
                          .classed("namedEntity-cdr", true)
                          .classed(d.title, true)
                          .classed(
                            "namedEntityAnnotationChanged-cdr",
                            function() {
                              if (
                                d3
                                  .select(this)
                                  .classed("namedEntityAnnotationRemoved-cdr")
                              ) {
                                return true;
                              } else {
                                return false;
                              }
                            }
                          )
                          .classed("namedEntityAnnotationRemoved-cdr", false)
                          .attr("namedEntityCategory", d.title);

                        wordDiv
                          .append("img")
                          .classed("namedEntityIcon-cdr", true)
                          .classed(tab, true)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .attr("src", function() {
                            return "svgIcons/entityIcons/" + d.title + ".svg";
                          })
                          .attr("data-toggle", "tooltip")
                          .attr("title", d.title)
                          .style("height", "20px")
                          .style("width", "20px")
                          .style("margin-top", "-1px")
                          .style("margin-left", "-3px")
                          .attr("previous", "none")
                          .attr("next", "false")
                          .attr("getWordId", id)
                          .attr("id", text.attr("id") + " icon1")
                          .attr("iconNum", 1);

                        appliedCategory = d.title;
                        updateEditListener(tab, id, appliedCategory);

                        // update data
                        addToNamedEntityModifiedData(
                          tab,
                          appliedCategory,
                          text.attr("value")
                        );

                        if (
                          removedNamedEntityAnnotationList.includes(
                            text.attr("value")
                          )
                        ) {
                          removedNamedEntityAnnotationList.splice(
                            removedNamedEntityAnnotationList.indexOf(
                              text.attr("value")
                            ),
                            1
                          );

                          changedNamedEntityAnnotationList.push(
                            text.attr("value")
                          );
                        }

                        if (
                          wordDiv.classed("namedEntityAnnotationChanged-cdr")
                        ) {
                          let data =
                            $scope.namedEntitiesModifiedList[
                              $scope.filenames.indexOf(tab)
                            ];

                          for (let i = 0; i < data.length; i++) {
                            let obj = data[i];
                            let entityList = Object.values(obj)[0];

                            if (Object.keys(obj)[0] !== appliedCategory) {
                              if (entityList.includes(text.attr("value"))) {
                                entityList.splice(
                                  entityList.indexOf(text.attr("value")),
                                  1
                                );
                                changedNamedEntityAnnotationList.push(
                                  text.attr("value")
                                );
                              }
                            }
                          }

                          $scope.namedEntitiesList = angular.copy(
                            $scope.namedEntitiesModifiedList
                          );
                        }

                        // apply modification to all other occurrences
                        text.classed("currentModified", true);
                        // get all occurrences of the word (ids)
                        let editList = [];

                        d3.selectAll(
                          ".word-cdr.word_" +
                            text.attr("value") +
                            "." +
                            tab +
                            ":not(.currentModified)"
                        )
                          .filter(function() {
                            return (
                              d3.select(this).attr("next") === "false" &&
                              d3.select(this).attr("previous") === "none" &&
                              !d3
                                .select(this)
                                .classed("namedEntityAnnotation-cdr")
                            );
                          })
                          .each(function() {
                            editList.push(d3.select(this).attr("id"));
                          });

                        // TODO
                        // if ngram annotation removed and a word of it is annotated with a new category
                        // then check if the word with the current assigned category match other occurrence (word + category)
                        // if applied category is different then existing ones then apply change to them (change icon)

                        text.classed("currentModified", false);

                        // modify annotation for those
                        for (let i = 0; i < editList.length; i++) {
                          // get id (word)
                          let id = editList[i];

                          // get wordDiv and set attributes
                          let text = d3.select("#" + id.replace(/\s/g, "\\ "));
                          let wordDiv = text.node().parentNode.parentNode;

                          d3.select(wordDiv)
                            .classed("namedEntity-cdr", true)
                            .classed(d.title, true)
                            .classed(
                              "namedEntityAnnotationChanged-cdr",
                              function() {
                                if (
                                  d3
                                    .select(this)
                                    .classed("namedEntityAnnotationRemoved-cdr")
                                ) {
                                  return true;
                                } else {
                                  return false;
                                }
                              }
                            )
                            .classed("namedEntityAnnotationRemoved-cdr", false)
                            .attr("namedEntityCategory", d.title);

                          // append icon
                          d3.select(wordDiv)
                            .append("img")
                            .classed("namedEntityIcon-cdr", true)
                            .classed(tab, true)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("src", function() {
                              return "svgIcons/entityIcons/" + d.title + ".svg";
                            })
                            .attr("data-toggle", "tooltip")
                            .attr("title", d.title)
                            .style("height", "20px")
                            .style("width", "20px")
                            .style("margin-top", "-1px")
                            .style("margin-left", "-3px")
                            .attr("previous", "none")
                            .attr("next", "false")
                            .attr("getWordId", id)
                            .attr("id", text.attr("id") + " icon1")
                            .attr("iconNum", 1);

                          updateEditListener(tab, id, appliedCategory);
                        }
                      } else {
                        // change
                        // if word is already annotated
                        // no update of listener since it has already the correct one
                        let icon = d3.select(elm);
                        let category = icon.attr("namedEntityCategory");

                        let wordDiv = d3.select(elm.parentNode);

                        let iconNumber = icon.attr("iconNum");

                        let text = wordDiv.select("text");

                        wordDiv
                          .classed(category, false)
                          .classed(d.title, true)
                          .classed("namedEntityAnnotationChanged-cdr", true)
                          .classed("namedEntityAnnotationRemoved-cdr", false)
                          .attr("namedEntityCategory", d.title);

                        text
                          .classed(category, false)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title);

                        icon
                          .classed(category, false)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .attr("src", function() {
                            return "svgIcons/entityIcons/" + d.title + ".svg";
                          })
                          .attr("data-toggle", "tooltip")
                          .attr("title", d.title);

                        appliedCategory = d.title;

                        // appliedCategory need to be passed to the listener
                        icon.on(
                          "contextmenu",
                          d3.contextMenu(menuAnnotated, appliedCategory, tab)
                        );

                        // update data
                        removeFromNamedEntityModifiedData(
                          tab,
                          category,
                          text.attr("value")
                        );
                        addToNamedEntityModifiedData(
                          tab,
                          appliedCategory,
                          text.attr("value")
                        );

                        changedNamedEntityAnnotationList.push(
                          text.attr("value")
                        );

                        // apply modification to all other occurrences
                        text.classed("currentModified", true);
                        // get all occurrences of the word (ids)
                        let editList = [];

                        d3.selectAll(
                          ".word-cdr.word_" +
                            text.attr("value") +
                            "." +
                            tab +
                            ":not(.currentModified)"
                        )
                          .filter(function() {
                            return (
                              d3.select(this).attr("next") === "false" &&
                              d3.select(this).attr("previous") === "none"
                            );
                          })
                          .each(function() {
                            editList.push(d3.select(this).attr("id"));
                          });

                        text.classed("currentModified", false);

                        // modify annotation for those
                        for (let i = 0; i < editList.length; i++) {
                          // get id (word)
                          let id = editList[i];

                          // get wordDiv and set attributes
                          let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                          text
                            .classed(category, false)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .classed(d.title, true);

                          let wordDiv = text.node().parentNode.parentNode;

                          d3.select(wordDiv)
                            .classed(category, false)
                            .classed(d.title, true)
                            .classed("namedEntityAnnotationChanged-cdr", true)
                            .classed("namedEntityAnnotationRemoved-cdr", false)
                            .attr("namedEntityCategory", d.title);

                          // change attributes of icon
                          let icon = d3.select(
                            "#" +
                              id.replace(/\s/g, "\\ ") +
                              "\\ icon" +
                              iconNumber
                          );

                          icon
                            .classed(category, false)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("src", function() {
                              return "svgIcons/entityIcons/" + d.title + ".svg";
                            })
                            .attr("data-toggle", "tooltip")
                            .attr("title", d.title);

                          // appliedCategory need to be passed to the listener
                          icon.on(
                            "contextmenu",
                            d3.contextMenu(menuAnnotated, appliedCategory, tab)
                          );
                        }
                      }
                    }
                  } else {
                    // n-gram
                    // d3.select(elm) refers to the icon

                    let icon = d3.select(elm);
                    let iconNumber = icon.attr("iconNum");
                    let multiWordIds = JSON.parse(icon.attr("previous"));
                    let category = icon.attr("namedEntityCategory");

                    let multiWordList = [];

                    if (d.title === "remove annotation") {
                      // remove
                      appliedCategory = "remove";

                      let nGram = "";
                      for (let j = 0; j < multiWordIds.length; j++) {
                        let wordId = multiWordIds[j];

                        let text = d3.select(
                          "#" + wordId.replace(/\s/g, "\\ ")
                        );

                        let textWordDiv = text.node().parentNode.parentNode;
                        d3.select(textWordDiv)
                          .classed("namedEntityAnnotationRemoved-cdr", true)
                          .classed("namedEntityAnnotationChanged-cdr", false);

                        let cat = text.attr("namedEntityCategory");

                        // remove dots
                        text
                          .classed("namedEntityOverline-cdr", false)
                          .classed(cat, false)
                          .classed("namedEntityAnnotation-cdr", false)
                          .attr("namedEntityCategory", null)
                          .style("text-decoration", "none")
                          .attr("previous", "none")
                          .attr("next", "false");

                        nGram += text.attr("value") + " ";
                        multiWordList.push(text.attr("value"));

                        // last wordDiv contains icon
                        if (j === multiWordIds.length - 1) {
                          // change attributes of wordDiv
                          let wordDiv = d3.select(elm.parentNode);

                          wordDiv
                            .classed("namedEntity-cdr", false)
                            .classed(cat, false)
                            .classed("namedEntityAnnotationRemoved-cdr", true)
                            .classed("namedEntityAnnotationChanged-cdr", false)
                            .attr("namedEntityCategory", null)
                            .attr("assignedCategories", null);

                          // remove the icon
                          icon.remove();
                        }

                        updateEditListener(tab, wordId, appliedCategory);
                      }

                      // update data
                      nGram = nGram.trim();
                      removeFromNamedEntityModifiedData(tab, category, nGram);
                      removedNamedEntityAnnotationList.push(nGram);
                      if (changedNamedEntityAnnotationList.includes(nGram)) {
                        changedNamedEntityAnnotationList.splice(
                          changedNamedEntityAnnotationList.indexOf(nGram),
                          1
                        );
                      }

                      let firstWordId = multiWordIds[0];
                      let firstText = d3.select(
                        "#" + firstWordId.replace(/\s/g, "\\ ")
                      );

                      let firstWord = multiWordList[0];

                      // apply modification to all other occurrences
                      firstText.classed("currentModified", true);
                      // get all occurrences of the word (ids)
                      let editList = [];

                      // search for occurrence of first word, then check if sequence match
                      d3.selectAll(
                        ".word-cdr.word_" +
                          firstWord +
                          "." +
                          tab +
                          ":not(.currentModified)"
                      ).each(function() {
                        let elemId = d3
                          .select(this)
                          .attr("id")
                          .split(" ");
                        let wordId = elemId[2].match(/(\d+)/g);

                        if (multiWordList.length > 1) {
                          let nextWordId = parseInt(wordId) + 1;

                          let nextId =
                            "#" +
                            elemId[0] +
                            " " +
                            elemId[1] +
                            " word" +
                            nextWordId +
                            " " +
                            tab;

                          if (
                            d3.select(nextId.replace(/\s/g, "\\ "))[0][0] !==
                            null
                          ) {
                            let nextWord = d3
                              .select(nextId.replace(/\s/g, "\\ "))
                              .attr("value");

                            let counter = 1;
                            for (let j = 1; j < multiWordList.length; j++) {
                              if (nextWord === multiWordList[j]) {
                                counter++;
                              }

                              if (j < multiWordList.length - 1) {
                                nextWordId += 1;
                                nextId =
                                  "#" +
                                  elemId[0] +
                                  " " +
                                  elemId[1] +
                                  " word" +
                                  nextWordId +
                                  " " +
                                  tab;

                                if (
                                  d3.select(
                                    nextId.replace(/\s/g, "\\ ")
                                  )[0][0] !== null
                                ) {
                                  nextWord = d3
                                    .select(nextId.replace(/\s/g, "\\ "))
                                    .attr("value");
                                }
                              }
                            }

                            if (counter === multiWordList.length) {
                              editList.push(d3.select(this).attr("id"));
                            }
                          }
                        }
                      });

                      firstText.classed("currentModified", false);

                      // at this point edit list contains the first id's (word) of a matching n-grams

                      for (let i = 0; i < editList.length; i++) {
                        let id = editList[i];

                        let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                        let textWordDiv = text.node().parentNode.parentNode;
                        d3.select(textWordDiv)
                          .classed("namedEntityAnnotationRemoved-cdr", true)
                          .classed("namedEntityAnnotationChanged-cdr", false);

                        let cat = text.attr("namedEntityCategory");
                        // remove dots
                        text
                          .classed("namedEntityOverline-cdr", false)
                          .classed(cat, false)
                          .classed("namedEntityAnnotation-cdr", false)
                          .attr("namedEntityCategory", null)
                          .style("text-decoration", "none")
                          .attr("previous", "none")
                          .attr("next", "false");

                        updateEditListener(tab, id, appliedCategory);

                        let tempId = id.split(" ");
                        let wordId = parseInt(tempId[2].match(/(\d+)/g)[0]);

                        for (let j = 1; j < multiWordList.length; j++) {
                          let nextId = wordId + j;
                          let id =
                            tempId[0] +
                            " " +
                            tempId[1] +
                            " " +
                            "word" +
                            nextId +
                            " " +
                            tab;

                          if (j < multiWordList.length - 1) {
                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv)
                              .classed("namedEntityAnnotationRemoved-cdr", true)
                              .classed(
                                "namedEntityAnnotationChanged-cdr",
                                false
                              );

                            let cat = text.attr("namedEntityCategory");
                            // remove dots
                            text
                              .classed("namedEntityOverline-cdr", false)
                              .classed(cat, false)
                              .classed("namedEntityAnnotation-cdr", false)
                              .attr("namedEntityCategory", null)
                              .style("text-decoration", "none")
                              .attr("previous", "none")
                              .attr("next", "false");
                          } else {
                            // last

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );
                            let cat = text.attr("namedEntityCategory");
                            let textWordDiv = text.node().parentNode.parentNode;

                            d3.select(textWordDiv)
                              .classed("namedEntityAnnotationRemoved-cdr", true)
                              .classed(
                                "namedEntityAnnotationChanged-cdr",
                                false
                              )
                              .classed(cat, false)
                              .attr("assignedCategories", null);

                            // remove dots
                            text
                              .classed("namedEntityOverline-cdr", false)
                              .classed(cat, false)
                              .classed("namedEntityAnnotation-cdr", false)
                              .attr("namedEntityCategory", null)
                              .style("text-decoration", "none")
                              .attr("previous", "none")
                              .attr("next", "false");

                            // remove icon
                            let icon = d3.select(
                              "#" +
                                id.replace(/\s/g, "\\ ") +
                                "\\ icon" +
                                iconNumber
                            );

                            icon.remove();
                          }

                          updateEditListener(tab, id, appliedCategory);
                        }
                      }
                    } else {
                      // change - no update of event listeners necessary
                      // only change color and attributes of elements

                      appliedCategory = d.title;

                      let nGram = "";
                      for (let j = 0; j < multiWordIds.length; j++) {
                        let wordId = multiWordIds[j];

                        let text = d3.select(
                          "#" + wordId.replace(/\s/g, "\\ ")
                        );
                        let cat = text.attr("namedEntityCategory");

                        let textWordDiv = text.node().parentNode.parentNode;
                        d3.select(textWordDiv).classed(
                          "namedEntityAnnotationChanged-cdr",
                          true
                        );

                        // change color of dots
                        text
                          .classed(cat, false)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .style(
                            "text-decoration",
                            "overline dotted " +
                              $scope.colorScaleNamedEntities[d.title]
                          );

                        nGram += text.attr("value") + " ";
                        multiWordList.push(text.attr("value"));

                        if (j === multiWordIds.length - 1) {
                          // change attributes of wordDiv
                          let wordDiv = d3.select(elm.parentNode);

                          wordDiv
                            .classed(cat, false)
                            .classed(d.title, true)
                            .classed("namedEntityAnnotationChanged-cdr", true)
                            .attr("namedEntityCategory", d.title);

                          // change icon
                          icon
                            .classed(cat, false)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("src", function() {
                              return "svgIcons/entityIcons/" + d.title + ".svg";
                            })
                            .attr("data-toggle", "tooltip")
                            .attr("title", d.title);

                          // appliedCategory need to be passed to the listener
                          icon.on(
                            "contextmenu",
                            d3.contextMenu(menuAnnotated, appliedCategory, tab)
                          );
                        }
                      }

                      // update data
                      nGram = nGram.trim();
                      removeFromNamedEntityModifiedData(tab, category, nGram);
                      addToNamedEntityModifiedData(tab, appliedCategory, nGram);
                      changedNamedEntityAnnotationList.push(nGram);

                      let firstWordId = multiWordIds[0];
                      let firstText = d3.select(
                        "#" + firstWordId.replace(/\s/g, "\\ ")
                      );

                      let firstWord = multiWordList[0];

                      // apply modification to all other occurrences
                      firstText.classed("currentModified", true);
                      // get all occurrences of the word (ids)
                      let editList = [];

                      // search for occurrence of first word, then check if sequence match
                      d3.selectAll(
                        ".word-cdr.word_" +
                          firstWord +
                          "." +
                          tab +
                          ":not(.currentModified)"
                      ).each(function() {
                        let elemId = d3
                          .select(this)
                          .attr("id")
                          .split(" ");
                        let wordId = elemId[2].match(/(\d+)/g);

                        if (multiWordList.length > 1) {
                          let nextWordId = parseInt(wordId) + 1;

                          let nextId =
                            "#" +
                            elemId[0] +
                            " " +
                            elemId[1] +
                            " word" +
                            nextWordId +
                            " " +
                            tab;

                          if (
                            d3.select(nextId.replace(/\s/g, "\\ "))[0][0] !==
                            null
                          ) {
                            let nextWord = d3
                              .select(nextId.replace(/\s/g, "\\ "))
                              .attr("value");

                            let counter = 1;
                            for (let j = 1; j < multiWordList.length; j++) {
                              if (nextWord === multiWordList[j]) {
                                counter++;
                              }

                              if (j < multiWordList.length - 1) {
                                nextWordId += 1;
                                nextId =
                                  "#" +
                                  elemId[0] +
                                  " " +
                                  elemId[1] +
                                  " word" +
                                  nextWordId +
                                  " " +
                                  tab;

                                if (
                                  d3.select(
                                    nextId.replace(/\s/g, "\\ ")
                                  )[0][0] !== null
                                ) {
                                  nextWord = d3
                                    .select(nextId.replace(/\s/g, "\\ "))
                                    .attr("value");
                                }
                              }
                            }

                            if (counter === multiWordList.length) {
                              editList.push(d3.select(this).attr("id"));
                            }
                          }
                        }
                      });

                      firstText.classed("currentModified", false);

                      // at this point edit list contains the first id's (word) of a matching n-grams

                      for (let i = 0; i < editList.length; i++) {
                        let id = editList[i];

                        let text = d3.select("#" + id.replace(/\s/g, "\\ "));
                        let cat = text.attr("namedEntityCategory");

                        let textWordDiv = text.node().parentNode.parentNode;
                        d3.select(textWordDiv).classed(
                          "namedEntityAnnotationChanged-cdr",
                          true
                        );

                        // change color of dots
                        text
                          .classed(cat, false)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .style(
                            "text-decoration",
                            "overline dotted " +
                              $scope.colorScaleNamedEntities[d.title]
                          );

                        let tempId = id.split(" ");
                        let wordId = parseInt(tempId[2].match(/(\d+)/g)[0]);

                        for (let j = 1; j < multiWordList.length; j++) {
                          let nextId = wordId + j;
                          let id =
                            tempId[0] +
                            " " +
                            tempId[1] +
                            " " +
                            "word" +
                            nextId +
                            " " +
                            tab;

                          if (j < multiWordList.length - 1) {
                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv).classed(
                              "namedEntityAnnotationChanged-cdr",
                              true
                            );

                            let cat = text.attr("namedEntityCategory");
                            // change color of dots
                            text
                              .classed(cat, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .style(
                                "text-decoration",
                                "overline dotted " +
                                  $scope.colorScaleNamedEntities[d.title]
                              );
                          } else {
                            // last

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );
                            let cat = text.attr("namedEntityCategory");
                            let textWordDiv = text.node().parentNode.parentNode;

                            // change color of dots
                            text
                              .classed(cat, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .style(
                                "text-decoration",
                                "overline dotted " +
                                  $scope.colorScaleNamedEntities[d.title]
                              );

                            d3.select(textWordDiv)
                              .classed(cat, false)
                              .classed(d.title, true)
                              .classed("namedEntityAnnotationChanged-cdr", true)
                              .attr("namedEntityCategory", d.title);

                            let icon = d3.select(
                              "#" +
                                id.replace(/\s/g, "\\ ") +
                                "\\ icon" +
                                iconNumber
                            );

                            // change icon
                            icon
                              .classed(cat, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .attr("src", function() {
                                return (
                                  "svgIcons/entityIcons/" + d.title + ".svg"
                                );
                              })
                              .attr("data-toggle", "tooltip")
                              .attr("title", d.title);

                            // appliedCategory need to be passed to the listener
                            icon.on(
                              "contextmenu",
                              d3.contextMenu(
                                menuAnnotated,
                                appliedCategory,
                                tab
                              )
                            );
                          }
                        }
                      }
                    }
                  }

                  d3.select(".d3-context-menu").style("display", "none");
                });

              // the openCallback allows an action to fire before the menu is displayed
              // an example usage would be closing a tooltip
              if (openCallback) openCallback(data, indx);

              // display context menu
              d3.select(".d3-context-menu")
                .style("left", d3.event.pageX - 2 + "px")
                .style("top", d3.event.pageY - 2 + "px")
                .style("display", "block");

              d3.event.preventDefault();
            } else {
              // multi selection mode

              // open menu only if more than one word is selected
              if (nGramSelectionIds.length > 1) {
                d3.selectAll(".d3-context-menu").html("");
                let list = d3.selectAll(".d3-context-menu").append("ul");
                list
                  .selectAll("li")
                  .data(filteredMenu)
                  .enter()
                  .append("li")
                  .style("cursor", "pointer")
                  .style("padding", "5px 18px")
                  .html(function(d) {
                    return d.title;
                  })
                  .on("click", function(d) {
                    // assign new category to selected multiple words

                    // since we can only select not annotated words -
                    // no remove option (remove annotation) available in context menu
                    // so we can just apply the annotation and update listener
                    appliedCategory = d.title;

                    let tempIdList = [];
                    let nGram = "";

                    for (let j = 0; j < nGramSelectionIds.length; j++) {
                      let wordId = nGramSelectionIds[j];

                      tempIdList.push(wordId);

                      let text = d3.select("#" + wordId.replace(/\s/g, "\\ "));

                      if (j < nGramSelectionIds.length - 1) {
                        // apply dots
                        text
                          .classed(d.title, true)
                          .classed("nGramSelection", false)
                          .classed("namedEntityOverline-cdr", true)
                          .classed("namedEntityAnnotation-cdr", true)
                          .style("border", "none")
                          .style(
                            "text-decoration",
                            "overline dotted " +
                              $scope.colorScaleNamedEntities[d.title]
                          )
                          .attr("namedEntityCategory", d.title)
                          .attr("next", "true")
                          .attr("previous", "none");

                        let textWordDiv = text.node().parentNode.parentNode;
                        d3.select(textWordDiv)
                          .classed(
                            "namedEntityAnnotationChanged-cdr",
                            function() {
                              if (
                                d3
                                  .select(this)
                                  .classed("namedEntityAnnotationRemoved-cdr")
                              ) {
                                return true;
                              } else {
                                return false;
                              }
                            }
                          )
                          .classed("namedEntityAnnotationRemoved-cdr", false);

                        nGram += text.attr("value") + " ";
                      } else {
                        // apply dots
                        text
                          .classed(d.title, true)
                          .classed("nGramSelection", false)
                          .classed("namedEntityOverline-cdr", true)
                          .classed("namedEntityAnnotation-cdr", true)
                          .style("border", "none")
                          .style(
                            "text-decoration",
                            "overline dotted " +
                              $scope.colorScaleNamedEntities[d.title]
                          )
                          .attr("namedEntityCategory", d.title)
                          .attr("next", "false")
                          .attr("previous", JSON.stringify(tempIdList));

                        nGram += text.attr("value");

                        // set attributes for wordDiv - have to skip span-parent
                        let wordDivNode = text.node().parentNode.parentNode;
                        let wordDiv = d3.select(wordDivNode);

                        wordDiv
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .classed(
                            "namedEntityAnnotationChanged-cdr",
                            function() {
                              if (
                                d3
                                  .select(this)
                                  .classed("namedEntityAnnotationRemoved-cdr")
                              ) {
                                return true;
                              } else {
                                return false;
                              }
                            }
                          )
                          .classed("namedEntityAnnotationRemoved-cdr", false);

                        // append icon
                        wordDiv
                          .append("img")
                          .classed("namedEntityIcon-cdr", true)
                          .classed(tab, true)
                          .classed(d.title, true)
                          .attr("namedEntityCategory", d.title)
                          .attr("src", function() {
                            return "svgIcons/entityIcons/" + d.title + ".svg";
                          })
                          .attr("data-toggle", "tooltip")
                          .attr("title", d.title)
                          .style("height", "20px")
                          .style("width", "20px")
                          .style("margin-top", "-1px")
                          .style("margin-left", "-3px")
                          .attr("previous", JSON.stringify(tempIdList))
                          .attr("next", "false")
                          .attr("getWordId", wordId)
                          .attr("id", wordId + " icon1")
                          .attr("iconNum", 1);
                      }

                      // update listeners
                      updateEditListener(tab, wordId, appliedCategory);
                    }

                    // update data
                    nGram = nGram.trim();
                    addToNamedEntityModifiedData(tab, appliedCategory, nGram);
                    if (removedNamedEntityAnnotationList.includes(nGram)) {
                      removedNamedEntityAnnotationList.splice(
                        removedNamedEntityAnnotationList.indexOf(nGram),
                        1
                      );
                    }

                    let firstWordId = nGramSelectionIds[0];
                    let firstText = d3.select(
                      "#" + firstWordId.replace(/\s/g, "\\ ")
                    );

                    let firstWord = nGramSelectionWords[0];

                    // apply modification to all other occurrences
                    firstText.classed("currentModified", true);
                    // get all occurrences of the word (ids)
                    let editList = [];

                    // search for occurrence of first word, then check if sequence match
                    d3.selectAll(
                      ".word-cdr.word_" +
                        firstWord +
                        "." +
                        tab +
                        ":not(.currentModified)"
                    ).each(function() {
                      let elemId = d3
                        .select(this)
                        .attr("id")
                        .split(" ");
                      let wordId = elemId[2].match(/(\d+)/g);

                      if (nGramSelectionWords.length > 1) {
                        let nextWordId = parseInt(wordId) + 1;

                        let nextId =
                          "#" +
                          elemId[0] +
                          " " +
                          elemId[1] +
                          " word" +
                          nextWordId +
                          " " +
                          tab;

                        if (
                          d3.select(nextId.replace(/\s/g, "\\ "))[0][0] !== null
                        ) {
                          let nextWord = d3
                            .select(nextId.replace(/\s/g, "\\ "))
                            .attr("value");

                          let counter = 1;
                          for (let j = 1; j < nGramSelectionWords.length; j++) {
                            if (nextWord === nGramSelectionWords[j]) {
                              counter++;
                            }

                            if (j < nGramSelectionWords.length - 1) {
                              nextWordId += 1;
                              nextId =
                                "#" +
                                elemId[0] +
                                " " +
                                elemId[1] +
                                " word" +
                                nextWordId +
                                " " +
                                tab;

                              if (
                                d3.select(
                                  nextId.replace(/\s/g, "\\ ")
                                )[0][0] !== null
                              ) {
                                nextWord = d3
                                  .select(nextId.replace(/\s/g, "\\ "))
                                  .attr("value");
                              }
                            }
                          }

                          if (counter === nGramSelectionWords.length) {
                            editList.push(d3.select(this).attr("id"));
                          }
                        }
                      }
                    });

                    firstText.classed("currentModified", false);

                    // at this point edit list contains the first id's (word) of a matching n-grams

                    for (let i = 0; i < editList.length; i++) {
                      let id = editList[i];
                      let tempIdList = [];

                      tempIdList.push(id);

                      let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                      // apply dots
                      text
                        .classed(d.title, true)
                        .classed("namedEntityOverline-cdr", true)
                        .classed("namedEntityAnnotation-cdr", true)
                        .style(
                          "text-decoration",
                          "overline dotted " +
                            $scope.colorScaleNamedEntities[d.title]
                        )
                        .attr("namedEntityCategory", d.title)
                        .attr("next", "true")
                        .attr("previous", "none");

                      let textWordDiv = text.node().parentNode.parentNode;
                      d3.select(textWordDiv)
                        .classed(
                          "namedEntityAnnotationChanged-cdr",
                          function() {
                            if (
                              d3
                                .select(this)
                                .classed("namedEntityAnnotationRemoved-cdr")
                            ) {
                              return true;
                            } else {
                              return false;
                            }
                          }
                        )
                        .classed("namedEntityAnnotationRemoved-cdr", false);

                      let tempId = id.split(" ");
                      let wordId = parseInt(tempId[2].match(/(\d+)/g)[0]);

                      for (let j = 1; j < nGramSelectionWords.length; j++) {
                        let nextId = wordId + j;
                        let id =
                          tempId[0] +
                          " " +
                          tempId[1] +
                          " " +
                          "word" +
                          nextId +
                          " " +
                          tab;

                        tempIdList.push(id);

                        if (j < nGramSelectionWords.length - 1) {
                          let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                          let textWordDiv = text.node().parentNode.parentNode;
                          d3.select(textWordDiv)
                            .classed(
                              "namedEntityAnnotationChanged-cdr",
                              function() {
                                if (
                                  d3
                                    .select(this)
                                    .classed("namedEntityAnnotationRemoved-cdr")
                                ) {
                                  return true;
                                } else {
                                  return false;
                                }
                              }
                            )
                            .classed("namedEntityAnnotationRemoved-cdr", false);

                          // apply dots
                          text
                            .classed(d.title, true)
                            .classed("nGramSelection", false)
                            .classed("namedEntityOverline-cdr", true)
                            .classed("namedEntityAnnotation-cdr", true)
                            .style("border", "none")
                            .style(
                              "text-decoration",
                              "overline dotted " +
                                $scope.colorScaleNamedEntities[d.title]
                            )
                            .attr("namedEntityCategory", d.title)
                            .attr("next", "true")
                            .attr("previous", "none");
                        } else {
                          // last

                          let text = d3.select("#" + id.replace(/\s/g, "\\ "));

                          let textWordDiv = text.node().parentNode.parentNode;

                          // apply dots
                          text
                            .classed(d.title, true)
                            .classed("namedEntityOverline-cdr", true)
                            .classed("namedEntityAnnotation-cdr", true)
                            .style(
                              "text-decoration",
                              "overline dotted " +
                                $scope.colorScaleNamedEntities[d.title]
                            )
                            .attr("namedEntityCategory", d.title)
                            .attr("next", "false")
                            .attr("previous", JSON.stringify(tempIdList));

                          d3.select(textWordDiv)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("assignedCategories", 1)
                            .classed(
                              "namedEntityAnnotationChanged-cdr",
                              function() {
                                if (
                                  d3
                                    .select(this)
                                    .classed("namedEntityAnnotationRemoved-cdr")
                                ) {
                                  return true;
                                } else {
                                  return false;
                                }
                              }
                            )
                            .classed("namedEntityAnnotationRemoved-cdr", false);

                          // append icon
                          d3.select(textWordDiv)
                            .append("img")
                            .classed("namedEntityIcon-cdr", true)
                            .classed(tab, true)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("src", function() {
                              return "svgIcons/entityIcons/" + d.title + ".svg";
                            })
                            .attr("data-toggle", "tooltip")
                            .attr("title", d.title)
                            .style("height", "20px")
                            .style("width", "20px")
                            .style("margin-top", "-1px")
                            .style("margin-left", "-3px")
                            .attr("previous", JSON.stringify(tempIdList))
                            .attr("next", "false")
                            .attr("getWordId", id)
                            .attr("id", id + " icon1")
                            .attr("iconNum", 1);
                        }
                      }
                    }

                    // clear
                    nGramSelectionWords = [];
                    nGramSelectionIds = [];

                    d3.select(".d3-context-menu").style("display", "none");
                  });

                // the openCallback allows an action to fire before the menu is displayed
                // an example usage would be closing a tooltip
                if (openCallback) openCallback(data, indx);

                // display context menu
                d3.select(".d3-context-menu")
                  .style("left", d3.event.pageX - 2 + "px")
                  .style("top", d3.event.pageY - 2 + "px")
                  .style("display", "block");

                d3.event.preventDefault();
              } else {
                // allow change/remove if icon selected
                if (
                  nGramSelectionIds.length === 0 &&
                  d3.select(elm).classed("namedEntityIcon-cdr")
                ) {
                  // preprocess the data with Array.filter
                  // remove own category from options
                  if (category !== "noCategory") {
                    filteredMenu = filteredMenu.filter(d => {
                      return d.title !== category;
                    });
                  }

                  d3.selectAll(".d3-context-menu").html("");
                  let list = d3.selectAll(".d3-context-menu").append("ul");
                  list
                    .selectAll("li")
                    .data(filteredMenu)
                    .enter()
                    .append("li")
                    .style("cursor", "pointer")
                    .style("padding", "5px 18px")
                    .style("color", function(d) {
                      if (d.title === "remove annotation") {
                        return "red";
                      } else {
                        return "unset";
                      }
                    })
                    .html(function(d) {
                      return d.title;
                    })
                    .on("click", function(d) {
                      // d3.select(elm) refers to the icon

                      let icon = d3.select(elm);

                      if (d.title === "remove annotation") {
                        // remove
                        appliedCategory = "remove";

                        if (icon.attr("previous") === "none") {
                          // icon refers to one word

                          let id = icon.attr("getWordId");
                          let category = icon.attr("namedEntityCategory");

                          let wordDiv = d3.select(elm.parentNode);

                          let num = parseInt(
                            wordDiv.attr("assignedCategories")
                          );

                          let iconNumber = icon.attr("iconNum");

                          if (num > 1) {
                            num -= 1;

                            wordDiv
                              .classed(category, false)
                              .classed(d.title, true)
                              .attr("assignedCategories", num);

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );
                            // update data
                            removeFromNamedEntityModifiedData(
                              tab,
                              category,
                              text.attr("value")
                            );

                            icon.remove();

                            // apply modification to all other occurrences
                            text.classed("currentModified", true);
                            // get all occurrences of the word (ids)
                            let editList = [];

                            d3.selectAll(
                              ".word-cdr.word_" +
                                text.attr("value") +
                                "." +
                                tab +
                                ":not(.currentModified)"
                            )
                              .filter(function() {
                                return (
                                  d3.select(this).attr("next") === "false" &&
                                  d3.select(this).attr("previous") === "none"
                                );
                              })
                              .each(function() {
                                editList.push(d3.select(this).attr("id"));
                              });

                            text.classed("currentModified", false);

                            // modify annotation for those
                            for (let i = 0; i < editList.length; i++) {
                              // get id
                              let id = editList[i];
                              // get icon and remove
                              let icon = d3.select(
                                "#" +
                                  id.replace(/\s/g, "\\ ") +
                                  "\\ icon" +
                                  iconNumber
                              );

                              // get wordDiv and modify attributes
                              let wordDiv = icon.node().parentNode;

                              d3.select(wordDiv)
                                .classed(category, false)
                                .classed(d.title, true)
                                .attr("assignedCategories", num);

                              icon.remove();

                              updateEditListener(tab, id, appliedCategory);
                            }
                          } else {
                            wordDiv
                              .classed("namedEntity-cdr", false)
                              .classed("namedEntityAnnotationRemoved-cdr", true)
                              .classed(
                                "namedEntityAnnotationChanged-cdr",
                                false
                              ) //?
                              .classed(category, false)
                              .attr("namedEntityCategory", null);

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );

                            // keep click listener, keep context menu
                            text
                              .classed(category, false)
                              .classed("namedEntityAnnotation-cdr", false)
                              .attr("namedEntityCategory", null);

                            icon.remove();
                            appliedCategory = "remove";
                            updateEditListener(tab, id, appliedCategory);

                            // update data
                            removeFromNamedEntityModifiedData(
                              tab,
                              category,
                              text.attr("value")
                            );

                            removedNamedEntityAnnotationList.push(
                              text.attr("value")
                            );

                            if (
                              changedNamedEntityAnnotationList.includes(
                                text.attr("value")
                              )
                            ) {
                              changedNamedEntityAnnotationList.splice(
                                changedNamedEntityAnnotationList.indexOf(
                                  text.attr("value")
                                ),
                                1
                              );
                            }

                            // apply modification to all other occurrences
                            text.classed("currentModified", true);
                            // get all occurrences of the word (ids)
                            let editList = [];

                            d3.selectAll(
                              ".word-cdr.word_" +
                                text.attr("value") +
                                "." +
                                tab +
                                ":not(.currentModified)"
                            )
                              .filter(function() {
                                return (
                                  d3.select(this).attr("next") === "false" &&
                                  d3.select(this).attr("previous") === "none"
                                );
                              })
                              .each(function() {
                                editList.push(d3.select(this).attr("id"));
                              });

                            text.classed("currentModified", false);

                            // modify annotation for those
                            for (let i = 0; i < editList.length; i++) {
                              // get id
                              let id = editList[i];
                              // get icon and remove
                              let icon = d3.select(
                                "#" +
                                  id.replace(/\s/g, "\\ ") +
                                  "\\ icon" +
                                  iconNumber
                              );
                              // get wordDiv and modify attributes
                              let wordDiv = icon.node().parentNode;

                              d3.select(wordDiv)
                                .classed("namedEntity-cdr", false)
                                .classed(
                                  "namedEntityAnnotationRemoved-cdr",
                                  true
                                )
                                .classed(
                                  "namedEntityAnnotationChanged-cdr",
                                  false
                                ) //?
                                .classed(category, false)
                                .attr("namedEntityCategory", null);

                              icon.remove();

                              updateEditListener(tab, id, appliedCategory);
                            }
                          }
                        } else {
                          // icon refers to ngram
                          let multiWordIds = JSON.parse(icon.attr("previous"));
                          let multiWordList = [];
                          let category = icon.attr("namedEntityCategory");
                          let iconNumber = icon.attr("iconNum");
                          let nGram = "";
                          for (let j = 0; j < multiWordIds.length; j++) {
                            let wordId = multiWordIds[j];

                            let text = d3.select(
                              "#" + wordId.replace(/\s/g, "\\ ")
                            );
                            let cat = text.attr("namedEntityCategory");

                            // remove dots
                            text
                              .classed("namedEntityOverline-cdr", false)
                              .classed(cat, false)
                              .classed("namedEntityAnnotation-cdr", false)
                              .attr("namedEntityCategory", null)
                              .style("text-decoration", "none")
                              .attr("previous", "none")
                              .attr("next", "false");

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv).classed(
                              "namedEntityAnnotationRemoved-cdr",
                              true
                            );

                            nGram += text.attr("value") + " ";
                            multiWordList.push(text.attr("value"));

                            // last wordDiv contains icon
                            if (j === multiWordIds.length - 1) {
                              // change attributes of wordDiv
                              let wordDiv = d3.select(elm.parentNode);

                              wordDiv
                                .classed("namedEntity-cdr", false)
                                .classed(cat, false)
                                .attr("namedEntityCategory", null)
                                .attr("assignedCategories", null)
                                .classed(
                                  "namedEntityAnnotationRemoved-cdr",
                                  true
                                );

                              // remove the icon
                              icon.remove();
                            }

                            updateEditListener(tab, wordId, appliedCategory);
                          }

                          // update data
                          nGram = nGram.trim();
                          removeFromNamedEntityModifiedData(
                            tab,
                            category,
                            nGram
                          );
                          removedNamedEntityAnnotationList.push(nGram);
                          if (
                            changedNamedEntityAnnotationList.includes(nGram)
                          ) {
                            changedNamedEntityAnnotationList.splice(
                              changedNamedEntityAnnotationList.indexOf(nGram),
                              1
                            );
                          }

                          let firstWordId = multiWordIds[0];
                          let firstText = d3.select(
                            "#" + firstWordId.replace(/\s/g, "\\ ")
                          );

                          let firstWord = multiWordList[0];

                          // apply modification to all other occurrences
                          firstText.classed("currentModified", true);
                          // get all occurrences of the word (ids)
                          let editList = [];

                          // search for occurrence of first word, then check if sequence match
                          d3.selectAll(
                            ".word-cdr.word_" +
                              firstWord +
                              "." +
                              tab +
                              ":not(.currentModified)"
                          ).each(function() {
                            let elemId = d3
                              .select(this)
                              .attr("id")
                              .split(" ");
                            let wordId = elemId[2].match(/(\d+)/g);

                            if (multiWordList.length > 1) {
                              let nextWordId = parseInt(wordId) + 1;

                              let nextId =
                                "#" +
                                elemId[0] +
                                " " +
                                elemId[1] +
                                " word" +
                                nextWordId +
                                " " +
                                tab;

                              if (
                                d3.select(
                                  nextId.replace(/\s/g, "\\ ")
                                )[0][0] !== null
                              ) {
                                let nextWord = d3
                                  .select(nextId.replace(/\s/g, "\\ "))
                                  .attr("value");

                                let counter = 1;
                                for (let j = 1; j < multiWordList.length; j++) {
                                  if (nextWord === multiWordList[j]) {
                                    counter++;
                                  }

                                  if (j < multiWordList.length - 1) {
                                    nextWordId += 1;
                                    nextId =
                                      "#" +
                                      elemId[0] +
                                      " " +
                                      elemId[1] +
                                      " word" +
                                      nextWordId +
                                      " " +
                                      tab;

                                    if (
                                      d3.select(
                                        nextId.replace(/\s/g, "\\ ")
                                      )[0][0] !== null
                                    ) {
                                      nextWord = d3
                                        .select(nextId.replace(/\s/g, "\\ "))
                                        .attr("value");
                                    }
                                  }
                                }

                                if (counter === multiWordList.length) {
                                  editList.push(d3.select(this).attr("id"));
                                }
                              }
                            }
                          });

                          firstText.classed("currentModified", false);

                          // at this point edit list contains the first id's (word) of a matching n-grams

                          for (let i = 0; i < editList.length; i++) {
                            let id = editList[i];

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv)
                              .classed("namedEntityAnnotationRemoved-cdr", true)
                              .classed(
                                "namedEntityAnnotationChanged-cdr",
                                false
                              );

                            let cat = text.attr("namedEntityCategory");
                            // remove dots
                            text
                              .classed("namedEntityOverline-cdr", false)
                              .classed(cat, false)
                              .classed("namedEntityAnnotation-cdr", false)
                              .attr("namedEntityCategory", null)
                              .style("text-decoration", "none")
                              .attr("previous", "none")
                              .attr("next", "false");

                            updateEditListener(tab, id, appliedCategory);

                            let tempId = id.split(" ");
                            let wordId = parseInt(tempId[2].match(/(\d+)/g)[0]);

                            for (let j = 1; j < multiWordList.length; j++) {
                              let nextId = wordId + j;
                              let id =
                                tempId[0] +
                                " " +
                                tempId[1] +
                                " " +
                                "word" +
                                nextId +
                                " " +
                                tab;

                              if (j < multiWordList.length - 1) {
                                let text = d3.select(
                                  "#" + id.replace(/\s/g, "\\ ")
                                );

                                let textWordDiv = text.node().parentNode
                                  .parentNode;
                                d3.select(textWordDiv)
                                  .classed(
                                    "namedEntityAnnotationRemoved-cdr",
                                    true
                                  )
                                  .classed(
                                    "namedEntityAnnotationChanged-cdr",
                                    false
                                  );

                                let cat = text.attr("namedEntityCategory");
                                // remove dots
                                text
                                  .classed("namedEntityOverline-cdr", false)
                                  .classed(cat, false)
                                  .classed("namedEntityAnnotation-cdr", false)
                                  .attr("namedEntityCategory", null)
                                  .style("text-decoration", "none")
                                  .attr("previous", "none")
                                  .attr("next", "false");
                              } else {
                                // last

                                let text = d3.select(
                                  "#" + id.replace(/\s/g, "\\ ")
                                );
                                let cat = text.attr("namedEntityCategory");
                                let textWordDiv = text.node().parentNode
                                  .parentNode;

                                d3.select(textWordDiv)
                                  .classed(
                                    "namedEntityAnnotationRemoved-cdr",
                                    true
                                  )
                                  .classed(
                                    "namedEntityAnnotationChanged-cdr",
                                    false
                                  )
                                  .classed(cat, false)
                                  .attr("assignedCategories", null);

                                // remove dots
                                text
                                  .classed("namedEntityOverline-cdr", false)
                                  .classed(cat, false)
                                  .classed("namedEntityAnnotation-cdr", false)
                                  .attr("namedEntityCategory", null)
                                  .style("text-decoration", "none")
                                  .attr("previous", "none")
                                  .attr("next", "false");

                                // remove icon
                                let icon = d3.select(
                                  "#" +
                                    id.replace(/\s/g, "\\ ") +
                                    "\\ icon" +
                                    iconNumber
                                );

                                icon.remove();
                              }

                              updateEditListener(tab, id, appliedCategory);
                            }
                          }
                        }
                      } else {
                        // change - no update of event listeners necessary
                        // only change color and attributes of elements

                        appliedCategory = d.title;

                        if (icon.attr("previous") === "none") {
                          // icon refers to one word

                          let category = icon.attr("namedEntityCategory");

                          let wordDiv = d3.select(elm.parentNode);

                          let iconNumber = icon.attr("iconNum");

                          let text = wordDiv.select("text");

                          wordDiv
                            .classed(category, false)
                            .classed(d.title, true)
                            .classed("namedEntityAnnotationChanged-cdr", true)
                            .classed("namedEntityAnnotationRemoved-cdr", false)
                            .attr("namedEntityCategory", d.title);

                          text
                            .classed(category, false)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title);

                          icon
                            .classed(category, false)
                            .classed(d.title, true)
                            .attr("namedEntityCategory", d.title)
                            .attr("src", function() {
                              return "svgIcons/entityIcons/" + d.title + ".svg";
                            })
                            .attr("data-toggle", "tooltip")
                            .attr("title", d.title);

                          appliedCategory = d.title;

                          // appliedCategory need to be passed to the listener
                          icon.on(
                            "contextmenu",
                            d3.contextMenu(menuAnnotated, appliedCategory, tab)
                          );

                          // update data
                          removeFromNamedEntityModifiedData(
                            tab,
                            category,
                            text.attr("value")
                          );
                          addToNamedEntityModifiedData(
                            tab,
                            appliedCategory,
                            text.attr("value")
                          );

                          changedNamedEntityAnnotationList.push(
                            text.attr("value")
                          );

                          // apply modification to all other occurrences
                          text.classed("currentModified", true);
                          // get all occurrences of the word (ids)
                          let editList = [];

                          d3.selectAll(
                            ".word-cdr.word_" +
                              text.attr("value") +
                              "." +
                              tab +
                              ":not(.currentModified)"
                          )
                            .filter(function() {
                              return (
                                d3.select(this).attr("next") === "false" &&
                                d3.select(this).attr("previous") === "none"
                              );
                            })
                            .each(function() {
                              editList.push(d3.select(this).attr("id"));
                            });

                          text.classed("currentModified", false);

                          // modify annotation for those
                          for (let i = 0; i < editList.length; i++) {
                            // get id (word)
                            let id = editList[i];

                            // get wordDiv and set attributes
                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );

                            text
                              .classed(category, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title);

                            let wordDiv = text.node().parentNode.parentNode;

                            d3.select(wordDiv)
                              .classed(category, false)
                              .classed(d.title, true)
                              .classed("namedEntityAnnotationChanged-cdr", true)
                              .classed(
                                "namedEntityAnnotationRemoved-cdr",
                                false
                              ) //?
                              .attr("namedEntityCategory", d.title);

                            // change attributes of icon
                            let icon = d3.select(
                              "#" +
                                id.replace(/\s/g, "\\ ") +
                                "\\ icon" +
                                iconNumber
                            );

                            icon
                              .classed(category, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .attr("src", function() {
                                return (
                                  "svgIcons/entityIcons/" + d.title + ".svg"
                                );
                              })
                              .attr("data-toggle", "tooltip")
                              .attr("title", d.title);

                            // appliedCategory need to be passed to the listener
                            icon.on(
                              "contextmenu",
                              d3.contextMenu(
                                menuAnnotated,
                                appliedCategory,
                                tab
                              )
                            );
                          }
                        } else {
                          // icon refers to ngram
                          let multiWordIds = JSON.parse(icon.attr("previous"));
                          let category = icon.attr("namedEntityCategory");
                          let multiWordList = [];

                          let iconNumber = icon.attr("iconNum");

                          let nGram = "";
                          for (let j = 0; j < multiWordIds.length; j++) {
                            let wordId = multiWordIds[j];

                            let text = d3.select(
                              "#" + wordId.replace(/\s/g, "\\ ")
                            );
                            let cat = text.attr("namedEntityCategory");

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv).classed(
                              "namedEntityAnnotationChanged-cdr",
                              true
                            );

                            // change color of dots
                            text
                              .classed(cat, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .style(
                                "text-decoration",
                                "overline dotted " +
                                  $scope.colorScaleNamedEntities[d.title]
                              );

                            nGram += text.attr("value") + " ";
                            multiWordList.push(text.attr("value"));

                            if (j === multiWordIds.length - 1) {
                              // change attributes of wordDiv
                              let wordDiv = d3.select(elm.parentNode);

                              wordDiv
                                .classed(cat, false)
                                .classed(d.title, true)
                                .classed(
                                  "namedEntityAnnotationChanged-cdr",
                                  true
                                )
                                .attr("namedEntityCategory", d.title);

                              // change icon
                              icon
                                .classed(cat, false)
                                .classed(d.title, true)
                                .attr("namedEntityCategory", d.title)
                                .attr("src", function() {
                                  return (
                                    "svgIcons/entityIcons/" + d.title + ".svg"
                                  );
                                })
                                .attr("data-toggle", "tooltip")
                                .attr("title", d.title);

                              // appliedCategory need to be passed to the listener
                              icon.on(
                                "contextmenu",
                                d3.contextMenu(
                                  menuAnnotated,
                                  appliedCategory,
                                  tab
                                )
                              );
                            }
                          }

                          // update data
                          nGram = nGram.trim();
                          removeFromNamedEntityModifiedData(
                            tab,
                            category,
                            nGram
                          );
                          addToNamedEntityModifiedData(
                            tab,
                            appliedCategory,
                            nGram
                          );

                          changedNamedEntityAnnotationList.push(nGram);

                          let firstWordId = multiWordIds[0];
                          let firstText = d3.select(
                            "#" + firstWordId.replace(/\s/g, "\\ ")
                          );

                          let firstWord = multiWordList[0];

                          // apply modification to all other occurrences
                          firstText.classed("currentModified", true);
                          // get all occurrences of the word (ids)
                          let editList = [];

                          // search for occurrence of first word, then check if sequence match
                          d3.selectAll(
                            ".word-cdr.word_" +
                              firstWord +
                              "." +
                              tab +
                              ":not(.currentModified)"
                          ).each(function() {
                            let elemId = d3
                              .select(this)
                              .attr("id")
                              .split(" ");
                            let wordId = elemId[2].match(/(\d+)/g);

                            if (multiWordList.length > 1) {
                              let nextWordId = parseInt(wordId) + 1;

                              let nextId =
                                "#" +
                                elemId[0] +
                                " " +
                                elemId[1] +
                                " word" +
                                nextWordId +
                                " " +
                                tab;

                              if (
                                d3.select(
                                  nextId.replace(/\s/g, "\\ ")
                                )[0][0] !== null
                              ) {
                                let nextWord = d3
                                  .select(nextId.replace(/\s/g, "\\ "))
                                  .attr("value");

                                let counter = 1;
                                for (let j = 1; j < multiWordList.length; j++) {
                                  if (nextWord === multiWordList[j]) {
                                    counter++;
                                  }

                                  if (j < multiWordList.length - 1) {
                                    nextWordId += 1;
                                    nextId =
                                      "#" +
                                      elemId[0] +
                                      " " +
                                      elemId[1] +
                                      " word" +
                                      nextWordId +
                                      " " +
                                      tab;

                                    if (
                                      d3.select(
                                        nextId.replace(/\s/g, "\\ ")
                                      )[0][0] !== null
                                    ) {
                                      nextWord = d3
                                        .select(nextId.replace(/\s/g, "\\ "))
                                        .attr("value");
                                    }
                                  }
                                }

                                if (counter === multiWordList.length) {
                                  editList.push(d3.select(this).attr("id"));
                                }
                              }
                            }
                          });

                          firstText.classed("currentModified", false);

                          // at this point edit list contains the first id's (word) of a matching n-grams

                          for (let i = 0; i < editList.length; i++) {
                            let id = editList[i];

                            let text = d3.select(
                              "#" + id.replace(/\s/g, "\\ ")
                            );
                            let cat = text.attr("namedEntityCategory");

                            let textWordDiv = text.node().parentNode.parentNode;
                            d3.select(textWordDiv).classed(
                              "namedEntityAnnotationChanged-cdr",
                              true
                            );

                            // change color of dots
                            text
                              .classed(cat, false)
                              .classed(d.title, true)
                              .attr("namedEntityCategory", d.title)
                              .style(
                                "text-decoration",
                                "overline dotted " +
                                  $scope.colorScaleNamedEntities[d.title]
                              );

                            let tempId = id.split(" ");
                            let wordId = parseInt(tempId[2].match(/(\d+)/g)[0]);

                            for (let j = 1; j < multiWordList.length; j++) {
                              let nextId = wordId + j;
                              let id =
                                tempId[0] +
                                " " +
                                tempId[1] +
                                " " +
                                "word" +
                                nextId +
                                " " +
                                tab;

                              if (j < multiWordList.length - 1) {
                                let text = d3.select(
                                  "#" + id.replace(/\s/g, "\\ ")
                                );

                                let textWordDiv = text.node().parentNode
                                  .parentNode;
                                d3.select(textWordDiv).classed(
                                  "namedEntityAnnotationChanged-cdr",
                                  true
                                );

                                let cat = text.attr("namedEntityCategory");
                                // change color of dots
                                text
                                  .classed(cat, false)
                                  .classed(d.title, true)
                                  .attr("namedEntityCategory", d.title)
                                  .style(
                                    "text-decoration",
                                    "overline dotted " +
                                      $scope.colorScaleNamedEntities[d.title]
                                  );
                              } else {
                                // last

                                let text = d3.select(
                                  "#" + id.replace(/\s/g, "\\ ")
                                );
                                let cat = text.attr("namedEntityCategory");
                                let textWordDiv = text.node().parentNode
                                  .parentNode;

                                // change color of dots
                                text
                                  .classed(cat, false)
                                  .classed(d.title, true)
                                  .attr("namedEntityCategory", d.title)
                                  .style(
                                    "text-decoration",
                                    "overline dotted " +
                                      $scope.colorScaleNamedEntities[d.title]
                                  );

                                d3.select(textWordDiv)
                                  .classed(cat, false)
                                  .classed(d.title, true)
                                  .classed(
                                    "namedEntityAnnotationChanged-cdr",
                                    true
                                  )
                                  .attr("namedEntityCategory", d.title);

                                let icon = d3.select(
                                  "#" +
                                    id.replace(/\s/g, "\\ ") +
                                    "\\ icon" +
                                    iconNumber
                                );

                                // change icon
                                icon
                                  .classed(cat, false)
                                  .classed(d.title, true)
                                  .attr("namedEntityCategory", d.title)
                                  .attr("src", function() {
                                    return (
                                      "svgIcons/entityIcons/" + d.title + ".svg"
                                    );
                                  })
                                  .attr("data-toggle", "tooltip")
                                  .attr("title", d.title);

                                // appliedCategory need to be passed to the listener
                                icon.on(
                                  "contextmenu",
                                  d3.contextMenu(
                                    menuAnnotated,
                                    appliedCategory,
                                    tab
                                  )
                                );
                              }
                            }
                          }
                        }
                      }

                      d3.select(".d3-context-menu").style("display", "none");
                    });

                  // the openCallback allows an action to fire before the menu is displayed
                  // an example usage would be closing a tooltip
                  if (openCallback) openCallback(data, indx);

                  // display context menu
                  d3.select(".d3-context-menu")
                    .style("left", d3.event.pageX - 2 + "px")
                    .style("top", d3.event.pageY - 2 + "px")
                    .style("display", "block");

                  d3.event.preventDefault();
                }
                d3.event.preventDefault();
              }
              d3.event.preventDefault();
            }
            d3.event.preventDefault();
          };
        };

        let modifiedFlag = false;
        let modifiedFlagOnce = false;
        let removedNamedEntityAnnotationList = [];
        let changedNamedEntityAnnotationList = [];

        function removeFromNamedEntityModifiedData(tab, category, word) {
          let data =
            $scope.namedEntitiesModifiedList[$scope.filenames.indexOf(tab)];

          for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            let entityList = Object.values(obj)[0];

            if (Object.keys(obj)[0] === category) {
              entityList.splice(entityList.indexOf(word), 1);
            }
          }

          if (!modifiedFlagOnce) {
            modifiedFlagOnce = true;
            modifiedFlag = true;
            // enable origin btn
            d3.select(".editNamedEntitiesGetOriginBtn-cdr." + tab).property(
              "disabled",
              false
            );
          }
          $scope.namedEntitiesList = angular.copy(
            $scope.namedEntitiesModifiedList
          );
        }

        function addToNamedEntityModifiedData(tab, category, word) {
          let data =
            $scope.namedEntitiesModifiedList[$scope.filenames.indexOf(tab)];

          for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            let entityList = Object.values(obj)[0];

            if (Object.keys(obj)[0] === category) {
              // entityList.push(word.replace(/\s/g, "_"));

              if (!entityList.includes(word)) {
                entityList.push(word);
              }
            }
          }

          if (!modifiedFlagOnce) {
            modifiedFlagOnce = true;
            modifiedFlag = true;

            // enable origin btn
            d3.select(".editNamedEntitiesGetOriginBtn-cdr." + tab).property(
              "disabled",
              false
            );
          }
          $scope.namedEntitiesList = angular.copy(
            $scope.namedEntitiesModifiedList
          );
        }

        /*
        $scope.getNamedEntitiesOrigin = function(tab, debateIndex) {
          // load origin data
          let userAnswer = window.confirm(
            "Do you want discard all your changes?"
          );

          if (userAnswer) {
            d3.select("#loading_indicator-cdr").style("display", "flex");

            setTimeout(function() {
              $scope.namedEntitiesList = angular.copy(
                $scope.namedEntitiesOriginList
              );

              $scope.namedEntitiesModifiedList = angular.copy(
                $scope.namedEntitiesOriginList
              );

              modifiedFlagOnce = false;
              modifiedFlag = false;

              removedNamedEntityAnnotationList = [];
              changedNamedEntityAnnotationList = [];

              // disable origin btn
              d3.select(".editNamedEntitiesGetOriginBtn-cdr." + tab).property(
                "disabled",
                true
              );

              // re-render named entity annotation with origin data
              // update listeners

              removeEditListeners(tab);

              if (nGramSelectMode) {
                nGramSelectMode = false;
                removeEditListeners(tab);
                // disable indicator
                d3.select(".editMultiSelectIndicator-cdr." + tab).style(
                  "background-color",
                  "lightgrey"
                );
                flagKeydown = 0;
              }

              // remove annotation - same as in $scope.annotate_namedEntities()
              d3.selectAll(".namedEntityIcon-cdr." + tab).remove();

              d3.selectAll(".namedEntityOverline-cdr." + tab)
                .style("text-decoration", "unset")
                .classed("namedEntityOverline-cdr", false);

              // need to be reset so that annotation after an uncheck correctly works
              d3.selectAll(".namedEntity-cdr." + tab).each(function() {
                let wordDiv = d3.select(this);
                let cat = wordDiv.attr("namedEntityCategory");

                wordDiv.classed(cat, false).attr("namedEntityCategory", null);

                wordDiv
                  .select("text")
                  .classed(cat, false)
                  .classed("namedEntityAnnotation-cdr", false)
                  .classed("namedEntityAnnotationRemoved-cdr", false)
                  .classed("namedEntityAnnotationChanged-cdr", false)
                  .attr("namedEntityCategory", null)
                  .attr("assignedCategories", null)
                  .attr("previous", "none")
                  .attr("next", "false");
              });

              d3.selectAll(".namedEntityAnnotationRemoved-cdr." + tab).classed(
                "namedEntityAnnotationRemoved-cdr",
                false
              );

              $scope.annotate_namedEntities(true, tab, debateIndex);

              // append edit event listeners
              initEditListeners(tab);

              d3.select("#loading_indicator-cdr").style("display", "none");
            }, 0);
          }
        };
         */

        // ########################################################################

        /**
         * This method is called while rendering the filter List.
         * It calculates the number of utterances a topic is assign to it.
         */
        $scope.countUtterancesTopics = function(topic, debateIndex) {
          let count = 0;
          let topics = angular.copy($scope.topicsList[debateIndex][0]);
          let topicValues = Object.values(topics);

          for (let i = 0; i < topicValues.length; i++) {
            if (topic === topicValues[i]) {
              count++;
            }
          }
          return count;
        };

        /**
         * This method is called while rendering the filter List.
         * It gets some keywords which represents a topic.
         */
        $scope.getSomeTopicKeywords = function(topic, debateIndex, number) {
          // how to determine which keywords are representing the topic best?

          let keywords = [];
          let descriptors = $scope.topicDescriptorsList[debateIndex][0][topic];

          for (let i = 0; i < descriptors.length; i++) {
            if (keywords.length < number) {
              let descriptor = descriptors[i];

              // avoid punctuation, words starting with apostrophe, stop-words, and words like 'we_' or less than three letters like 'ca'
              if (
                !descriptor.match(/[.,!?;:']/) &&
                !$scope.stopWords.includes(descriptor) &&
                !descriptor.endsWith("_") &&
                !(descriptor.length < 3)
              ) {
                if (descriptor.match(/_/g)) {
                  // avoid keywords of form x_y where x or y are stop words or not relevant or to short for example 've_get' or 'that_be'
                  // this check can be further improved - now words like mr_president also skiped
                  if (
                    !$scope.stopWords.includes(descriptor.split("_")[0]) &&
                    !(descriptor.split("_")[0].length < 3) &&
                    !$scope.stopWords.includes(descriptor.split("_")[1]) &&
                    !(descriptor.split("_")[1].length < 3)
                  ) {
                    keywords.push(descriptor);
                  }
                } else {
                  keywords.push(descriptor);
                }
              }
            } else {
              break;
            }
          }
          return keywords;
        };

        $scope.stopWords = [
          "i",
          "me",
          "my",
          "myself",
          "we",
          "our",
          "ours",
          "ourselves",
          "you",
          "your",
          "yours",
          "yourself",
          "yourselves",
          "he",
          "him",
          "his",
          "himself",
          "she",
          "her",
          "hers",
          "herself",
          "it",
          "its",
          "itself",
          "they",
          "them",
          "their",
          "theirs",
          "themselves",
          "what",
          "which",
          "who",
          "whom",
          "this",
          "that",
          "these",
          "those",
          "am",
          "is",
          "are",
          "was",
          "were",
          "be",
          "been",
          "being",
          "have",
          "has",
          "had",
          "having",
          "do",
          "does",
          "did",
          "doing",
          "a",
          "an",
          "the",
          "and",
          "but",
          "if",
          "or",
          "because",
          "as",
          "until",
          "while",
          "of",
          "at",
          "by",
          "for",
          "with",
          "about",
          "against",
          "between",
          "into",
          "through",
          "during",
          "before",
          "after",
          "above",
          "below",
          "to",
          "from",
          "up",
          "down",
          "in",
          "out",
          "on",
          "off",
          "over",
          "under",
          "again",
          "further",
          "then",
          "once",
          "here",
          "there",
          "when",
          "where",
          "why",
          "how",
          "all",
          "any",
          "both",
          "each",
          "few",
          "more",
          "most",
          "other",
          "some",
          "such",
          "no",
          "nor",
          "not",
          "only",
          "own",
          "same",
          "so",
          "than",
          "too",
          "very",
          "s",
          "t",
          "can",
          "will",
          "just",
          "don",
          "should",
          "now"
        ];

        $scope.checkedTopics = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedTopics[i] = false;
        }

        /**
         * This method annotates the utterances with their corresponding topic.
         * Therefore each utterance will annotated with a topic number which will placed
         * over an utterance. Further, keywords that represent  a topic will be highlighted
         * within an utterance.
         */
        $scope.annotate_topics = function(checked, tab, debateIndex) {
          d3.select("#topicsCheckBox-cdr\\ " + tab).classed(
            "featureChecked",
            checked
          );

          $scope.checkedTopics[debateIndex] = checked;

          if (checked) {
            d3.selectAll(".utteranceGlyphTopicContainer-cdr." + tab).each(
              function(_, i) {
                let container = d3.select(this);

                //set class attribute for parent
                d3.select(this.parentNode)
                  .classed(
                    "topic-cdr-" +
                      $scope.topicsList[debateIndex][0]["utterance" + (i + 1)],
                    true
                  )
                  .attr(
                    "topic",
                    $scope.topicsList[debateIndex][0]["utterance" + (i + 1)]
                  );

                // annotate topic number
                container
                  .insert("div", "div")
                  .classed("topicAnnotation-cdr", true)
                  .classed(tab, true)
                  .classed(
                    "topic-" +
                      $scope.topicsList[debateIndex][0]["utterance" + (i + 1)],
                    true
                  )
                  .html(function() {
                    return $scope.convertIntToRoman(
                      $scope.topicsList[debateIndex][0]["utterance" + (i + 1)],
                      1
                    );
                  })
                  .style("width", "30px")
                  .style("height", "30px")
                  .style("padding-top", "5px")
                  .style("text-align", "center")
                  .style("font-size", "14px")
                  .style("font-weight", "500")
                  .style("background", "lightgrey")
                  .style("border-radius", "50%");
              }
            );

            // highlight keywords

            d3.selectAll(".utterance-cdr." + tab).each(function(
              _,
              indexUtterance
            ) {
              let utteranceId = indexUtterance + 1;
              let topic =
                $scope.topicsList[debateIndex][0]["utterance" + utteranceId];
              let descriptors =
                $scope.topicDescriptorsList[debateIndex][0][topic];

              let sentences = d3.select(this).selectAll(".sentence-cdr." + tab);

              sentences.each(function(_, indexSentence) {
                let sentenceId = indexSentence + 1;

                let words = d3.select(this).selectAll(".word-cdr." + tab);

                words.each(function(_, indexWord) {
                  let wordId = indexWord + 1;
                  let wordContainer = d3.select(this);
                  let word = wordContainer.text().toLowerCase();

                  let found = false;

                  // avoid punctuation, words starting with an apostrophe and stop-words

                  if (
                    !word.match(/^[.,!?;:']/) &&
                    !$scope.stopWords.includes(word)
                  ) {
                    let stemmedWord = stemmer(word);
                    // check if word is in list of descriptors
                    // check also stemmed version of word

                    for (let i = 0; i < descriptors.length; i++) {
                      let descriptor = descriptors[i].toLowerCase();

                      if (
                        descriptor === word ||
                        (stemmer(descriptor) === stemmedWord &&
                          !d3
                            .select(
                              "#forTopicKeywordHighlighting\\ utterance" +
                                utteranceId +
                                "\\ sentence" +
                                sentenceId +
                                "\\ word" +
                                wordId +
                                "\\ " +
                                tab
                            )
                            .classed("topicKeywordHighlighting-cdr"))
                      ) {
                        d3.select(
                          "#forTopicKeywordHighlighting\\ utterance" +
                            utteranceId +
                            "\\ sentence" +
                            sentenceId +
                            "\\ word" +
                            wordId +
                            "\\ " +
                            tab
                        )
                          .classed("topicKeywordHighlighting-cdr", true)
                          .classed(tab, true)
                          .style("text-decoration", "underline")
                          .style("font-family", "monospace");

                        found = true;
                      }
                    }

                    // check if word is part of an keyword consisting of multiple words
                    if (!found) {
                      for (let i = 0; i < descriptors.length; i++) {
                        let descriptor = descriptors[i].toLowerCase();

                        // avoid matching keyword like xyz_
                        if (
                          descriptor.startsWith(word + "_") ||
                          (descriptor.startsWith(stemmedWord + "_") &&
                            !descriptor.endsWith(word + "_")) ||
                          descriptor.startsWith(stemmedWord + "_")
                        ) {
                          // separate descriptor into independent words
                          let temp = descriptor.split("_");

                          let counter = 0;
                          let nextWord = word;

                          // match separated-keyword with word
                          for (let k = 0; k < temp.length; k++) {
                            let part = temp[k];
                            if (
                              part === nextWord ||
                              stemmer(part) === stemmer(nextWord)
                            ) {
                              counter++;
                              // get following word
                              if (
                                d3.select(
                                  "#utterance" +
                                    utteranceId +
                                    "\\ sentence" +
                                    sentenceId +
                                    "\\ word" +
                                    (wordId + 1) +
                                    "\\ " +
                                    tab
                                )[0][0] !== null
                              ) {
                                nextWord = d3
                                  .select(
                                    "#utterance" +
                                      utteranceId +
                                      "\\ sentence" +
                                      sentenceId +
                                      "\\ word" +
                                      (wordId + 1) +
                                      "\\ " +
                                      tab
                                  )
                                  .text()
                                  .toLowerCase();
                              }
                            }
                          }

                          if (counter === temp.length) {
                            let nextWordId = wordId;
                            while (counter > 0) {
                              let element = d3.select(
                                "#forTopicKeywordHighlighting\\ utterance" +
                                  utteranceId +
                                  "\\ sentence" +
                                  sentenceId +
                                  "\\ word" +
                                  nextWordId +
                                  "\\ " +
                                  tab
                              );

                              element
                                .classed("topicKeywordHighlighting-cdr", true)
                                .classed(tab, true)
                                .style("text-decoration", "underline")
                                .style("font-family", "monospace");

                              nextWordId++;
                              counter--;
                            }
                          }
                        }
                      }
                    }
                  }
                });
              });
            });

            // initialize tracking checkboxes
            for (
              let i = 0;
              i < $scope.topicNumbersList[debateIndex].length;
              i++
            ) {
              $scope.checkedTopicsOfTab[debateIndex][i] = false;
            }
          } else {
            d3.selectAll(".topicAnnotation-cdr." + tab).remove();

            d3.selectAll(".topicKeywordHighlighting-cdr." + tab)
              .style("font-family", "unset")
              .style("text-decoration", "unset")
              .classed("topicKeywordUnderline-cdr", false);

            d3.selectAll(".object-cdr." + tab).attr("topic", null);

            if ($scope.checkedTopicsOfTab[debateIndex].includes(true)) {
              $scope.clearFilterTopics(tab, debateIndex);
            }
          }

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        $scope.convertIntToRoman = function(num, add) {
          let number;

          number = parseInt(num) + add;

          let roman = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
          };

          let str = "";

          for (let i of Object.keys(roman)) {
            let q = Math.floor(number / roman[i]);
            number -= q * roman[i];
            str += i.repeat(q);
          }

          return str;
        };

        // declare for each tab a list that will track the selected filter for topics
        $scope.checkedTopicsOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedTopicsOfTab[i] = [];
        }

        // create for each tab a own list which stores the selected topic from the filter list
        $scope.selectedTopicsLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedTopicsLists[i] = [];
        }

        /**
         * This method manages a list of selected topics of its corresponding tab.
         * Further it hides or show the corresponding utterances in the text and in the
         * overview for the filtered topics and checks also if speaker filters are selected.
         * For overview also the attributes for pixel positions has to be reset, so that the tracker works correctly.
         * Further reset overview and text after each filter to top of container.
         * Also check if search is active to set or remove the highlighting of the words in those utterances.
         */
        $scope.filterTopics = function(topic, checked, tab, debateIndex) {
          // reset sentence y start and end positions
          resetYPositionsSentences(tab);

          // keep focus of text location
          let element = getFirstSentenceInViewport(tab)[0];

          if (checked) {
            // store element
            $scope.selectedTopicsLists[debateIndex].push(topic);

            if ($scope.selectedTopicsLists[debateIndex].length === 1) {
              if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
                // speaker filtered

                // text
                // filter utterances by selected topic
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.topic-cdr-" + topic + ")"
                )
                  .classed("utteranceFiltered-cdr", true)
                  .style("display", "none");

                // filter now utterances by selected speakers
                d3.selectAll(".topic-cdr-" + topic + "." + tab).each(
                  function() {
                    if (
                      !$scope.selectedSpeakerLists[debateIndex].includes(
                        d3.select(this).attr("speaker")
                      )
                    ) {
                      d3.select(this)
                        .classed("utteranceFiltered-cdr", true)
                        .style("display", "none");
                    }
                  }
                );

                // overview
                // filter utterances by selected topic
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.topicOverview-cdr-" +
                    topic +
                    ")"
                )
                  .style("display", "none")
                  .classed("overviewFiltered-cdr", true);

                // filter now utterances by selected speakers
                d3.selectAll(".topicOverview-cdr-" + topic + "." + tab).each(
                  function() {
                    if (
                      !$scope.selectedSpeakerLists[debateIndex].includes(
                        d3.select(this).attr("speaker")
                      )
                    ) {
                      d3.select(this)
                        .style("display", "none")
                        .classed("overviewFiltered-cdr", true);
                    }
                  }
                );

                alignUtterancePixelInOverview(tab);
              } else {
                // speaker not filtered
                // hide rest

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.topic-cdr-" + topic + ")"
                )
                  .classed("utteranceFiltered-cdr", true)
                  .style("display", "none");

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.topicOverview-cdr-" +
                    topic +
                    ")"
                )
                  .style("display", "none")
                  .classed("overviewFiltered-cdr", true);

                alignUtterancePixelInOverview(tab);
              }

              // enable clear btn
              d3.select(".filterTopicsClearBtn-cdr." + tab).property(
                "disabled",
                false
              );
            } else {
              if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
                // speaker filtered
                // show utterances matching selected topic
                // hide utterances that not match one of the selected speakers

                // text
                d3.selectAll(".object-cdr." + tab + ".topic-cdr-" + topic).each(
                  function() {
                    if (
                      !$scope.selectedSpeakerLists[debateIndex].includes(
                        d3.select(this).attr("speaker")
                      )
                    ) {
                      d3.select(this)
                        .classed("utteranceFiltered-cdr", true)
                        .style("display", "none");
                    } else {
                      d3.select(this)
                        .classed("utteranceFiltered-cdr", false)
                        .style("display", "flex");
                    }
                  }
                );

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." + tab + ".topicOverview-cdr-" + topic
                ).each(function() {
                  if (
                    !$scope.selectedSpeakerLists[debateIndex].includes(
                      d3.select(this).attr("speaker")
                    )
                  ) {
                    d3.select(this)
                      .style("display", "none")
                      .classed("overviewFiltered-cdr", true);
                  } else {
                    d3.select(this)
                      .style("display", "block")
                      .classed("overviewFiltered-cdr", false);
                  }
                });

                alignUtterancePixelInOverview(tab);
              } else {
                // speaker not filtered
                // show utterance matching selected topic

                // text
                d3.selectAll(".object-cdr." + tab + ".topic-cdr-" + topic)
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." + tab + ".topicOverview-cdr-" + topic
                )
                  .style("display", "block")
                  .classed("overviewFiltered-cdr", false);
                alignUtterancePixelInOverview(tab);
              }
            }
          } else {
            // remove the element
            $scope.selectedTopicsLists[debateIndex].splice(
              $scope.selectedTopicsLists[debateIndex].indexOf(topic),
              1
            );

            if ($scope.selectedTopicsLists[debateIndex].length === 0) {
              if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
                // speakers filtered
                // show rest but only matching speakers

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.topic-cdr-" + topic + ")"
                ).each(function() {
                  if (
                    $scope.selectedSpeakerLists[debateIndex].includes(
                      d3.select(this).attr("speaker")
                    )
                  ) {
                    d3.select(this)
                      .classed("utteranceFiltered-cdr", false)
                      .style("display", "flex");
                  }
                });

                // overview
                d3.selectAll(
                  ".objectOverview-cdr." +
                    tab +
                    ":not(.topicOverview-cdr-" +
                    topic +
                    ")"
                ).each(function() {
                  if (
                    $scope.selectedSpeakerLists[debateIndex].includes(
                      d3.select(this).attr("speaker")
                    )
                  ) {
                    d3.select(this)
                      .style("display", "block")
                      .classed("overviewFiltered-cdr", false);
                  }
                });
                alignUtterancePixelInOverview(tab);
              } else {
                // speakers not filtered
                // show rest

                // text
                d3.selectAll(
                  ".object-cdr." + tab + ":not(.topic-cdr-" + topic + ")"
                )
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");

                // overview
                d3.selectAll(".objectOverview-cdr." + tab)
                  .style("display", "block")
                  .style("transform", "translate(0px,0px)");

                d3.selectAll(".overviewFiltered-cdr." + tab).classed(
                  "overviewFiltered-cdr",
                  false
                );

                d3.select(".overviewSvg-cdr." + tab).style(
                  "height",
                  svgHeightTab[debateIndex]
                );
              }

              // disable clear btn
              d3.select(".filterTopicsClearBtn-cdr." + tab).property(
                "disabled",
                true
              );
            } else {
              // hide

              // text
              d3.selectAll(".object-cdr." + tab + ".topic-cdr-" + topic)
                .classed("utteranceFiltered-cdr", true)
                .style("display", "none");

              // overview
              d3.selectAll(
                ".objectOverview-cdr." + tab + ".topicOverview-cdr-" + topic
              )
                .style("display", "none")
                .classed("overviewFiltered-cdr", true);
              alignUtterancePixelInOverview(tab);
            }
          }

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          // sometimes it happens that speaker annotation height is not correct
          // so recalculate height
          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }

          // check search is active and rerun search
          if ($scope.searchActiveOfTab[debateIndex]) {
            let word = $scope.lastSearchOfTab[debateIndex];
            $scope.cleanSearch(tab, debateIndex);
            $scope.search_words(word, tab, debateIndex);
          }
        };

        /**
         * This method resets the topic filter selection.
         * Display all utterances again, further it checks if speakers are filtered
         * and show only matching ones.
         * Same for the overview.
         * Uncheck checkboxes and reset tracking list.
         * Disable clear btn.
         * Recalculate speaker annotation.
         */
        $scope.clearFilterTopics = function(tab, debateIndex) {
          // keep focus of text location
          let element = getFirstSentenceInViewport(tab)[0];

          // reset sentence y position attributes in the pixel overview
          resetYPositionsSentences(tab);

          // check if speaker filters selected
          if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
            // show only utterances matching speaker

            // text
            d3.selectAll(".object-cdr." + tab).each(function() {
              if (
                $scope.selectedSpeakerLists[debateIndex].includes(
                  d3.select(this).attr("speaker")
                )
              ) {
                d3.select(this)
                  .classed("utteranceFiltered-cdr", false)
                  .style("display", "flex");
              }
            });

            // overview
            d3.selectAll(".objectOverview-cdr." + tab).each(function() {
              if (
                $scope.selectedSpeakerLists[debateIndex].includes(
                  d3.select(this).attr("speaker")
                )
              ) {
                d3.select(this)
                  .style("display", "block")
                  .classed("overviewFiltered-cdr", false);
              }
            });

            alignUtterancePixelInOverview(tab);
          } else {
            // show all utterances

            // text
            d3.selectAll(".object-cdr." + tab)
              .classed("utteranceFiltered-cdr", false)
              .style("display", "flex");

            // overview
            d3.selectAll(".objectOverview-cdr." + tab)
              .style("display", "block")
              .style("transform", "translate(0px,0px)");

            d3.selectAll(".overviewFiltered-cdr." + tab).classed(
              "overviewFiltered-cdr",
              false
            );

            d3.select(".overviewSvg-cdr." + tab).style(
              "height",
              svgHeightTab[debateIndex]
            );
          }

          // clear selected topics from list
          $scope.selectedTopicsLists[debateIndex] = [];

          // disable clear btn
          d3.select(".filterTopicsClearBtn-cdr." + tab).property(
            "disabled",
            true
          );

          // uncheck checked checkboxes
          // https://stackoverflow.com/questions/38671184/uncheck-all-checkboxes-in-angularjs
          for (
            let i = 0;
            i < $scope.topicNumbersList[debateIndex].length;
            i++
          ) {
            $scope.checkedTopicsOfTab[debateIndex][i] = false;
          }

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          // need to be recalculated, since clearing the selection and
          // showing all utterances, lead to that the annotation height for
          // some utterances are to short. Especially then when further features
          // are annotated.
          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }

          // check search is active and rerun search
          if ($scope.searchActiveOfTab[debateIndex]) {
            let word = $scope.lastSearchOfTab[debateIndex];
            $scope.cleanSearch(tab, debateIndex);
            $scope.search_words(word, tab, debateIndex);
          }
        };

        /**
         * This method creates a modal window and displays
         * a definition/description and the encoding for topics.
         * It also contains information about the selected algorithm
         * and the extracted keywords for each topic.
         */
        $scope.launchTopicInfo = function(debateIndex) {
          $uibModal.open({
            templateUrl: "views/modalWindowTopicsInfoCDR.html",
            controller: "modalWindowTopicsInfoController",
            scope: $scope,
            backdrop: false,
            resolve: {
              debateIndex: debateIndex,
              convertIntToRoman: function() {
                return $scope.convertIntToRoman;
              }
            }
          });
        };

        // create dynamically an object and store for each tab a key value pair
        // necessary to decide on which tab the glyph checkbox was checked to display the corresponding measure list
        $scope.showMeasures = {};
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.showMeasures["showMeasuresOfTab" + i] = false;
        }

        $scope.checkedGlyph = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.checkedGlyph[i] = false;
        }

        /**
         * This method saves for which tab the glyph checkbox was checked
         * and updates the value for ng-show.
         * https://stackoverflow.com/questions/25669509/angular-get-dynamic-variable-from-scope-inside-ng-repeat
         */
        $scope.showGlyphFeatures = function(checked, tab, debateIndex) {
          $scope.showMeasures["showMeasuresOfTab" + debateIndex] = checked;
          $scope.checkedGlyph[debateIndex] = checked;
          d3.select("#glyphCheckBox-cdr\\ " + tab).classed(
            "featureChecked",
            checked
          );
        };

        // create for each tab a own list which stores the selected measures for the glyph
        $scope.selectedMeasuresLists = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.selectedMeasuresLists[i] = [];
        }

        /**
         * This method updates (check, uncheck) for each tab the corresponding list of selected measures
         * https://stackoverflow.com/questions/31185554/how-to-get-checked-checkbox-value-and-store-it-array-variable-in-angularjs
         * limited to 7 selected measures
         */
        $scope.updateMeasureList = function(
          measureName,
          measureItemChecked,
          debateIndex
        ) {
          let measureLimit = 6;

          let measureNameWithoutSpacesAndLowercase = measureName
            .replace(/[\s]/g, "")
            .toLowerCase();

          // checkbox for one measure is checked
          if (measureItemChecked) {
            // store measure in the corresponding list if space left
            if (
              $scope.selectedMeasuresLists[debateIndex].length < measureLimit
            ) {
              $scope.selectedMeasuresLists[debateIndex].push(measureName);

              d3.select(
                ".measureCheckboxLabel-cdr." +
                  measureNameWithoutSpacesAndLowercase +
                  "." +
                  $scope.filenames[debateIndex]
              ).classed("checked", true);
            } else {
              // store last element in the list ...
              if (
                $scope.selectedMeasuresLists[debateIndex].length ===
                measureLimit
              ) {
                $scope.selectedMeasuresLists[debateIndex].push(measureName);
                d3.select(
                  ".measureCheckboxLabel-cdr." +
                    measureNameWithoutSpacesAndLowercase +
                    "." +
                    $scope.filenames[debateIndex]
                ).classed("checked", true);
              }
              // ... before disabling the rest ...
              d3.selectAll(
                ".measureCheckbox-cdr." +
                  $scope.filenames[debateIndex] +
                  ":not(:checked)"
              ).property("disabled", true);

              // ... and reducing their label opacity
              d3.selectAll(
                ".measureCheckboxLabel-cdr." + $scope.filenames[debateIndex]
              ).each(function() {
                if (!d3.select(this).classed("checked")) {
                  d3.select(this).style("opacity", 0.3);
                }
              });
            }
          } else {
            // if unchecked remove the element from the list
            $scope.selectedMeasuresLists[debateIndex].splice(
              $scope.selectedMeasuresLists[debateIndex].indexOf(measureName),
              1
            );

            // also enable all checkboxes
            d3.selectAll(
              ".measureCheckbox-cdr." +
                $scope.filenames[debateIndex] +
                ":not(:checked)"
            ).property("disabled", false);

            d3.select(
              ".measureCheckboxLabel-cdr." +
                measureNameWithoutSpacesAndLowercase +
                "." +
                $scope.filenames[debateIndex]
            ).classed("checked", false);

            // restore their label opacity
            d3.selectAll(
              ".measureCheckboxLabel-cdr." + $scope.filenames[debateIndex]
            ).each(function() {
              if (!d3.select(this).classed("checked")) {
                d3.select(this).style("opacity", 1);
              }
            });
          }

          // enable annotate btn for the glyph once one element is added to the list
          // disable the btn when no element is in the list
          if ($scope.selectedMeasuresLists[debateIndex].length === 1) {
            // annotate btn
            d3.select(
              ".glyphAnnotateBtn-cdr." + $scope.filenames[debateIndex]
            ).property("disabled", false);
            //fullscreen btn
            d3.select(
              ".glyphFullScreenBtn-cdr." + $scope.filenames[debateIndex]
            ).property("disabled", false);
          } else if ($scope.selectedMeasuresLists[debateIndex].length === 0) {
            // annotate btn
            d3.select(
              ".glyphAnnotateBtn-cdr." + $scope.filenames[debateIndex]
            ).property("disabled", true);
            //fullscreen btn
            d3.select(
              ".glyphFullScreenBtn-cdr." + $scope.filenames[debateIndex]
            ).property("disabled", true);
          }
        };

        $scope.colorScaleBinary = d3.scale
          .ordinal()
          .range(["lightgrey", "black"])
          .domain([0, 1]);

        // https://observablehq.com/@d3/color-schemes
        $scope.colorScaleNumericalContiniuous = d3
          .scaleLinear()
          .interpolate(d3.interpolateHcl)
          //.range(["#9e9cc9", "#3f007d"])
          .range(["#b0dfaa", "#0e7735"])
          .domain([0, 1]);

        $scope.colorScaleNumericalBipolar = d3
          .scaleLinear()
          .interpolate(d3.interpolateHcl)
          //.range(["#ab0f45", "#0fabbc", "#07753e"])
          //.domain([-1, 0, 1]);
          .range(["#384ca0", "#a3d1e5", "#fedd90", "#f57f4b", "#ab0f45"])
          .domain([-1, -0.5, 0, 0.5, 1]);

        /**
         * This method annotates a glyph for each utterance with the selected measures.
         * Each measure is encoded as a circle which represent the corresponding value.
         * Each circle is enclosed of two half circles which encode the corresponding data type
         * by using the min and max value.
         * The circles are connected with a line to show them as one entity.
         */
        $scope.annotate_glyph = function(tab, debateIndex) {
          d3.select(".glyphAnnotateBtn-cdr." + tab).classed(
            "featureChecked",
            true
          );

          // get the corresponding measure objects from the user selection
          let selectedMeasuresToAnnotate = getMeasureObjects(
            debateIndex,
            $scope
          );

          // input for glyph should look like [{measure1: value1, measure2: value2, ...},...] for each utterance
          let dataForGlyph = prepareDataForGlyph(
            debateIndex,
            $scope,
            selectedMeasuresToAnnotate
          );

          // get measure name, type, min-val, max-val for data-type encoding
          let selectedMeasureNames = getSelectedMeasureNames(
            debateIndex,
            $scope,
            selectedMeasuresToAnnotate
          );

          // keep focus of text location
          let element = getFirstSentenceInViewport(tab)[0];

          let width = 200;
          let height = 20;
          let glyphLimit = 7;
          let margin = 10;

          let lineStart = 10;
          let lineEnd;
          let distanceBetweenCircles;

          let div = d3
            .selectAll(".utteranceGlyphTopicContainer-cdr." + tab)
            .append("div")
            .classed("measureGlyphContainer-cdr", true)
            .classed(tab, true)
            .style("margin-top", "5px");

          let svg = div
            .append("svg")
            .classed("measureGlyph-cdr", true)
            .classed(tab, true)
            .style("width", width + lineStart)
            .style("height", height);

          if (Object.keys(dataForGlyph[0]).length === 1) {
            distanceBetweenCircles = 0;
          } else {
            let lineLength = width - margin * 4;

            lineEnd =
              (lineLength / (glyphLimit - 1)) *
              (Object.keys(dataForGlyph[0]).length - 1);

            distanceBetweenCircles = lineLength / (glyphLimit - 1);

            svg
              .append("line")
              .style("stroke", "grey")
              .style("stroke-width", "2px")
              .attr("x1", lineStart)
              .attr("y1", height / 2)
              .attr("x2", lineEnd + lineStart)
              .attr("y2", height / 2);
          }

          d3.selectAll(".measureGlyph-cdr." + tab)
            .data(dataForGlyph)
            .each(function(d, i) {
              let svg = d3.select(this);

              let index = 0;

              let defs = svg.append("defs");

              for (const [key, value] of Object.entries(d)) {
                let type = selectedMeasureNames[index].type;
                // inner circle for feature encoding
                svg
                  .append("circle")
                  .classed("glyph_circle" + i, true)
                  .style("fill", function() {
                    if (type === "BINARY") {
                      return $scope.colorScaleBinary(value);
                    } else if (type === "NUMERICAL_BIPOLAR") {
                      return $scope.colorScaleNumericalBipolar(value);
                    } else if (type === "NUMERICAL_CONTINUOUS") {
                      return $scope.colorScaleNumericalContiniuous(value);
                    } else {
                      // default color
                      return "grey";
                    }
                  })
                  .attr("cx", function() {
                    return lineStart + index * distanceBetweenCircles;
                  })
                  .attr("cy", height / 2)
                  .attr("r", 6)
                  .on("mouseover", function() {
                    d3.select(this)
                      .append("svg:title")
                      .classed("glyphCircleText-cdr", true)
                      .classed(tab, true)
                      .text(function() {
                        return (
                          "feature: " + key + "\nvalue: " + value.toFixed(2)
                        );
                      });
                  })
                  .on("mouseout", function() {
                    d3.select(".glyphCircleText-cdr." + tab).remove();
                  });

                // outer circles for datatype encoding
                // map min and max value to circle borders
                // therefore we need two semicircles and assign the corresponding color to them
                // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Clipping_and_masking
                let rectWidth = 20;
                let rectHeight = height;
                let clipPath1 = defs
                  .append("clipPath")
                  .attr("id", "cut-off-left" + i + index);

                clipPath1
                  .append("rect")
                  .attr("x", function() {
                    return Math.floor(
                      lineStart + index * distanceBetweenCircles
                    );
                  })
                  .attr("y", 0)
                  .attr("width", rectWidth + "px")
                  .attr("height", rectHeight + "px");

                let clipPath2 = defs
                  .append("clipPath")
                  .attr("id", "cut-off-right" + i + index);

                clipPath2
                  .append("rect")
                  .attr("x", function() {
                    return (
                      Math.floor(lineStart + index * distanceBetweenCircles) -
                      rectWidth
                    );
                  })
                  .attr("y", 0)
                  .attr("width", rectWidth + "px")
                  .attr("height", rectHeight + "px");

                svg
                  .append("circle")
                  .classed("glyphCircleBorderRight" + i + index, true)
                  .style("fill", "none")
                  .style("stroke", function() {
                    // assign max values
                    if (type === "BINARY") {
                      return $scope.colorScaleBinary(1);
                    } else if (type === "NUMERICAL_BIPOLAR") {
                      return $scope.colorScaleNumericalBipolar(1);
                    } else if (type === "NUMERICAL_CONTINUOUS") {
                      return $scope.colorScaleNumericalContiniuous(1);
                    } else {
                      // default color
                      return "grey";
                    }
                  })
                  .style("stroke-width", "4px")
                  .attr("cx", function() {
                    return lineStart + index * distanceBetweenCircles;
                  })
                  .attr("cy", height / 2)
                  .attr("r", 6)
                  .attr("clip-path", "url(#cut-off-left" + i + index + ")");

                svg
                  .append("circle")
                  .classed("glyphCircleBorderLeft" + i + index, true)
                  .style("fill", "none")
                  .style("stroke", function() {
                    // assign min values
                    if (type === "BINARY") {
                      return $scope.colorScaleBinary(0);
                    } else if (type === "NUMERICAL_BIPOLAR") {
                      return $scope.colorScaleNumericalBipolar(-1);
                    } else if (type === "NUMERICAL_CONTINUOUS") {
                      return $scope.colorScaleNumericalContiniuous(0);
                    } else {
                      // default color
                      return "grey";
                    }
                  })
                  .style("stroke-width", "4px")
                  .attr("cx", function() {
                    return lineStart + index * distanceBetweenCircles;
                  })
                  .attr("cy", height / 2)
                  .attr("r", 6)
                  .attr("clip-path", "url(#cut-off-right" + i + index + ")");

                index++;
              }
            });

          //enable remove btn
          d3.select(".glyphRemoveBtn-cdr." + tab).property("disabled", false);
          //disable annotation btn
          d3.select(".glyphAnnotateBtn-cdr." + tab).property("disabled", true);
          // disable selection
          d3.selectAll(".measureCheckbox-cdr." + tab).property(
            "disabled",
            true
          );

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        /**
         * This method removes the annotation of glyphs
         */
        $scope.remove_glyph_annotation = function(tab, debateIndex) {
          d3.select(".glyphAnnotateBtn-cdr." + tab).classed(
            "featureChecked",
            false
          );

          let measureLimit = 7;

          // keep focus of text location
          let element = getFirstSentenceInViewport(tab)[0];

          // remove annotated glyphs
          d3.selectAll(".measureGlyphContainer-cdr." + tab).remove();
          //disable remove btn
          d3.select(".glyphRemoveBtn-cdr." + tab).property("disabled", true);
          // enable annotation btn
          d3.select(".glyphAnnotateBtn-cdr." + tab).property("disabled", false);

          if (
            $scope.selectedMeasuresLists[debateIndex].length === measureLimit
          ) {
            // enable selection (only checked ones) if 7 measures already selected
            // the rest should be still disabled
            d3.selectAll(".measureCheckbox-cdr." + tab + ":checked").property(
              "disabled",
              false
            );
          } else {
            // if measure limit is not reach, enable all
            d3.selectAll(".measureCheckbox-cdr." + tab).property(
              "disabled",
              false
            );
          }

          // scroll focused text location back
          let space = 20;
          d3.select("#text_container-cdr\\ " + tab).node().scrollTop =
            element.offsetTop - space;

          // update tracker
          textScrollListener();

          if (
            $scope.speakerChecked.tab === tab &&
            $scope.speakerChecked.checked === true
          ) {
            recalcSpeakerAnnotationHeight(
              $scope.speakerOrderList[$scope.speakerChecked.index],
              $scope.speakerChecked.tab
            );
          }
        };

        // remember on which tab full screen is active
        $scope.fullScreenActive = {
          debateIndex: null,
          active: false,
          content: null
        };

        /**
         * This function opens a full screen modal window in
         * which the glyphs will be placed.
         * Further remember on which tab the full screen is active
         * and which content is shown
         * It also runs the render-method for glyphs - this will also run if someone
         * resizes the window.
         */
        $scope.openFullScreen_glyph = function(debateIndex) {
          // needed since glyph and overview share same full-screen template
          // avoid that view options show up
          $scope.showCheckboxesNECategoriesFullScreen = false;
          $scope.showCheckboxesSentimentCategoriesFullScreen = false;
          $scope.showCheckboxesPosCategoriesFullScreen = false;
          $uibModal
            .open({
              templateUrl: "views/modalWindowFullScreenCDR.html",
              controller: "modalWindowFullScreenController",
              scope: $scope,
              resolve: {
                debateIndex: debateIndex
              },
              backdrop: false,
              windowClass: "modal-full-cdr"
            })
            .rendered.then(function() {
              $scope.fullScreenActive.debateIndex = debateIndex;
              $scope.fullScreenActive.active = true;
              $scope.fullScreenActive.content = "glyph";

              checkedShowAllGlyphsFullScreen = false;

              // outsourced, so that is also callable if user resizes window
              $scope.renderGlyphsInFullScreenModalWindow(debateIndex);
            });
        };

        /**
         * This method sets the size for the modal body and container in which the
         * glyphs will be placed.
         * get selected measures, prepare data, draw the glyphs.
         * Provide zoom and pan for exploration and make glyphs clickable
         * (close full screen, navigate to text location and highlight)
         */
        $scope.renderGlyphsInFullScreenModalWindow = function(debateIndex) {
          let glyphId = getFirstSentenceInViewport(
            $scope.filenames[debateIndex]
          )[2];

          // set height of modal window body
          // subtract 126px -> header ~65px, footer ~61px
          d3.select("#modal-body-full-cdr").style("height", function() {
            let height = window.innerHeight - 126;
            return height + "px";
          });

          // get the corresponding measure objects from the user selection
          let selectedMeasuresToAnnotate = getMeasureObjects(
            debateIndex,
            $scope
          );

          // input for glyph should look like [{measure1: value1, measure2: value2, ...},...] for each utterance
          let dataForGlyph = prepareDataForGlyph(
            debateIndex,
            $scope,
            selectedMeasuresToAnnotate
          );

          // get measure name, type, min-val, max-val for data-type encoding
          let selectedMeasureNames = getSelectedMeasureNames(
            debateIndex,
            $scope,
            selectedMeasuresToAnnotate
          );

          let width = 200;
          let height = 20;
          let adjust = 3;
          let glyphLimit = 7;
          let margin = 10;

          let lineStart = 10;
          let lineEnd = 0;
          let distanceBetweenCircles;

          // select container in modal window
          let container = d3.select("#fullScreenContainer-cdr");

          // the wrapper
          let zoomableWrapper = container.append("div");

          // define zoom behaviour
          let zoom = d3.behavior.zoom();
          let shift = 0;

          container
            .style("height", function() {
              // set available height for container
              // subtract 156px -> header ~65px, footer ~61px, body padding top 15px, body padding bottom 15px
              let height = window.innerHeight - 156;
              return height + "px";
            })
            // remove if you want that parent container is scrollable
            // add 'overflow-x: scroll' to parent container
            .style("overflow", "hidden")
            .call(
              // append zoom to wrapper
              zoom.on("zoom", function() {
                zoomableWrapper.style(
                  "transform",
                  "translate(" +
                    (d3.event.translate[0] - shift) +
                    "px," +
                    d3.event.translate[1] +
                    "px) scale(" +
                    d3.event.scale +
                    ")"
                );
              })
            );

          // grid like layout
          zoomableWrapper
            .style("width", "100%")
            .style("height", "100%")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("flex-direction", "column")
            .style("align-content", "baseline")
            // sets the anchor point for the transformations of an element.
            // zoom at mouse position
            .style("transform-origin", "0 0");

          // append a div containing an svg for each utterance in which the glyph will be placed
          for (let i = 0; i < dataForGlyph.length; i++) {
            zoomableWrapper
              .append("div")
              .classed("glyphContainerFullScreen-cdr", true)
              .attr("id", "glyphFullScreen" + (i + 1))
              .style("width", "fit-content")
              .style("height", height + adjust + "px")
              .style("margin-right", "12px")
              .style("margin-bottom", "2px")
              .style("cursor", "pointer")
              .append("svg")
              .attr("glyphNumber", i + 1)
              .classed("glyphFullScreen-cdr", true)
              .style("width", width)
              .style("height", height);
          }

          // draw the glyphs into the svg`s
          let svg = d3.selectAll(".glyphFullScreen-cdr");

          // make svg clickable - close full screen and navigate to text location
          svg.on("dblclick", function() {
            // close full screen modal window
            document.getElementById("btn-closeModal-fullScreen-cdr").click();

            // build element ID and get element
            let elementID =
              "utterance" +
              d3.select(this).attr("glyphNumber") +
              " " +
              $scope.filenames[debateIndex];
            let element = document.getElementById(elementID);

            // build container ID and get container
            let containerID =
              "text_container-cdr " + $scope.filenames[debateIndex];
            let container = document.getElementById(containerID);

            // highlight utterance in container
            let utterance = d3.select(
              "#utterance" +
                d3.select(this).attr("glyphNumber") +
                "\\ " +
                $scope.filenames[debateIndex]
            );

            // scroll element and align it at the center of the container
            container.scrollTop =
              element.offsetTop - container.getBoundingClientRect().height / 2;

            // update tracker
            textScrollListener();

            utterance.style("background-color", "aqua");
            // remove background highlighting after few sec
            $timeout(function() {
              utterance.style("background-color", "unset");
            }, 4000);
          });

          if (Object.keys(dataForGlyph[0]).length === 1) {
            distanceBetweenCircles = 0;
          } else {
            let lineLength = width - margin * 4;

            lineEnd =
              (lineLength / (glyphLimit - 1)) *
              (Object.keys(dataForGlyph[0]).length - 1);

            distanceBetweenCircles = lineLength / (glyphLimit - 1);

            svg
              .append("line")
              .style("stroke", "grey")
              .style("stroke-width", "2px")
              .attr("x1", lineStart)
              .attr("y1", height / 2)
              .attr("x2", lineEnd + lineStart)
              .attr("y2", height / 2);
          }

          svg.data(dataForGlyph).each(function(d, i) {
            let svg = d3.select(this);

            let index = 0;

            let defs = svg.append("defs");

            for (const [key, value] of Object.entries(d)) {
              let type = selectedMeasureNames[index].type;
              // inner circle for feature encoding
              svg
                .append("circle")
                .classed("glyphCircleFullScreen" + i, true)
                .style("fill", function() {
                  if (type === "BINARY") {
                    return $scope.colorScaleBinary(value);
                  } else if (type === "NUMERICAL_BIPOLAR") {
                    return $scope.colorScaleNumericalBipolar(value);
                  } else if (type === "NUMERICAL_CONTINUOUS") {
                    return $scope.colorScaleNumericalContiniuous(value);
                  } else {
                    // default color
                    return "grey";
                  }
                })
                .attr("cx", function() {
                  return lineStart + index * distanceBetweenCircles;
                })
                .attr("cy", height / 2)
                .attr("r", 6)
                .on("mouseover", function() {
                  d3.select(this)
                    .append("svg:title")
                    .classed("glyphCircleTextFullScreen-cdr", true)
                    .text(function() {
                      return "feature: " + key + "\nvalue: " + value.toFixed(2);
                    });
                })
                .on("mouseout", function() {
                  d3.select(".glyphCircleTextFullScreen-cdr").remove();
                });

              // outer circles for datatype encoding
              // map min and max value to circle borders
              // therefore we need two semicircles and assign the corresponding color to them
              // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Clipping_and_masking
              let rectWidth = 20;
              let rectHeight = height;
              let clipPath1 = defs
                .append("clipPath")
                .attr("id", "cut-off-left" + i + index);

              clipPath1
                .append("rect")
                .attr("x", function() {
                  return Math.floor(lineStart + index * distanceBetweenCircles);
                })
                .attr("y", 0)
                .attr("width", rectWidth + "px")
                .attr("height", rectHeight + "px");

              let clipPath2 = defs
                .append("clipPath")
                .attr("id", "cut-off-right" + i + index);

              clipPath2
                .append("rect")
                .attr("x", function() {
                  return (
                    Math.floor(lineStart + index * distanceBetweenCircles) -
                    rectWidth
                  );
                })
                .attr("y", 0)
                .attr("width", rectWidth + "px")
                .attr("height", rectHeight + "px");

              svg
                .append("circle")
                .classed("glyphCircleBorderRightFullScreen" + i + index, true)
                .style("fill", "none")
                .style("stroke", function() {
                  // assign max values
                  if (type === "BINARY") {
                    return $scope.colorScaleBinary(1);
                  } else if (type === "NUMERICAL_BIPOLAR") {
                    return $scope.colorScaleNumericalBipolar(1);
                  } else if (type === "NUMERICAL_CONTINUOUS") {
                    return $scope.colorScaleNumericalContiniuous(1);
                  } else {
                    // default color
                    return "grey";
                  }
                })
                .style("stroke-width", "4px")
                .attr("cx", function() {
                  return lineStart + index * distanceBetweenCircles;
                })
                .attr("cy", height / 2)
                .attr("r", 6)
                .attr("clip-path", "url(#cut-off-left" + i + index + ")");

              svg
                .append("circle")
                .classed("glyphCircleBorderLeftFullScreen" + i + index, true)
                .style("fill", "none")
                .style("stroke", function() {
                  // assign min values
                  if (type === "BINARY") {
                    return $scope.colorScaleBinary(0);
                  } else if (type === "NUMERICAL_BIPOLAR") {
                    return $scope.colorScaleNumericalBipolar(-1);
                  } else if (type === "NUMERICAL_CONTINUOUS") {
                    return $scope.colorScaleNumericalContiniuous(0);
                  } else {
                    // default color
                    return "grey";
                  }
                })
                .style("stroke-width", "4px")
                .attr("cx", function() {
                  return lineStart + index * distanceBetweenCircles;
                })
                .attr("cy", height / 2)
                .attr("r", 6)
                .attr("clip-path", "url(#cut-off-right" + i + index + ")");

              index++;
            }
          });

          // resize svg width
          svg.style("width", function() {
            let width;
            if (lineEnd === 0) {
              width = margin * 2;
            } else {
              width = Math.abs(lineStart - lineEnd) + margin * 3;
            }
            return width + "px";
          });

          d3.select("#fullScreenOverviewInfoContainer")
            .style("display", "flex")
            .style("flex-direction", "row")
            .style("flex-wrap", "wrap")
            .style("overflow", "auto")
            .insert("text", "div")
            .html("<b>SELECTED FEATURE:</b> " + "DIALOG QUALITY MEASURES");

          // hide all glyphs in the glyph matrix which are filtered out
          // by selecting speaker and/or topics
          // provide a checkbox to show the other utterances
          // append info which speakers and topics are selected
          if (
            $scope.selectedSpeakerLists[debateIndex].length !== 0 ||
            $scope.selectedTopicsLists[debateIndex].length !== 0
          ) {
            // hide filtered ones
            d3.selectAll(
              ".overviewFiltered-cdr." + $scope.filenames[debateIndex]
            ).each(function() {
              let objectId = d3.select(this).attr("objectId");

              d3.select("#glyphFullScreen" + objectId)
                .style("display", "none")
                .classed("glyphFullScreenFiltered", true);
            });

            if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
              let filteredBySpeaker = "";

              for (
                let i = 0;
                i < $scope.selectedSpeakerLists[debateIndex].length;
                i++
              ) {
                if (i < $scope.selectedSpeakerLists[debateIndex].length - 1) {
                  filteredBySpeaker +=
                    $scope.selectedSpeakerLists[debateIndex][i];
                  filteredBySpeaker += ", ";
                } else {
                  filteredBySpeaker +=
                    $scope.selectedSpeakerLists[debateIndex][i];
                }
              }

              d3.select("#fullScreenOverviewInfoContainer")
                .insert("text", "div")
                .style("margin-left", "15px")
                .html("<b>FILTERED BY SPEAKER:</b> " + filteredBySpeaker);
            }

            if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
              let filteredByTopic = "";

              for (
                let i = 0;
                i < $scope.selectedTopicsLists[debateIndex].length;
                i++
              ) {
                if (i < $scope.selectedTopicsLists[debateIndex].length - 1) {
                  filteredByTopic += $scope.convertIntToRoman(
                    $scope.selectedTopicsLists[debateIndex][i],
                    1
                  );
                  filteredByTopic += ", ";
                } else {
                  filteredByTopic += $scope.convertIntToRoman(
                    $scope.selectedTopicsLists[debateIndex][i],
                    1
                  );
                }
              }

              d3.select("#fullScreenOverviewInfoContainer")
                .insert("text", "div")
                .style("margin-left", "15px")
                .html("<b>FILTERED BY TOPIC:</b> " + filteredByTopic);
            }

            // show checkbox to show all glyphs in overview
            d3.select("#checkboxShowAllGlyphsFullScreenContainer").style(
              "display",
              "flex"
            );

            // reduce opacity and remove pointer events for filtered ones
            d3.selectAll(".glyphFullScreenFiltered")
              .style("opacity", "0.25")
              .style("pointer-events", "none");

            // when window gets resized, the modal content will be rendered new
            // so check if checkbox was checked to display hidden ones as well
            if (checkedShowAllGlyphsFullScreen) {
              $scope.showAllGlyphsFullScreen(checkedShowAllGlyphsFullScreen);
            }
          }

          // if a corresponding glyph is not visible in viewport - shift it back
          let glyphElement = d3.select("#" + glyphId);
          let glyphOffsetX = glyphElement.node().getBoundingClientRect().x;

          let containerClientRect = container.node().getBoundingClientRect();
          let containerCenterX = containerClientRect.width / 2;
          let containerEndX = containerClientRect.right;
          let adjustment = 20;

          let lastGlyphClientRect = d3
            .select("#glyphFullScreen" + $scope.debateList[debateIndex].length)
            .node()
            .getBoundingClientRect();
          let lastGlyphOffsetXEnd =
            lastGlyphClientRect.x + lastGlyphClientRect.width;

          if (glyphOffsetX > containerEndX) {
            shift = glyphOffsetX - containerCenterX;

            // if last the glyph is centered in the viewport due to the shift
            // align last glyph at the end of the viewport
            if (lastGlyphOffsetXEnd - shift < containerEndX - adjustment) {
              let dif =
                containerEndX - adjustment - (lastGlyphOffsetXEnd - shift);
              shift -= dif;

              zoomableWrapper.style(
                "transform",
                "translate(" + -shift + "px," + 0 + "px) scale(" + 1 + ")"
              );
            } else {
              zoomableWrapper.style(
                "transform",
                "translate(" + -shift + "px," + 0 + "px) scale(" + 1 + ")"
              );
            }
          }

          // highlight location for few seconds
          glyphElement.style("border", "solid 2px red");
          setTimeout(function() {
            glyphElement.style("border", "none");
          }, 4000);
        };

        /**
         * This method displays/hides the glyphs in the
         * glyph matrix which are filtered out by the user
         * e.g. topics and/or speaker, before opened full screen mode,
         * based on his applied filters on the text/overview
         */
        let checkedShowAllGlyphsFullScreen;
        $scope.showAllGlyphsFullScreen = function(checked) {
          if (checked) {
            d3.selectAll(".glyphFullScreenFiltered").style("display", "flex");
          } else {
            d3.selectAll(".glyphFullScreenFiltered").style("display", "none");
          }

          checkedShowAllGlyphsFullScreen = checked;
        };

        /**
         * This method creates a modal window and provides
         * a description and the color encoding for the measures in the glyph
         */
        $scope.launchGlyphInfo = function(debateIndex) {
          $uibModal
            .open({
              templateUrl: "views/modalWindowGlyphInfoCDR.html",
              controller: "modalWindowGlyphInfoController",
              scope: $scope,
              backdrop: false
            })
            .rendered.then(function() {
              let measureDescription = {
                averagesentencecomplexity:
                  "This measure gives an approximation how complex the sentence structure of a particular speaker is.",
                interruption:
                  "This measure indicates how heated phases of a discussion are and therefore do not adhere to a respectful deliberative standard.",
                numberoffillerwords:
                  "Spontaneous, natural speech is noisy, which means that filler words like 'uhmm' or 'hmm' are often used. These signals indicate backchanneling, e.g. whether the speaker is attentive or whether somebody agrees or disagrees.",
                expectedprobabilitytospeak:
                  "This measure indicates for each turn of an speaker his expected probability to speak while regarding his neighborhood, to assess the context of a speaker turn.",
                movingginiindex:
                  "This measure indicates the turn-taking distribution, to assess the context of a speaker turn.",
                emotioncount:
                  "This measure indicates the amount of positive or negative emotions in one turn",
                emotionrelation:
                  "This measure describes the relation between negative and positive emotions for a turn",
                topicshift:
                  "This measure describes whether the topic of the turn advances the conversation, or whether the turn is continuing with an already established topic. ",
                selfpreviousrecurrence:
                  "This measure describes the relative amount of content recurrence a selected turn has to previous turns from the same speaker, considering all previous turns. (repetitions of what this speaker has already said)",
                selffollowingrecurrence:
                  "This measure describes the relative amount of content recurrence a selected turn has to the following turns from the same speaker, considering all previous turns. (how much influence this particular speaker turn will have on the remainder of the conversation)",
                selfrecurrenceshift:
                  "This measure describes the relation between the self previous recurrence and the self following recurrence. It indicates if a turn is progressive or not, i.e. is it relevant to the preceding part or will it become more relevant for the following part. ",
                topicpersistence:
                  "This measure describes whether the speaker of a particular turn is persistent with regard to the topic of that turn or not.",
                politeness: "This measure indicates how polite a speaker is",
                impatience:
                  "This measure indicates the occurrence of impatience",
                unobtrusiveness:
                  "This measure indicates the occurrence of unobtrusiveness",
                resignationacceptance:
                  "This measure indicates the relative value of resignation for one speaker turn",
                sentiment:
                  "This measure indicates a view or opinion that is held or expressed by a speaker",
                epistemicvalue:
                  "This measure indicates the speaker's evaluation/judgment of, degree of confidence in, or belief of the knowledge upon which a proposition is based.",
                reason:
                  "This measure indicates for causal argumentation the relative value of premises for one utterance",
                conclusion:
                  "This measure indicates for causal argumentation the relative value of conclusions for one utterance",
                eventmodalityobligation:
                  "This measure indicates the occurrence of an obligation",
                eventmodalityvolition:
                  "This measure indicates the occurrence of a volition",
                externalconstraint:
                  "This measure indicates the occurrence of an external constraint",
                eventmodalitypermission:
                  "This measure indicates the occurrence of a permission",
                eventmodalityalternative:
                  "This measure indicates the occurrence of an alternative",
                eventmodalityreluctance:
                  "This measure indicates the occurrence of a reluctance",
                commonground:
                  "This measure indicates if interlocutors share an abstract knowledge space or not ",
                rejectcommonground:
                  "This measure indicates if the common ground is rejected by a interlocutor",
                activatecommonground:
                  "This measure indicates if the common ground is activated by a interlocutor",
                informationgiving:
                  "This measure indicates the occurrence if a speaker is providing information or not ",
                elucidation:
                  "This measure indicates the occurrence if a speaker giving a elucidation or not",
                informationseeking:
                  "This measure indicates the occurrence if a speaker is soughing information or not",
                informationrefusing:
                  "This measure indicates the occurrence if a speaker is refusing information or not",
                maasindex:
                  "This measure gives insights how eloquence a speaker is, and is measuring the diversity of their vocabulary",
                stalling:
                  "This measure indicates if a speaker is stalling or not",
                networkdensity:
                  "This measure indicates the net work density of all thematic relations of a speaker turn",
                condition:
                  "This measure indicates the relative value of conditional discourse relations for one utterance",
                consequence:
                  "This measure indicates the relative value of conditional discourse relations for one utterance",
                arrangementcount:
                  "This measure indicates the relative value of agreement and disagreement count for one utterance",
                arrangementrelation:
                  "This measure indicates the relation between agreement and disagreement",
                consensus:
                  "This measure indicates the occurrence of a consensus",
                agreement:
                  "This measure indicates the occurrence of an agreement",
                consensuswilling:
                  "This measure indicates if a speaker is consensus willing or not",
                minimalconsensus:
                  "This measure indicates if a minimal consensus exist or not ",
                concession:
                  "This measure indicates the relative value of occurrence of concessions for one utterance",
                opposition:
                  "This measure indicates the relative value of occurrence of oppositions for one utterance",
                dissent: "This measure indicates if a dissents occur or not",
                disagreement:
                  "This measure indicates the occurrence of an disagreement",
                activateopposition:
                  "This measure indicates whether a opposition is activated or not",
                contrast: "This measure indicates if a contrast exists or not ",
                negotiationrelation:
                  "This measure indicates the relation between arguing and bargaining",
                negotiationcount:
                  "This measure indicates the relative value of negotiation count for one utterance",
                arguing: "This measure indicates the occurrence of arguing",
                bargaining:
                  "This measure indicates the occurrence of bargaining"
              };

              d3.selectAll(".measureItemModalWindowGlyph").each(function() {
                // iterate over the list of available measures and set class attribute of listed measures to available
                for (
                  let i = 0;
                  i < $scope.measureNamesList[debateIndex].length;
                  i++
                ) {
                  if (
                    d3
                      .select(this)
                      .attr("value")
                      .match(
                        $scope.measureNamesList[debateIndex][
                          i
                        ].name.toLowerCase()
                      )
                  ) {
                    d3.select(this).classed("available", true);
                  }
                }

                // add a tooltip with description to the measures which are listed in the table
                // https://getbootstrap.com/docs/4.2/components/tooltips/
                // did not worked with d3.on("mouseover") -> tooltip was not shown in modal window
                d3.select(this)
                  .attr("data-toggle", "tooltip")
                  .attr(
                    "title",
                    measureDescription[
                      d3
                        .select(this)
                        .attr("value")
                        .replace(/[\s]/g, "")
                    ]
                  );
              });

              // reduce opacity of those items which are not classed available
              d3.selectAll(
                ".measureItemModalWindowGlyph:not(.available)"
              ).style("opacity", 0.3);

              const width = 300;
              const height = 50;

              // draw color legend for bipolar

              let svgLegendBipolar = d3
                .select("#glyphEncodingBipolar")
                .append("svg")
                .classed("svgBipolarLegend", true)
                .style("height", height + 20)
                .style("width", "100%");

              // append a defs (for definition) element to svg
              let defsBipolar = svgLegendBipolar.append("defs");

              // append a linearGradient element to the defs and give it a unique id
              let linearGradientBipolar = defsBipolar
                .append("linearGradient")
                .attr("id", "linear-gradient-bipolar");

              // horizontal gradient
              linearGradientBipolar
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

              //Set the color for the start (0%)
              linearGradientBipolar
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#384ca0");

              //Set the color for the end (25%)
              linearGradientBipolar
                .append("stop")
                .attr("offset", "25%")
                .attr("stop-color", "#a3d1e5");

              //Set the color for the end (50%)
              linearGradientBipolar
                .append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "#fedd90");

              //Set the color for the end (75%)
              linearGradientBipolar
                .append("stop")
                .attr("offset", "75%")
                .attr("stop-color", "#f57f4b");

              //Set the color for the end (100%)
              linearGradientBipolar
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ab0f45");

              // draw the rectangle and fill with gradient
              let rectBipolar = svgLegendBipolar
                .append("rect")
                .style("width", width)
                .style("height", height - 10)
                .style("fill", "url(#linear-gradient-bipolar)");

              // for shifting the color-scale to the center of the svg
              let xShiftBipolar =
                parseInt(d3.select(".svgBipolarLegend").style("width")) / 2 -
                width / 2;

              rectBipolar.attr(
                "transform",
                "translate(" + xShiftBipolar + ",0)"
              );

              // draw axis and title
              let yBipolar = d3
                .scaleLinear()
                .range([width - 1, 0])
                .domain([1, -1]);

              let tickLabelsBipolar = ["-1", "0", "1"];
              let ticksBipolar = [-1, 0, 1];

              let yAxisBipolar = d3.svg
                .axis()
                .scale(yBipolar)
                .tickValues(ticksBipolar)
                .tickFormat(function(d, i) {
                  return tickLabelsBipolar[i];
                });

              svgLegendBipolar
                .append("g")
                .attr("class", "y axis")
                .attr(
                  "transform",
                  "translate(" +
                    (xShiftBipolar + 0.5) +
                    "," +
                    (height - 10) +
                    ")"
                )
                .call(yAxisBipolar)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

              // draw color legend for numerical
              // append a defs (for definition) element to your SVG
              let svgLegendNumerical = d3
                .select("#glyphEncodingNumerical")
                .append("svg")
                .classed("svgNumericalLegend", true)
                .style("height", height + 20)
                .style("width", "100%");

              let defsNumerical = svgLegendNumerical.append("defs");

              // append a linearGradient element to the defs and give it a unique id
              let linearGradientNumerical = defsNumerical
                .append("linearGradient")
                .attr("id", "linear-gradient-numerical");

              // horizontal gradient
              linearGradientNumerical
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

              //Set the color for the start (0%)
              linearGradientNumerical
                .append("stop")
                .attr("offset", "0%")
                //.attr("stop-color", "#9e9cc9");
                .attr("stop-color", "#b0dfaa");

              //Set the color for the end (100%)
              linearGradientNumerical
                .append("stop")
                .attr("offset", "100%")
                //.attr("stop-color", "#3f007d");
                .attr("stop-color", "#0e7735");

              // draw the rectangle and fill with gradient
              let rectNumerical = svgLegendNumerical
                .append("rect")
                .style("width", width)
                .style("height", height - 10)
                .style("fill", "url(#linear-gradient-numerical)");

              // for shifting the color-scale to the center of the svg
              let xShiftNumerical =
                parseInt(d3.select(".svgNumericalLegend").style("width")) / 2 -
                width / 2;

              rectNumerical.attr(
                "transform",
                "translate(" + xShiftNumerical + ",0)"
              );

              // draw axis and title
              let yNumerical = d3
                .scaleLinear()
                .range([width - 1, 0])
                .domain([1, 0]);

              let tickLabelsNumerical = ["0", "1"];
              let ticksNumerical = [0, 1];

              let yAxisNumerical = d3.svg
                .axis()
                .scale(yNumerical)
                .tickValues(ticksNumerical)
                .tickFormat(function(d, i) {
                  return tickLabelsNumerical[i];
                });

              svgLegendNumerical
                .append("g")
                .attr("class", "y axis")
                .attr(
                  "transform",
                  "translate(" +
                    (xShiftNumerical + 0.5) +
                    "," +
                    (height - 10) +
                    ")"
                )
                .call(yAxisNumerical)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("dy", ".71em")
                .style("text-anchor", "end");
            });
        };

        // create for each tab a own list which stores the words for highlighting
        $scope.highlightedSearchWordsOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.highlightedSearchWordsOfTab[i] = [];
        }

        // create for each tab a own list which stores the ids of words for highlighting
        $scope.highlightedSearchWordsElementIDsOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.highlightedSearchWordsElementIDsOfTab[i] = [];
        }

        // create for each tab a own list which stores the the navigation-counter for highlighted words
        $scope.navigationCounterHighlightedWordsOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.navigationCounterHighlightedWordsOfTab[i] = 0;
        }

        $scope.search = "";

        // create dynamically an object and store for each tab a key value pair
        // necessary to decide on which tab the search for words is used
        $scope.searchWordsTab = {};
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.searchWordsTab["searchWordsOfTab" + i] = {
            notFound: false,
            found: false,
            foundCounter: 0
          };
        }

        $scope.lastSearchOfTab = new Array($scope.filenames.length);
        $scope.searchActiveOfTab = new Array($scope.filenames.length);

        /**
         * This method is searching a word in the debate and highlights them,
         * also remember the last input to avoid a second enter of the same word.
         */
        $scope.search_words = function(word, tab, debateIndex) {
          if (
            $scope.lastSearchOfTab[debateIndex] === undefined ||
            // avoid second enter of same word
            $scope.lastSearchOfTab[debateIndex] !== word
          ) {
            $scope.lastSearchOfTab[debateIndex] = word.toLowerCase();

            $scope.searchWordsTab[
              "searchWordsOfTab" + debateIndex
            ].enterWords = true;
            $scope.searchWordsTab[
              "searchWordsOfTab" + debateIndex
            ].found = false;
            let counter = 0;

            // select words to highlight based on their class attribute
            // avoid selecting word in filtered utterances
            d3.selectAll(".word_" + word.toLowerCase() + "." + tab).each(
              function() {
                // check if word in filtered utterance and skip if it is
                if (
                  !d3
                    .select(
                      "#object" +
                        d3.select(this).attr("utterance") +
                        "\\ " +
                        tab
                    )
                    .classed("utteranceFiltered-cdr")
                ) {
                  let wordElement = d3.select(this);
                  let oldElementID = d3.select(this).attr("id");

                  let highlightedWord = wordElement
                    .attr("id", oldElementID + " searchWordHighlighted")
                    .classed("searchWordHighlighted-cdr", true)
                    .style("background-color", "rgba(255,255,0,0.5)");

                  // highlight corresponding pixel in overview when default view is selected
                  let utteranceId = wordElement.attr("utterance");
                  let sentenceId = wordElement.attr("sentence");
                  let wordId = wordElement.attr("word");

                  if ($scope.featureOverviewOfTab[debateIndex] === "DEFAULT") {
                    d3.select(
                      "#utteranceOverview" +
                        utteranceId +
                        "\\ sentenceOverview" +
                        sentenceId +
                        "\\ wordOverview" +
                        wordId +
                        "\\ " +
                        tab
                    )
                      .style("fill", "yellow")
                      .classed("wordSearchHighlightedOverview-cdr", true);
                  }

                  // store words and ids
                  $scope.highlightedSearchWordsOfTab[debateIndex].push(
                    highlightedWord
                  );
                  $scope.highlightedSearchWordsElementIDsOfTab[
                    debateIndex
                  ].push(oldElementID);
                  counter++;
                }
              }
            );

            if (counter === 0) {
              // no word is found
              // search-input color red
              // display not found in red
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].notFound = true;

              d3.select(".form-control.searchWords-cdr." + tab + ":focus")
                .classed("has-error", true)
                .classed("has-no-error", false);

              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].foundCounter = counter;
            } else {
              // words found
              // search-input color green
              // display how many found in green
              d3.select(".form-control.searchWords-cdr." + tab + ":focus")
                .classed("has-error", false)
                .classed("has-no-error", true);

              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].found = true;
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].notFound = false;
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].foundCounter = counter;

              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] = 0;
              $scope.navigationBorderAroundHighlightedWordOfTab[
                debateIndex
              ] = null;

              $scope.searchActiveOfTab[debateIndex] = true;

              // enable fullscreen for default view
              if ($scope.featureOverviewOfTab[debateIndex] === "DEFAULT") {
                d3.select(".btn-fullscreenOverview-cdr." + tab).property(
                  "disabled",
                  false
                );
              }
            }
          }
        };

        /**
         * This method removes the highlighting, the border for words if user
         * change the input of search words.
         * It also clears necessary lists which are used to track on which tab the search run.
         */
        $scope.cleanSearch = function(tab, debateIndex) {
          if (
            $scope.searchWordsTab["searchWordsOfTab" + debateIndex].enterWords
          ) {
            if ($scope.highlightedSearchWordsOfTab[debateIndex].length !== 0) {
              for (
                let i = 0;
                i < $scope.highlightedSearchWordsOfTab[debateIndex].length;
                i++
              ) {
                $scope.highlightedSearchWordsOfTab[debateIndex][i]
                  .style("background-color", "white")
                  .attr(
                    "id",
                    $scope.highlightedSearchWordsElementIDsOfTab[debateIndex][i]
                  )
                  .classed("searchWordHighlighted-cdr", false);
              }
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].notFound = false;
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].found = false;

              // remove pixel highlighting in the overview
              if ($scope.featureOverviewOfTab[debateIndex] === "DEFAULT") {
                d3.selectAll(".wordSearchHighlightedOverview-cdr." + tab)
                  .style("fill", function() {
                    return d3.select(this).attr("pixelColor");
                  })
                  .classed("wordSearchHighlightedOverview-cdr", false);

                // disable fullscreen for default view
                d3.select(".btn-fullscreenOverview-cdr." + tab).property(
                  "disabled",
                  true
                );
              }
            } else {
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].notFound = false;
              $scope.searchWordsTab[
                "searchWordsOfTab" + debateIndex
              ].found = false;
            }
            d3.select(".form-control.searchWords-cdr." + tab + ":focus")
              .classed("has-error", false)
              .classed("has-no-error", false);

            $scope.searchWordsTab[
              "searchWordsOfTab" + debateIndex
            ].enterWords = false;
            // clear list
            // clear words
            $scope.highlightedSearchWordsOfTab[debateIndex] = [];
            // clear navigation ids for each word
            $scope.highlightedSearchWordsElementIDsOfTab[debateIndex] = [];
            $scope.navigationCounterHighlightedWordsOfTab[debateIndex] = 0;
            // clear last remembered input
            $scope.lastSearchOfTab[debateIndex] = undefined;
            // clear that search is active
            $scope.searchActiveOfTab[debateIndex] = false;

            // remove border and clear entry in list
            if (
              $scope.navigationBorderAroundHighlightedWordOfTab[debateIndex] !==
              null
            ) {
              $scope.navigationBorderAroundHighlightedWordOfTab[
                debateIndex
              ].style("border", "none");
              $scope.navigationBorderAroundHighlightedWordOfTab[
                debateIndex
              ] = null;
            }
          }
        };

        // track for each tab on which element the border is set while navigating
        $scope.navigationBorderAroundHighlightedWordOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.navigationBorderAroundHighlightedWordOfTab[i] = null;
        }

        /**
         * This method provides a navigating through the highlighted words by the search
         * The corresponding element will be marked with a border by clicking prev or next.
         */
        $scope.navigate_through_highlighted_words_of_search = function(
          debateIndex,
          tab,
          nav
        ) {
          if (nav === "prev") {
            if (
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] > 1
            ) {
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex]--;
            } else {
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] =
                $scope.highlightedSearchWordsElementIDsOfTab[
                  debateIndex
                ].length;
            }
          } else if (nav === "next") {
            if (
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] <
              $scope.highlightedSearchWordsElementIDsOfTab[debateIndex].length
            ) {
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex]++;
            } else {
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] = 1;
            }
          }

          let elementID =
            $scope.highlightedSearchWordsElementIDsOfTab[debateIndex][
              $scope.navigationCounterHighlightedWordsOfTab[debateIndex] - 1
            ] + " searchWordHighlighted";

          // smooth scroll to element and align it at the center
          let element = document.getElementById(elementID);
          // center option dont work correctly (skipped some elements)
          // element.scrollIntoView({ behavior: "smooth", block: 'center');
          let containerID = "text_container-cdr " + tab;
          let container = document.getElementById(containerID);

          container.scrollTo({
            top:
              element.offsetTop - container.getBoundingClientRect().height / 2,
            behavior: "smooth"
          });

          //remove border of previous element
          if (
            $scope.navigationBorderAroundHighlightedWordOfTab[debateIndex] !==
            null
          ) {
            $scope.navigationBorderAroundHighlightedWordOfTab[
              debateIndex
            ].style("border", "none");
          }

          // set border around navigated word
          let navigationBorder = d3.select(
            "#" + elementID.replace(/\s/g, "\\ ")
          );

          // remember for which element
          $scope.navigationBorderAroundHighlightedWordOfTab[
            debateIndex
          ] = navigationBorder;

          navigationBorder
            .style("border", "solid 1px black")
            .style("border-radius", "5%");
        };

        /**
         * This method creates a modal window and will run the word cloud
         * algorithm which will then placed in the modal.
         */
        $scope.createWordCloud = function(tab, debateIndex) {
          $uibModal
            .open({
              templateUrl: "views/modalWindowWordCloudCDR.html",
              controller: "modalWindowWordCloudController",
              scope: $scope,
              backdrop: false,
              size: "lg"
            })
            .rendered.then(function() {
              let stepSize = 1.5;
              let initialHeight = 200;
              let initialWidth = 200;

              // find min max frequency
              let minFreq = Math.min.apply(
                null,
                $scope.wordFrequenciesList[debateIndex].map(
                  item => item.frequency
                )
              );
              let maxFreq = Math.max.apply(
                null,
                $scope.wordFrequenciesList[debateIndex].map(
                  item => item.frequency
                )
              );

              // log scaled to dampen the visual effect that high frequency words get to large vice versa
              let frequencyFontSize = d3.scale
                .log()
                .base(10)
                .range([10, 20])
                .domain([minFreq, maxFreq]);
              let frequencyFontColor = d3.scale
                .log()
                .base(10)
                .interpolate(d3.interpolateHcl)
                .range(["#989898", "#000000"])
                .domain([minFreq, maxFreq]);

              generateWordCloudLayout(
                initialWidth,
                initialHeight,
                stepSize,
                frequencyFontSize,
                frequencyFontColor,
                $uibModal,
                $scope,
                debateIndex
              );
            });
        };

        /**
         * This method creates a modal window and provides
         * a description for word frequencies
         */
        $scope.launchWordFreqInfo = function() {
          $uibModal.open({
            templateUrl: "views/modalWindowWordFreqInfoCDR.html",
            controller: "modalWindowWordFreqInfoController",
            scope: $scope,
            backdrop: false
          });
        };

        // track for each tab which feature for overview is selected
        $scope.featureOverviewOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.featureOverviewOfTab[i] = "DEFAULT";
        }

        /**
         * This method is rendering the pixels for each selected feature in the overview.
         * The corresponding value for each pixel will be encoded with color.
         * For topics the topic-number will be placed and keyword be highlighted.
         */
        $scope.renderOverview = function(feature, tab, debateIndex) {
          if ($scope.featureOverviewOfTab[debateIndex] !== feature) {
            // remove topic annotation when topics was selected before
            if ($scope.featureOverviewOfTab[debateIndex] === "TOPICS") {
              // remove topic numbers
              d3.selectAll(".topicNumberOverview-cdr." + tab).remove();
              // shift utterance pixel back
              d3.selectAll(".utteranceOverview-cdr." + tab).style(
                "transform",
                "translate(0px,0px)"
              );
              // remove class
              d3.selectAll(".wordOverview-cdr." + tab).classed(
                "pixelTopicKeywordHighlighted-cdr",
                false
              );
            }

            // remove namedEntity class when it was selected before
            if ($scope.featureOverviewOfTab[debateIndex] === "NAMED ENTITIES") {
              d3.selectAll(".namedEntityOverview-cdr." + tab).each(function() {
                d3.select(this)
                  .classed("namedEntityOverview-cdr", false)
                  .classed(d3.select(this).attr("namedEntityCategory"), false)
                  .attr("namedEntityCategory", null);
              });

              // check also if view options were active and remove class
              if (
                $scope.selectedCategoriesNamedEntityLists[debateIndex]
                  .length !== 0
              ) {
                d3.selectAll(
                  ".namedEntityAnnotationOverviewHidden-cdr." + tab
                ).classed("namedEntityAnnotationOverviewHidden-cdr", false);
              }
            }

            // remove sentiment class when it was selected before
            if ($scope.featureOverviewOfTab[debateIndex] === "SENTIMENT WORD") {
              d3.selectAll(".sentimentAnnotationOverview-cdr." + tab).each(
                function() {
                  let pixel = d3.select(this);

                  pixel.classed("sentimentAnnotationOverview-cdr", false);

                  if (pixel.classed("negativeSentimentOverview-cdr")) {
                    pixel.classed("negativeSentimentOverview-cdr", false);
                  }

                  if (pixel.classed("positiveSentimentOverview-cdr")) {
                    pixel.classed("positiveSentimentOverview-cdr", false);
                  }
                }
              );

              // check also if view options were active and remove class
              if (
                $scope.selectedCategoriesSentimentLists[debateIndex].length !==
                0
              ) {
                d3.selectAll(
                  ".sentimentAnnotationOverviewHidden-cdr." + tab
                ).classed("sentimentAnnotationOverviewHidden-cdr", false);
              }
            }

            // remove pos class when it was selected before
            if ($scope.featureOverviewOfTab[debateIndex] === "POS") {
              d3.selectAll(".posAnnotationOverview-cdr." + tab).each(
                function() {
                  d3.select(this)
                    .attr("posTagCategory", null)
                    .classed("posAnnotationOverview-cdr", false)
                    .classed(
                      "posAnnotationOverview" + d3.select(this).attr("tag"),
                      false
                    )
                    .attr("tag", null);
                }
              );

              // check also if view options were active and remove class
              if (
                $scope.selectedCategoriesPosTagLists[debateIndex].length !== 0
              ) {
                d3.selectAll(".posAnnotationOverviewHidden-cdr." + tab).classed(
                  "posAnnotationOverviewHidden-cdr",
                  false
                );
              }
            }

            let lastFeature = $scope.featureOverviewOfTab[debateIndex];
            $scope.featureOverviewOfTab[debateIndex] = feature;

            if (feature === "DEFAULT") {
              if (!$scope.searchActiveOfTab[debateIndex]) {
                d3.selectAll(".wordOverview-cdr." + tab)
                  .attr("pixelColor", "lightgrey")
                  .style("fill", "lightgrey");

                // disable fullscreen for default view
                d3.select(".btn-fullscreenOverview-cdr." + tab).property(
                  "disabled",
                  true
                );
              } else {
                // if word search is active then restore pixel highlighting
                // reset pixel to default
                d3.selectAll(".wordOverview-cdr." + tab)
                  .attr("pixelColor", "lightgrey")
                  .style("fill", "lightgrey");

                // rerun search
                let word = $scope.lastSearchOfTab[debateIndex];
                $scope.cleanSearch(tab, debateIndex);
                $scope.search_words(word, tab, debateIndex);

                // enable fullscreen for default view
                d3.select(".btn-fullscreenOverview-cdr." + tab).property(
                  "disabled",
                  false
                );
              }
            } else {
              if (lastFeature !== "DEFAULT") {
                // reset pixel-color before another feature will be encoded
                d3.selectAll(".wordOverview-cdr." + tab)
                  .attr("pixelColor", "lightgrey")
                  .style("fill", "lightgrey");
              } else {
                // remove search highlighting if active

                if ($scope.searchActiveOfTab[debateIndex]) {
                  d3.selectAll(".wordSearchHighlightedOverview-cdr." + tab)
                    .style("fill", function() {
                      return d3.select(this).attr("pixelColor");
                    })
                    .classed("wordSearchHighlightedOverview-cdr", false);
                }

                // enable fullscreen only once when another feature is selected than default
                d3.select(".btn-fullscreenOverview-cdr." + tab).property(
                  "disabled",
                  false
                );
              }
            }

            if (feature === "POS") {
              for (let i = 0; i < $scope.debateList[debateIndex].length; i++) {
                let utteranceTags =
                  $scope.posTagLabelsList[debateIndex][i][
                    "utterance" + (i + 1)
                  ];

                let sentenceCount = 1;

                for (let sentenceTags in utteranceTags) {
                  let wordTags = angular.copy(utteranceTags[sentenceTags]);
                  let wordCount = 1;
                  for (let wordTag in wordTags) {
                    let posTag = wordTags[wordTag];

                    let pixel = d3.select(
                      "#utteranceOverview" +
                        (i + 1) +
                        "\\ " +
                        "sentenceOverview" +
                        sentenceCount +
                        "\\ " +
                        "wordOverview" +
                        wordCount +
                        "\\ " +
                        tab
                    );

                    pixel
                      .classed("posAnnotationOverview-cdr", true)
                      .classed("posAnnotationOverview" + posTag, true)
                      .attr("tag", posTag)
                      .attr("posTagCategory", function() {
                        if (posTag !== "P") {
                          return $scope.posTagCategoryMap[posTag];
                        } else {
                          return "punctuation";
                        }
                      })
                      .attr("pixelColor", function() {
                        if (
                          $scope.posTagSetList[debateIndex].includes(posTag)
                        ) {
                          let category = $scope.posTagCategoryMap[posTag];
                          return $scope.posTagColor(category);
                        } else {
                          // default color also for punctuation
                          return "grey";
                        }
                      })
                      .style("fill", function() {
                        if (
                          $scope.selectedCategoriesPosTagLists[debateIndex]
                            .length !== 0 &&
                          !$scope.selectedCategoriesPosTagLists[
                            debateIndex
                          ].includes(posTag)
                        ) {
                          // view options active
                          pixel.classed(
                            "posAnnotationOverviewHidden-cdr",
                            true
                          );
                          return "lightgrey";
                        } else {
                          if (
                            $scope.posTagSetList[debateIndex].includes(posTag)
                          ) {
                            let category = $scope.posTagCategoryMap[posTag];
                            return $scope.posTagColor(category);
                          } else {
                            //default color also for punctuation
                            return "grey";
                          }
                        }
                      });

                    wordCount++;
                  }
                  sentenceCount++;
                }
              }
            }

            if (
              feature === "SENTIMENT WORD" ||
              feature === "SENTIMENT SENTENCE" ||
              feature === "SENTIMENT UTTERANCE"
            ) {
              for (let i = 0; i < $scope.debateList[debateIndex].length; i++) {
                let utterance =
                  $scope.sentimentsList[debateIndex][i]["utterance" + (i + 1)];
                let sentenceCount = 1;
                let avgUtteranceSentiment = 0;
                for (let sentence in utterance) {
                  let avgSentenceSentiment = 0;
                  let words = angular.copy(utterance[sentence]);
                  let wordCount = 1;
                  for (let word in words) {
                    let sentiment = words[word];

                    if (feature === "SENTIMENT WORD") {
                      let pixel = d3.select(
                        "#utteranceOverview" +
                          (i + 1) +
                          "\\ " +
                          "sentenceOverview" +
                          sentenceCount +
                          "\\ " +
                          "wordOverview" +
                          wordCount +
                          "\\ " +
                          tab
                      );

                      if (sentiment === -1) {
                        pixel
                          .classed("sentimentAnnotationOverview-cdr", true)
                          .classed("negativeSentimentOverview-cdr", true);

                        let temp = "negative";

                        if (
                          $scope.selectedCategoriesSentimentLists[debateIndex]
                            .length !== 0 &&
                          !$scope.selectedCategoriesSentimentLists[
                            debateIndex
                          ].includes(temp)
                        ) {
                          pixel.classed(
                            "sentimentAnnotationOverviewHidden-cdr",
                            true
                          );
                        }
                      } else if (sentiment === 1) {
                        pixel
                          .classed("sentimentAnnotationOverview-cdr", true)
                          .classed("positiveSentimentOverview-cdr", true);

                        let temp = "positive";

                        if (
                          $scope.selectedCategoriesSentimentLists[debateIndex]
                            .length !== 0 &&
                          !$scope.selectedCategoriesSentimentLists[
                            debateIndex
                          ].includes(temp)
                        ) {
                          pixel.classed(
                            "sentimentAnnotationOverviewHidden-cdr",
                            true
                          );
                        }
                      }

                      pixel
                        .attr("pixelColor", function() {
                          // default color for neutral
                          let color = "lightgrey";

                          if (sentiment === -1) {
                            color = "red";
                          } else if (sentiment === 1) {
                            color = "green";
                          }
                          return color;
                        })
                        .style("fill", function() {
                          // default color for neutral
                          let color = "lightgrey";

                          if (
                            d3
                              .select(this)
                              .classed("sentimentAnnotationOverviewHidden-cdr")
                          ) {
                            return color;
                          } else {
                            // assign corresponding color
                            if (sentiment === -1) {
                              color = "red";
                            } else if (sentiment === 1) {
                              color = "green";
                            }
                            return color;
                          }
                        });
                    } else if (
                      feature === "SENTIMENT SENTENCE" ||
                      feature === "SENTIMENT UTTERANCE"
                    ) {
                      avgSentenceSentiment += sentiment;
                    }
                    wordCount++;
                  }

                  if (feature === "SENTIMENT SENTENCE") {
                    avgSentenceSentiment =
                      avgSentenceSentiment / (wordCount - 1);

                    d3.select(
                      "#utteranceOverview" +
                        (i + 1) +
                        "\\ sentenceOverview" +
                        sentenceCount +
                        "\\ " +
                        tab
                    )
                      .selectAll("rect")
                      .attr("pixelColor", function() {
                        return $scope.sentimentColor(avgSentenceSentiment);
                      })
                      .style("fill", function() {
                        return $scope.sentimentColor(avgSentenceSentiment);
                      });
                  }

                  if (feature === "SENTIMENT UTTERANCE") {
                    avgUtteranceSentiment +=
                      avgSentenceSentiment / (wordCount - 1);
                  }
                  sentenceCount++;
                }

                if (feature === "SENTIMENT UTTERANCE") {
                  avgUtteranceSentiment +=
                    avgUtteranceSentiment / (sentenceCount - 1);

                  d3.select("#utteranceOverview" + (i + 1) + "\\ " + tab)
                    .selectAll("rect")
                    .attr("pixelColor", function() {
                      return $scope.sentimentColor(avgUtteranceSentiment);
                    })
                    .style("fill", function() {
                      return $scope.sentimentColor(avgUtteranceSentiment);
                    });
                }
              }
            }

            if (feature === "TOPICS") {
              // annotate topic number and shift utterance to right

              d3.selectAll(".objectOverview-cdr." + tab).each(function() {
                // shift
                d3.select(this)
                  .select(".utteranceOverview-cdr")
                  .style("transform", "translate(16px,0px)");

                // annotate topic number
                let topicNumber = $scope.convertIntToRoman(
                  parseInt(d3.select(this).attr("topic")),
                  1
                );

                let yPosition =
                  parseFloat(d3.select(this).attr("yStartOrigin")) +
                  Math.abs(
                    parseFloat(d3.select(this).attr("yStartOrigin")) -
                      parseFloat(d3.select(this).attr("yEndOrigin"))
                  ) /
                    2;

                d3.select(this)
                  .append("text")
                  .classed("topicNumberOverview-cdr", true)
                  .classed(tab, true)
                  .attr("x", "0px")
                  .attr("y", yPosition + 4 + "px")
                  .style("fill", "black")
                  .style("font-weight", "bold")
                  .style("font-size", "10px")
                  .text(topicNumber);
              });

              // highlight keywords

              d3.selectAll(".utteranceOverview-cdr." + tab).each(function(
                _,
                indexUtterance
              ) {
                let utteranceId = indexUtterance + 1;
                let topic =
                  $scope.topicsList[debateIndex][0]["utterance" + utteranceId];
                let descriptors =
                  $scope.topicDescriptorsList[debateIndex][0][topic];

                let sentences = d3
                  .select(this)
                  .selectAll(".sentenceOverview-cdr." + tab);

                sentences.each(function(_, indexSentence) {
                  let sentenceId = indexSentence + 1;

                  let words = d3.select(this).selectAll("rect");

                  words.each(function(_, indexWord) {
                    let wordId = indexWord + 1;
                    let word = d3
                      .select(this)
                      .attr("word")
                      .toLowerCase();

                    let found = false;

                    // avoid punctuation, words starting with an apostrophe and stop-words

                    if (
                      !word.match(/^[.,!?;:']/) &&
                      !$scope.stopWords.includes(word)
                    ) {
                      let stemmedWord = stemmer(word);
                      // check if word is in list of descriptors
                      // check also stemmed version of word

                      for (let i = 0; i < descriptors.length; i++) {
                        let descriptor = descriptors[i].toLowerCase();

                        if (
                          descriptor === word ||
                          (stemmer(descriptor) === stemmedWord &&
                            !d3
                              .select(this)
                              .classed("pixelTopicKeywordHighlighted-cdr"))
                        ) {
                          d3.select(this)
                            .classed("pixelTopicKeywordHighlighted-cdr", true)
                            .attr("pixelColor", "black")
                            .style("fill", "black");

                          found = true;
                        }
                      }

                      // check if word is part of an keyword consisting of multiple words
                      if (!found) {
                        for (let i = 0; i < descriptors.length; i++) {
                          let descriptor = descriptors[i].toLowerCase();

                          // avoid matching keyword like xyz_
                          if (
                            descriptor.startsWith(word + "_") ||
                            (descriptor.startsWith(stemmedWord + "_") &&
                              !descriptor.endsWith(word + "_")) ||
                            descriptor.startsWith(stemmedWord + "_")
                          ) {
                            // separate descriptor into independent words
                            let temp = descriptor.split("_");

                            let counter = 0;
                            let nextWord = word;

                            // match separated-keyword with word
                            for (let k = 0; k < temp.length; k++) {
                              let part = temp[k];
                              if (
                                part === nextWord ||
                                stemmer(part) === stemmer(nextWord)
                              ) {
                                counter++;
                                // get following word
                                if (
                                  d3.select(
                                    "#utteranceOverview" +
                                      utteranceId +
                                      "\\ sentenceOverview" +
                                      sentenceId +
                                      "\\ wordOverview" +
                                      (wordId + 1) +
                                      "\\ " +
                                      tab
                                  )[0][0] !== null
                                ) {
                                  nextWord = d3
                                    .select(
                                      "#utteranceOverview" +
                                        utteranceId +
                                        "\\ sentenceOverview" +
                                        sentenceId +
                                        "\\ wordOverview" +
                                        (wordId + 1) +
                                        "\\ " +
                                        tab
                                    )
                                    .attr("word")
                                    .toLowerCase();
                                }
                              }
                            }

                            if (counter === temp.length) {
                              let nextWordId = wordId;
                              while (counter > 0) {
                                let element = d3.select(
                                  "#utteranceOverview" +
                                    utteranceId +
                                    "\\ sentenceOverview" +
                                    sentenceId +
                                    "\\ wordOverview" +
                                    nextWordId +
                                    "\\ " +
                                    tab
                                );

                                element
                                  .classed(
                                    "pixelTopicKeywordHighlighted-cdr",
                                    true
                                  )
                                  .attr("pixelColor", "black")
                                  .style("fill", "black");

                                nextWordId++;
                                counter--;
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                });
              });
            }

            if (feature === "SPEAKER") {
              $scope.speakerColors = d3.scaleOrdinal(
                $scope.speakerList[debateIndex],
                d3.schemeDark2
              );

              d3.selectAll(".utteranceOverview-cdr." + tab).each(function(
                _,
                i
              ) {
                let speaker = $scope.speakerOrderList[debateIndex][i];

                d3.select(this)
                  .selectAll("rect")
                  .attr("pixelColor", function() {
                    return $scope.speakerColors(speaker);
                  })
                  .style("fill", function() {
                    return $scope.speakerColors(speaker);
                  });
              });
            }

            if (feature === "NAMED ENTITIES") {
              createNamedEntityAnnotationListPixelVis(debateIndex, tab);

              d3.selectAll(".wordOverview-cdr." + tab)
                .data(namedEntitiesAnnotationList)
                .each(function(data) {
                  let category = data;

                  if (category !== "none" && category !== "removed") {
                    d3.select(this)
                      .classed("namedEntityOverview-cdr", true)
                      .classed(category, true)
                      .classed(
                        "namedEntityAnnotationOverviewHidden-cdr",
                        function() {
                          if (
                            $scope.selectedCategoriesNamedEntityLists[
                              debateIndex
                            ].length !== 0 &&
                            !$scope.selectedCategoriesNamedEntityLists[
                              debateIndex
                            ].includes(category)
                          ) {
                            return true;
                          } else {
                            return false;
                          }
                        }
                      )
                      .attr("namedEntityCategory", category)
                      .attr(
                        "pixelColor",
                        $scope.colorScaleNamedEntities[category]
                      )
                      .style("fill", function() {
                        if (
                          $scope.selectedCategoriesNamedEntityLists[debateIndex]
                            .length !== 0 &&
                          !$scope.selectedCategoriesNamedEntityLists[
                            debateIndex
                          ].includes(category)
                        ) {
                          return "lightgrey";
                        } else {
                          return $scope.colorScaleNamedEntities[category];
                        }
                      });
                  }
                });
            }
          }
        };

        let namedEntitiesAnnotationList;

        function createNamedEntityAnnotationListPixelVis(debateIndex, tab) {
          let words = [];
          // prepare data
          d3.selectAll(".wordDiv-cdr." + tab).each(function() {
            words.push(
              d3
                .select(this)
                .text()
                .toLowerCase()
            );
          });

          namedEntitiesAnnotationList = new Array(words.length);
          namedEntitiesAnnotationList = namedEntitiesAnnotationList.fill(
            "none"
          );

          if ($scope.checkedNamedEntities[debateIndex]) {
            d3.selectAll(".namedEntityAnnotation-cdr." + tab).classed(
              "namedEntityAnnotation-cdr",
              false
            );
          }

          d3.selectAll(".wordDiv-cdr." + tab)
            .data(words)
            .each(function(data, index) {
              let word = data;

              let found = false;
              let secondCheckFound = false;

              for (
                let i = 0;
                i < $scope.namedEntitiesList[debateIndex].length;
                i++
              ) {
                let obj = $scope.namedEntitiesList[debateIndex][i];
                let key = Object.keys(angular.copy(obj))[0];
                let values = Object.values(obj)[0];

                // avoid that a word gets annotated twice by same icon
                // a word at this point can contain an annotation, see while loop below
                if (
                  values.includes(word) && //&&
                  // d3.select(this).attr("namedEntityCategory") !== key
                  !d3
                    .select(this)
                    .select("text")
                    .classed("namedEntityAnnotation-cdr") &&
                  !d3.select(this).classed("namedEntityAnnotationRemoved-cdr")
                  // && !d3.select(this).classed("namedEntityAnnotationChanged-cdr")
                ) {
                  // need second check if a ngram starts with the word
                  let matchedSequence = null;
                  for (let i = 0; i < values.length; i++) {
                    let val = values[i];
                    if (
                      val.startsWith(word + " ") ||
                      val.startsWith(word + "_")
                    ) {
                      let counter = 1;
                      let splitVal;
                      if (val.match(/_/g)) {
                        splitVal = val.split("_");
                      } else if (val.match(/\s/g)) {
                        splitVal = val.split(" ");
                      }

                      for (let j = 1; j < splitVal.length; j++) {
                        let nextPart = splitVal[j];
                        if (nextPart === words[index + j]) {
                          counter++;
                        }
                      }

                      // all matched
                      if (counter === splitVal.length) {
                        secondCheckFound = true;
                        matchedSequence = val;
                        break;
                      }
                    }
                  }

                  if (matchedSequence === null) {
                    if (modifiedFlag) {
                      for (
                        let i = 0;
                        i < changedNamedEntityAnnotationList.length;
                        i++
                      ) {
                        let entity = changedNamedEntityAnnotationList[i];
                        if (
                          entity.startsWith(word + " ") ||
                          entity.startsWith(word + "_")
                        ) {
                          let counter = 1;
                          let splitEntity;
                          if (entity.match(/_/g)) {
                            splitEntity = entity.split("_");
                          } else if (entity.match(/\s/g)) {
                            splitEntity = entity.split(" ");
                          }

                          for (let j = 1; j < splitEntity.length; j++) {
                            let nextPart = splitEntity[j];
                            if (nextPart === words[index + j]) {
                              counter++;
                            }
                          }

                          // all matched
                          if (counter === splitEntity.length) {
                            secondCheckFound = true;
                            break;
                          }
                        }
                      }
                    }
                  }

                  // if ngram not found then apply annotation to the word
                  if (!secondCheckFound) {
                    // store category in list
                    namedEntitiesAnnotationList[index] = key;

                    d3.select(this)
                      .select("text")
                      .classed("namedEntityAnnotation-cdr", true);

                    found = true;
                  }
                } else if (
                  d3.select(this).classed("namedEntityAnnotationRemoved-cdr")
                ) {
                  namedEntitiesAnnotationList[index] = "removed";
                  found = true;
                }
              }

              // ngram found
              if (!found) {
                for (
                  let i = 0;
                  i < $scope.namedEntitiesList[debateIndex].length;
                  i++
                ) {
                  let obj = $scope.namedEntitiesList[debateIndex][i];
                  let key = Object.keys(angular.copy(obj))[0];
                  let values = Object.values(obj)[0];

                  // if a word in category list consist of multiple words
                  for (let j = 0; j < values.length; j++) {
                    let value = values[j];

                    // check if category-word contains current word
                    // further improvement use stem of word?
                    if (
                      value.startsWith(word + " ") ||
                      value.startsWith(word + "_")
                    ) {
                      // separate category-word into independent words
                      let split;
                      if (value.match(/\s/g)) {
                        split = value.split(" ");
                      } else if (value.match(/_/g)) {
                        split = value.split("_");
                      }

                      let matchCounter = 0;
                      let nextWord = word;

                      // match separated-word with word
                      for (let k = 0; k < split.length; k++) {
                        let part = split[k];
                        if (part === nextWord) {
                          matchCounter++;
                          // get following word
                          nextWord = words[index + k + 1];
                        }
                      }

                      if (matchCounter === split.length) {
                        let parentNode = this.parentNode;
                        d3.select(parentNode)
                          .select(".wordDiv-cdr")
                          .select("text")
                          .classed("namedEntityAnnotation-cdr", true);

                        namedEntitiesAnnotationList[index] = key;

                        let nextSibling = parentNode.nextSibling;
                        let nextIndex = index + 1;
                        while (matchCounter - 1 > 0) {
                          if (nextSibling !== null) {
                            if (nextSibling.nodeName === "#comment") {
                              // check if next element exists and skip ng-repeat comment
                              if (nextSibling.nextSibling !== null) {
                                nextSibling = nextSibling.nextSibling;
                              }
                            } else {
                              matchCounter--;

                              d3.select(nextSibling)
                                .select(".wordDiv-cdr")
                                .select("text")
                                .classed("namedEntityAnnotation-cdr", true);

                              namedEntitiesAnnotationList[nextIndex] = key;

                              nextSibling = nextSibling.nextSibling;
                              nextIndex++;
                            }
                          } else {
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              }
            });

          if (!$scope.checkedNamedEntities[debateIndex]) {
            d3.selectAll(".namedEntityAnnotation-cdr." + tab).classed(
              "namedEntityAnnotation-cdr",
              false
            );
          }
        }

        /**
         * This method opens a full screen modal window.
         * A render function for the pixel-overview is called after
         * the modal window is rendered.
         */
        $scope.openFullScreenOverview = function(tab, debateIndex) {
          $scope.showCheckboxesNECategoriesFullScreen = false;
          $scope.showCheckboxesSentimentCategoriesFullScreen = false;
          $scope.showCheckboxesPosCategoriesFullScreen = false;
          $uibModal
            .open({
              templateUrl: "views/modalWindowFullScreenCDR.html",
              controller: "modalWindowFullScreenController",
              scope: $scope,
              resolve: {
                debateIndex: debateIndex
              },
              backdrop: false,
              windowClass: "modal-full-cdr"
            })
            .rendered.then(function() {
              $scope.fullScreenActive.debateIndex = debateIndex;
              $scope.fullScreenActive.active = true;
              $scope.fullScreenActive.content = "overview";

              checkedShowAllUtterancesOverviewFullScreen = false;

              // outsourced, so that is also callable if user resizes window
              $scope.renderOverviewInFullScreenModalWindow(debateIndex);
            });
        };

        /**
         * This method is called after rendering modal window.
         * It places the pixel overview into the available modal body (the height is limited)
         * The selected feature will be shown in the pixel overview.
         * For named entities also view options are provided.
         * Each pixel show a tooltip on hover.
         * Further, each pixel is clickable and will navigate to the corresponding location
         * in the text.
         * This method will also be called if window gets resized.
         */
        $scope.checkedNamedEntityCategoriesFullScreen = [];
        $scope.checkedSentimentCategoriesFullScreen = [];
        $scope.checkedPosCategoriesFullScreen = [];

        $scope.renderOverviewInFullScreenModalWindow = function(debateIndex) {
          let sentenceId = getFirstSentenceInViewport(
            $scope.filenames[debateIndex]
          )[1];

          // set height of modal window body
          // subtract 126px -> header ~65px, footer ~61px
          let headerFooter = 126;
          d3.select("#modal-body-full-cdr").style("height", function() {
            let height = window.innerHeight - headerFooter;
            return height + "px";
          });

          // get debate
          let debate = $scope.debateList[debateIndex];
          // get feature to show in overview
          let feature = $scope.featureOverviewOfTab[debateIndex];
          // select container in modal window
          let container = d3.select("#fullScreenContainer-cdr");

          d3.select("#fullScreenOverviewInfoContainer")
            .style("display", "flex")
            .style("flex-direction", "row")
            .style("flex-wrap", "wrap")
            .style("overflow", "auto")
            .insert("text", "div")
            .classed("selectedFeatureTextFullScreen", true)
            .html("<b>SELECTED FEATURE:</b> " + feature);

          let textHeight = 16;

          let bodyPadding = 15;
          container.style("height", function() {
            // available container in body
            let height =
              window.innerHeight - headerFooter - 2 * bodyPadding - textHeight;
            return height + "px";
          });

          let viewOptionsHeight = 0;

          // reset datastructures for pos tags full screen
          if (feature === "POS") {
            viewOptionsHeight = 15;
            $scope.showCheckboxesPosCategoriesFullScreen = true;

            // clear checkboxes
            // initialize checkboxes and tracking list for full screen
            $scope.checkedPosCategoriesFullScreen = angular.copy(
              $scope.checkedPosCategoriesOfTab[debateIndex]
            );

            // clear selected sentiment categories
            // initialize list based on corresponding selection
            $scope.selectedCategoriesPosFullScreen = angular.copy(
              $scope.selectedCategoriesPosTagLists[debateIndex]
            );
          }

          // reset datastructures for sentiment-word full screen
          if (feature === "SENTIMENT WORD") {
            viewOptionsHeight = 15;
            $scope.showCheckboxesSentimentCategoriesFullScreen = true;

            // clear checkboxes
            // initialize checkboxes and tracking list for full screen
            $scope.checkedSentimentCategoriesFullScreen = angular.copy(
              $scope.checkedSentimentCategoriesOfTab[debateIndex]
            );

            // clear selected sentiment categories
            // initialize list based on corresponding selection
            $scope.selectedCategoriesSentimentFullScreen = angular.copy(
              $scope.selectedCategoriesSentimentLists[debateIndex]
            );
          }

          // reset datastructures for named entities full screen
          if (feature === "NAMED ENTITIES") {
            viewOptionsHeight = 15;
            $scope.showCheckboxesNECategoriesFullScreen = true;

            // clear checkboxes
            // initialize checkboxes and tracking list for full screen
            $scope.checkedNamedEntityCategoriesFullScreen = angular.copy(
              $scope.checkedNamedEntityCategoriesOfTab[debateIndex]
            );

            // clear selected named entity categories full screen
            // initialize list based on corresponding selection
            $scope.selectedCategoriesNamedEntityFullScreen = angular.copy(
              $scope.selectedCategoriesNamedEntityLists[debateIndex]
            );
          }

          let margin = 5;
          // set available container height for pixel overview
          let overviewContainer = container.append("div");
          overviewContainer
            .style("width", "100%")
            .style("height", function() {
              // available container height to place pixel overview
              let height =
                window.innerHeight -
                headerFooter -
                2 * bodyPadding -
                textHeight -
                margin -
                viewOptionsHeight;
              return height + "px";
            })
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("flex-wrap", "wrap")
            .style("align-content", "flex-start")
            .style("overflow", "auto")
            .style("margin-top", margin + "px")
            .style("padding-left", "5px")
            .classed("overviewContainerFullScreen", true);

          let gapVertical = 3;
          let gapHorizontal = 7;
          let pixelSize = 5.5;

          let flagFullScreen = false;
          let timeoutFullScreen;

          // render pixel overview
          for (let i = 0; i < debate.length; i++) {
            let objDiv = d3
              .select(".overviewContainerFullScreen")
              .append("div");

            objDiv
              .classed("objectOverviewFullScreen", true)
              .attr("id", "objectOverviewFullScreen" + (i + 1))
              .style("width", "fit-content")
              .style("height", "fit-content")
              .style("margin-bottom", gapVertical + "px")
              .style("margin-right", gapHorizontal + "px");

            let utterance = debate[i]["utterance" + (i + 1)];

            let utterDiv = objDiv.append("div");
            utterDiv
              .classed("utteranceOverviewFullScreen", true)
              .attr("id", "utteranceOverviewFullScreen" + (i + 1))
              .style("width", "fit-content")
              .style("height", "fit-content")
              .style("display", "flex")
              .style("flex-direction", "column");

            let sentenceCount = 1;

            for (let sentence in utterance) {
              let sentDiv = utterDiv.append("div");

              sentDiv
                .classed("sentenceOverviewFullScreen", true)
                .attr(
                  "id",
                  "utteranceOverviewFullScreen" +
                    (i + 1) +
                    " sentenceOverviewFullScreen" +
                    sentenceCount
                )
                .style("width", "fit-content")
                .style("height", pixelSize)
                .style("display", "flex")
                .style("flex-direction", "row");

              let words = angular.copy(utterance[sentence]);
              let wordCount = 1;

              for (let w in words) {
                let word = angular.copy(words[w]);
                let wordDiv = sentDiv.append("div");

                wordDiv
                  .classed("wordOverviewFullScreen", true)
                  .attr(
                    "id",
                    "utteranceOverviewFullScreen" +
                      (i + 1) +
                      " sentenceOverviewFullScreen" +
                      sentenceCount +
                      " wordOverviewFullScreen" +
                      wordCount
                  )
                  .style("width", pixelSize + "px")
                  .style("height", pixelSize + "px")
                  .attr("utteranceId", i + 1)
                  .attr("sentenceId", sentenceCount)
                  .attr("wordId", wordCount)
                  .attr("word", word)
                  .on("mouseover", function() {
                    let pixel = d3.select(this);
                    pixel.style("background", "grey");

                    timeoutFullScreen = setTimeout(function() {
                      flagFullScreen = true;
                      pixel
                        .style("transform", "scale(2)")
                        .style("z-index", "1")
                        .style("transform-origin", "center")
                        .style("border", "solid 1px black")
                        .style("background", function() {
                          if (
                            pixel.classed(
                              "namedEntityAnnotationOverviewFullScreenHidden"
                            ) ||
                            pixel.classed(
                              "sentimentAnnotationOverviewFullScreenHidden"
                            ) ||
                            pixel.classed(
                              "posAnnotationOverviewFullScreenHidden"
                            )
                          ) {
                            return "lightgrey";
                          } else {
                            return pixel.attr("pixelColor");
                          }
                        });

                      pixel
                        .attr("data-toggle", "tooltip")
                        .attr("title", function() {
                          let text = word;

                          if (
                            pixel.classed("posAnnotationOverviewFullScreen")
                          ) {
                            text +=
                              "\n" +
                              pixel.attr("posTagCategory") +
                              ":" +
                              pixel.attr("tag");
                          }

                          if (pixel.classed("namedEntityOverviewFullScreen")) {
                            text += "\n" + pixel.attr("namedEntityCategory");
                          }
                          return text;
                        });
                    }, 1000);
                  })
                  .on("mouseout", function() {
                    let pixel = d3.select(this);

                    if (flagFullScreen) {
                      flagFullScreen = false;

                      pixel
                        .style("transform", "scale(1)")
                        .style("z-index", "0")
                        .style("transform-origin", "center")
                        .style("border", "none")
                        .attr("data-toggle", null)
                        .attr("title", null);
                    } else {
                      clearTimeout(timeoutFullScreen);
                      pixel.style("background", function() {
                        if (
                          pixel.classed(
                            "namedEntityAnnotationOverviewFullScreenHidden"
                          ) ||
                          pixel.classed(
                            "sentimentAnnotationOverviewFullScreenHidden"
                          ) ||
                          pixel.classed("posAnnotationOverviewFullScreenHidden")
                        ) {
                          return "lightgrey";
                        } else {
                          return pixel.attr("pixelColor");
                        }
                      });
                    }
                  })
                  .on("dblclick", function() {
                    // build element ID and get element
                    let elementID =
                      "utterance" +
                      d3.select(this).attr("utteranceId") +
                      " sentence" +
                      d3.select(this).attr("sentenceId") +
                      " word" +
                      d3.select(this).attr("wordId") +
                      " " +
                      $scope.filenames[debateIndex];

                    if (
                      d3
                        .select(this)
                        .classed("searchWordHighlightedFullScreenOverview")
                    ) {
                      elementID += " searchWordHighlighted";
                    }

                    let element = document.getElementById(elementID);

                    // close full screen modal window
                    document
                      .getElementById("btn-closeModal-fullScreen-cdr")
                      .click();

                    // build container ID and get container
                    let containerID =
                      "text_container-cdr " + $scope.filenames[debateIndex];
                    let container = document.getElementById(containerID);

                    // highlight word in text container
                    let word = d3.select(
                      "#utterance" +
                        d3.select(this).attr("utteranceId") +
                        "\\ sentence" +
                        d3.select(this).attr("sentenceId") +
                        "\\ word" +
                        d3.select(this).attr("wordId") +
                        "\\ " +
                        $scope.filenames[debateIndex]
                    );
                    word.style("background-color", "aqua");

                    // scroll element and align it at the center of the container
                    container.scrollTop =
                      element.offsetTop -
                      container.getBoundingClientRect().height / 2;

                    // update tracker
                    textScrollListener();

                    // remove background highlighting after few seconds
                    $timeout(function() {
                      word.style("background-color", function() {
                        let style = "unset";

                        // check if word search highlighting has to be restored
                        if (word.classed("searchWordHighlighted-cdr")) {
                          style = "rgba(255,255,0,0.5)";
                        }
                        return style;
                      });
                    }, 4000);
                  });

                wordCount++;
              }
              sentenceCount++;
            }
          }

          // annotate word search
          if (feature === "DEFAULT") {
            d3.selectAll(
              ".searchWordHighlighted-cdr." + $scope.filenames[debateIndex]
            ).each(function() {
              let wordElement = d3.select(this);
              let utteranceId = wordElement.attr("utterance");
              let sentenceId = wordElement.attr("sentence");
              let wordId = wordElement.attr("word");

              d3.selectAll(
                "#utteranceOverviewFullScreen" +
                  utteranceId +
                  "\\ sentenceOverviewFullScreen" +
                  sentenceId +
                  "\\ wordOverviewFullScreen" +
                  wordId
              )
                .style("background", "yellow")
                .attr("pixelColor", "yellow")
                .classed("searchWordHighlightedFullScreenOverview", true);
            });

            d3.selectAll(
              ".wordOverviewFullScreen:not(.searchWordHighlightedFullScreenOverview)"
            )
              .style("background", "lightgrey")
              .attr("pixelColor", "lightgrey");
          }

          // annotate features
          if (feature === "POS") {
            for (let i = 0; i < debate.length; i++) {
              let utteranceTags =
                $scope.posTagLabelsList[debateIndex][i]["utterance" + (i + 1)];
              let sentenceCount = 1;
              for (let sentenceTags in utteranceTags) {
                let wordTags = angular.copy(utteranceTags[sentenceTags]);
                let wordCount = 1;
                for (let tag in wordTags) {
                  let posTag = wordTags[tag];

                  let pixel = d3.select(
                    "#utteranceOverviewFullScreen" +
                      (i + 1) +
                      "\\ " +
                      "sentenceOverviewFullScreen" +
                      sentenceCount +
                      "\\ " +
                      "wordOverviewFullScreen" +
                      wordCount
                  );

                  pixel
                    .classed("posAnnotationOverviewFullScreen", true)
                    .classed("posAnnotationOverviewFullScreen" + posTag, true)
                    .attr("tag", posTag)
                    .attr("posTagCategory", function() {
                      if (posTag !== "P") {
                        return $scope.posTagCategoryMap[posTag];
                      } else {
                        return "punctuation";
                      }
                    })
                    .attr("pixelColor", function() {
                      if ($scope.posTagSetList[debateIndex].includes(posTag)) {
                        let category = $scope.posTagCategoryMap[posTag];
                        return $scope.posTagColor(category);
                      } else {
                        // default color also for punctuation
                        return "grey";
                      }
                    })
                    .style("background", function() {
                      if (
                        $scope.selectedCategoriesPosTagLists[debateIndex]
                          .length !== 0 &&
                        !$scope.selectedCategoriesPosTagLists[
                          debateIndex
                        ].includes(posTag)
                      ) {
                        // view options active
                        pixel.classed(
                          "posAnnotationOverviewFullScreenHidden",
                          true
                        );
                        return "lightgrey";
                      } else {
                        if (
                          $scope.posTagSetList[debateIndex].includes(posTag)
                        ) {
                          let category = $scope.posTagCategoryMap[posTag];
                          return $scope.posTagColor(category);
                        } else {
                          //default color also for punctuation
                          return "grey";
                        }
                      }
                    });

                  wordCount++;
                }
                sentenceCount++;
              }
            }
          }

          if (
            feature === "SENTIMENT WORD" ||
            feature === "SENTIMENT SENTENCE" ||
            feature === "SENTIMENT UTTERANCE"
          ) {
            for (let i = 0; i < debate.length; i++) {
              let utterance =
                $scope.sentimentsList[debateIndex][i]["utterance" + (i + 1)];
              let sentenceCount = 1;
              let avgUtteranceSentiment = 0;
              for (let sentence in utterance) {
                let avgSentenceSentiment = 0;
                let words = angular.copy(utterance[sentence]);
                let wordCount = 1;
                for (let word in words) {
                  let sentiment = words[word];

                  if (feature === "SENTIMENT WORD") {
                    let pixel = d3.select(
                      "#utteranceOverviewFullScreen" +
                        (i + 1) +
                        "\\ " +
                        "sentenceOverviewFullScreen" +
                        sentenceCount +
                        "\\ " +
                        "wordOverviewFullScreen" +
                        wordCount
                    );

                    // transfer sentiment view options and set class for pixels
                    if (sentiment === -1) {
                      pixel
                        .classed("sentimentAnnotationOverviewFullScreen", true)
                        .classed("negativeSentimentOverviewFullScreen", true);

                      let temp = "negative";

                      // check view options
                      if (
                        $scope.selectedCategoriesSentimentFullScreen.length !==
                          0 &&
                        !$scope.selectedCategoriesSentimentFullScreen.includes(
                          temp
                        )
                      ) {
                        pixel.classed(
                          "sentimentAnnotationOverviewFullScreenHidden",
                          true
                        );
                      }
                    } else if (sentiment === 1) {
                      pixel
                        .classed("sentimentAnnotationOverviewFullScreen", true)
                        .classed("positiveSentimentOverviewFullScreen", true);

                      let temp = "positive";

                      // check view options
                      if (
                        $scope.selectedCategoriesSentimentFullScreen.length !==
                          0 &&
                        !$scope.selectedCategoriesSentimentFullScreen.includes(
                          temp
                        )
                      ) {
                        pixel.classed(
                          "sentimentAnnotationOverviewFullScreenHidden",
                          true
                        );
                      }
                    }

                    // assign color
                    pixel
                      .attr("pixelColor", function() {
                        // default color for neutral
                        let color = "lightgrey";

                        if (sentiment === -1) {
                          color = "red";
                        } else if (sentiment === 1) {
                          color = "green";
                        }
                        return color;
                      })
                      .style("background", function() {
                        // default color for neutral
                        let color = "lightgrey";

                        if (
                          d3
                            .select(this)
                            .classed(
                              "sentimentAnnotationOverviewFullScreenHidden"
                            )
                        ) {
                          return color;
                        } else {
                          // assign corresponding color
                          if (sentiment === -1) {
                            color = "red";
                          } else if (sentiment === 1) {
                            color = "green";
                          }
                          return color;
                        }
                      });
                  } else if (
                    feature === "SENTIMENT SENTENCE" ||
                    feature === "SENTIMENT UTTERANCE"
                  ) {
                    avgSentenceSentiment += sentiment;
                  }
                  wordCount++;
                }

                if (feature === "SENTIMENT SENTENCE") {
                  avgSentenceSentiment = avgSentenceSentiment / (wordCount - 1);

                  d3.select(
                    "#utteranceOverviewFullScreen" +
                      (i + 1) +
                      "\\ sentenceOverviewFullScreen" +
                      sentenceCount
                  )
                    .selectAll(".wordOverviewFullScreen")
                    .attr("pixelColor", function() {
                      return $scope.sentimentColor(avgSentenceSentiment);
                    })
                    .style("background", function() {
                      return $scope.sentimentColor(avgSentenceSentiment);
                    });
                }

                if (feature === "SENTIMENT UTTERANCE") {
                  avgUtteranceSentiment +=
                    avgSentenceSentiment / (wordCount - 1);
                }
                sentenceCount++;
              }

              if (feature === "SENTIMENT UTTERANCE") {
                avgUtteranceSentiment +=
                  avgUtteranceSentiment / (sentenceCount - 1);

                d3.select("#utteranceOverviewFullScreen" + (i + 1))
                  .selectAll(".sentenceOverviewFullScreen")
                  .each(function() {
                    d3.select(this)
                      .selectAll(".wordOverviewFullScreen")
                      .attr("pixelColor", function() {
                        return $scope.sentimentColor(avgUtteranceSentiment);
                      })
                      .style("background", function() {
                        return $scope.sentimentColor(avgUtteranceSentiment);
                      });
                  });
              }
            }
          }

          if (feature === "TOPICS") {
            // annotate topic number and shift utterance to right

            d3.selectAll(".objectOverviewFullScreen").each(function(_, i) {
              // annotate topic number
              let topicNumber = $scope.convertIntToRoman(
                $scope.topicsList[debateIndex][0]["utterance" + (i + 1)],
                1
              );

              d3.select(this)
                .classed("topic" + topicNumber, true)
                .style("display", "flex")
                .style("flex-direction", "row")
                .style("margin-bottom", "2px")
                .insert("text", "div")
                .classed("topicNumberOverviewFullScreen", true)
                .attr("topicNumber", topicNumber)
                .style("cursor", "pointer")
                .text(topicNumber)
                .style("font-weight", "bold")
                .style("font-size", "10px")
                .style("width", "14px")
                .style("margin-right", "5px")
                .style("align-self", "center");

              d3.select(this)
                .select(".utteranceOverviewFullScreen")
                .style("align-self", "center");
            });

            // if one topic number is clicked in the overview, reduce opacity for the rest
            let click = 0;
            d3.selectAll(".topicNumberOverviewFullScreen").on(
              "click",
              function() {
                if (
                  $scope.selectedSpeakerLists[debateIndex].length === 0 &&
                  $scope.selectedTopicsLists[debateIndex].length === 0
                ) {
                  if (click === 0) {
                    d3.selectAll(
                      ".objectOverviewFullScreen:not(.topic" +
                        d3.select(this).attr("topicNumber") +
                        ")"
                    )
                      .style("opacity", "0.15")
                      .style("pointer-events", "none");
                    click++;
                  } else {
                    d3.selectAll(
                      ".objectOverviewFullScreen:not(.topic" +
                        d3.select(this).attr("topicNumber") +
                        ")"
                    )
                      .style("opacity", "1")
                      .style("pointer-events", "auto");
                    click--;
                  }
                }
              }
            );

            // highlight keywords
            d3.selectAll(".utteranceOverviewFullScreen").each(function(
              _,
              indexUtterance
            ) {
              let utteranceId = indexUtterance + 1;
              let topic =
                $scope.topicsList[debateIndex][0]["utterance" + utteranceId];
              let descriptors =
                $scope.topicDescriptorsList[debateIndex][0][topic];

              let sentences = d3
                .select(this)
                .selectAll(".sentenceOverviewFullScreen");

              sentences.each(function(_, indexSentence) {
                let sentenceId = indexSentence + 1;

                let words = d3
                  .select(this)
                  .selectAll(".wordOverviewFullScreen");

                words.each(function(_, indexWord) {
                  let wordId = indexWord + 1;
                  let word = d3
                    .select(this)
                    .attr("word")
                    .toLowerCase();

                  // first assign default color than update
                  d3.select(this)
                    .attr("pixelColor", "lightgrey")
                    .style("background", "lightgrey");

                  let found = false;

                  // avoid punctuation, words starting with an apostrophe and stop-words

                  if (
                    !word.match(/^[.,!?;:']/) &&
                    !$scope.stopWords.includes(word)
                  ) {
                    let stemmedWord = stemmer(word);
                    // check if word is in list of descriptors
                    // check also stemmed version of word

                    for (let i = 0; i < descriptors.length; i++) {
                      let descriptor = descriptors[i].toLowerCase();

                      if (
                        descriptor === word ||
                        (stemmer(descriptor) === stemmedWord &&
                          !d3
                            .select(this)
                            .classed("pixelTopicKeywordHighlightedFullScreen"))
                      ) {
                        d3.select(this)
                          .classed(
                            "pixelTopicKeywordHighlightedFullScreen",
                            true
                          )
                          .attr("pixelColor", "black")
                          .style("background", "black");

                        found = true;
                      }
                    }

                    // check if word is part of an keyword consisting of multiple words
                    if (!found) {
                      for (let i = 0; i < descriptors.length; i++) {
                        let descriptor = descriptors[i].toLowerCase();

                        // avoid matching keyword like xyz_
                        if (
                          descriptor.startsWith(word + "_") ||
                          (descriptor.startsWith(stemmedWord + "_") &&
                            !descriptor.endsWith(word + "_")) ||
                          descriptor.startsWith(stemmedWord + "_")
                        ) {
                          // separate descriptor into independent words
                          let temp = descriptor.split("_");

                          let counter = 0;
                          let nextWord = word;

                          // match separated-keyword with word
                          for (let k = 0; k < temp.length; k++) {
                            let part = temp[k];
                            if (
                              part === nextWord ||
                              stemmer(part) === stemmer(nextWord)
                            ) {
                              counter++;
                              // get following word
                              if (
                                d3.select(
                                  "#utteranceOverviewFullScreen" +
                                    utteranceId +
                                    "\\ sentenceOverviewFullScreen" +
                                    sentenceId +
                                    "\\ wordOverviewFullScreen" +
                                    (wordId + 1)
                                )[0][0] !== null
                              ) {
                                nextWord = d3
                                  .select(
                                    "#utteranceOverviewFullScreen" +
                                      utteranceId +
                                      "\\ sentenceOverviewFullScreen" +
                                      sentenceId +
                                      "\\ wordOverviewFullScreen" +
                                      (wordId + 1)
                                  )
                                  .attr("word")
                                  .toLowerCase();
                              }
                            }
                          }

                          if (counter === temp.length) {
                            let nextWordId = wordId;
                            while (counter > 0) {
                              let element = d3.select(
                                "#utteranceOverviewFullScreen" +
                                  utteranceId +
                                  "\\ sentenceOverviewFullScreen" +
                                  sentenceId +
                                  "\\ wordOverviewFullScreen" +
                                  nextWordId
                              );

                              element
                                .classed(
                                  "pixelTopicKeywordHighlightedFullScreen",
                                  true
                                )
                                .attr("pixelColor", "black")
                                .style("background", "black");

                              nextWordId++;
                              counter--;
                            }
                          }
                        }
                      }
                    }
                  }
                });
              });
            });
          }

          if (feature === "SPEAKER") {
            $scope.speakerColors = d3.scaleOrdinal(
              $scope.speakerList[debateIndex],
              d3.schemeDark2
            );

            d3.selectAll(".utteranceOverviewFullScreen").each(function(_, i) {
              let speaker = $scope.speakerOrderList[debateIndex][i];

              d3.select(this)
                .selectAll(".sentenceOverviewFullScreen")
                .each(function() {
                  d3.select(this)
                    .selectAll(".wordOverviewFullScreen")
                    .each(function() {
                      d3.select(this)
                        .attr("pixelColor", function() {
                          return $scope.speakerColors(speaker);
                        })
                        .style("background", function() {
                          return $scope.speakerColors(speaker);
                        });
                    });
                });
            });
          }

          if (feature === "NAMED ENTITIES") {
            d3.selectAll(".wordOverviewFullScreen")
              .data(namedEntitiesAnnotationList)
              .each(function(data) {
                // first assign default color then update
                d3.select(this)
                  .attr("pixelColor", "lightgrey")
                  .style("background", "lightgrey");

                let category = data;
                if (category !== "none" && category !== "remove") {
                  d3.select(this)
                    .classed("namedEntityOverviewFullScreen", true)
                    .classed(category, true)
                    .attr("namedEntityCategory", category)
                    .attr(
                      "pixelColor",
                      $scope.colorScaleNamedEntities[category]
                    )
                    .style("background", function() {
                      if (
                        $scope.selectedCategoriesNamedEntityFullScreen
                          .length === 0
                      ) {
                        return $scope.colorScaleNamedEntities[category];
                      } else {
                        if (
                          $scope.selectedCategoriesNamedEntityFullScreen.includes(
                            category
                          )
                        ) {
                          return $scope.colorScaleNamedEntities[category];
                        } else {
                          return "lightgrey";
                        }
                      }
                    });
                }
              });
          }

          // hide all utterances in fullscreen overview which are filtered out
          // by selecting speaker and/or topics
          // provide a checkbox to show the other utterances
          // append info which speakers and topics are selected
          if (
            $scope.selectedSpeakerLists[debateIndex].length !== 0 ||
            $scope.selectedTopicsLists[debateIndex].length !== 0
          ) {
            d3.selectAll(
              ".overviewFiltered-cdr." + $scope.filenames[debateIndex]
            ).each(function() {
              let objectId = d3.select(this).attr("objectId");

              d3.select("#objectOverviewFullScreen" + objectId)
                .style("display", "none")
                .classed("objectOverviewFullScreenFiltered", true);
            });

            if ($scope.selectedSpeakerLists[debateIndex].length !== 0) {
              let filteredBySpeaker = "";

              for (
                let i = 0;
                i < $scope.selectedSpeakerLists[debateIndex].length;
                i++
              ) {
                if (i < $scope.selectedSpeakerLists[debateIndex].length - 1) {
                  filteredBySpeaker +=
                    $scope.selectedSpeakerLists[debateIndex][i];
                  filteredBySpeaker += ", ";
                } else {
                  filteredBySpeaker +=
                    $scope.selectedSpeakerLists[debateIndex][i];
                }
              }

              d3.select("#fullScreenOverviewInfoContainer")
                .insert("text", "div")
                .style("margin-left", "15px")
                .html("<b>FILTERED BY SPEAKER:</b> " + filteredBySpeaker);
            }

            if ($scope.selectedTopicsLists[debateIndex].length !== 0) {
              let filteredByTopic = "";

              for (
                let i = 0;
                i < $scope.selectedTopicsLists[debateIndex].length;
                i++
              ) {
                if (i < $scope.selectedTopicsLists[debateIndex].length - 1) {
                  filteredByTopic += $scope.convertIntToRoman(
                    $scope.selectedTopicsLists[debateIndex][i],
                    1
                  );
                  filteredByTopic += ", ";
                } else {
                  filteredByTopic += $scope.convertIntToRoman(
                    $scope.selectedTopicsLists[debateIndex][i],
                    1
                  );
                }
              }

              d3.select("#fullScreenOverviewInfoContainer")
                .insert("text", "div")
                .style("margin-left", "15px")
                .html("<b>FILTERED BY TOPIC:</b> " + filteredByTopic);
            }

            // show checkbox to show all utterances in overview
            d3.select("#checkboxShowAllUtterancesFullScreenContainer").style(
              "display",
              "flex"
            );

            // reduce opacity and remove pointer events for filtered ones
            d3.selectAll(".objectOverviewFullScreenFiltered")
              .style("opacity", "0.25")
              .style("pointer-events", "none");

            // when window gets resized, the modal content will be rendered new
            // so check if checkbox was checked to display hidden ones as well
            if (checkedShowAllUtterancesOverviewFullScreen) {
              $scope.showAllUtterancesOverviewFullScreen(
                checkedShowAllUtterancesOverviewFullScreen
              );
            }
          }

          // keep focus of visible sentences in the full screen overview
          let pixelElement = d3
            .select("#" + sentenceId.replace(/ /g, "\\ "))
            .node();

          let overviewFullScreen = d3
            .select(".overviewContainerFullScreen")
            .node();

          let shift = overviewFullScreen.getBoundingClientRect().width / 2;

          overviewFullScreen.scrollLeft = pixelElement.offsetLeft - shift;

          // highlight parent element (utterance) for few seconds
          let utteranceId = sentenceId.split(" ")[0];

          d3.select("#" + utteranceId).style("border", function() {
            if (feature !== "POS") {
              return "2px solid red";
            } else {
              return "2px solid black";
            }
          });
          setTimeout(function() {
            d3.select("#" + utteranceId.split(" ")[0]).style("border", "none");
          }, 2000);
        };

        /**
         * This method displays/hides the utterances in the
         * fullscreen overview which are filtered out by the user
         * e.g. topics and/or speaker, before opened full screen mode,
         * based on his applied filters on the text/overview
         */
        let checkedShowAllUtterancesOverviewFullScreen;
        $scope.showAllUtterancesOverviewFullScreen = function(checked) {
          if (checked) {
            d3.selectAll(".objectOverviewFullScreenFiltered").style(
              "display",
              "flex"
            );
          } else {
            d3.selectAll(".objectOverviewFullScreenFiltered").style(
              "display",
              "none"
            );
          }

          checkedShowAllUtterancesOverviewFullScreen = checked;
        };

        // create list which stores the selected categories from the view options of full-screen modal window
        $scope.selectedCategoriesNamedEntityFullScreen = [];

        /**
         * This method manages a list with selected named entity categories
         * from the full-screen modal window in which the pixel-overview is placed.
         * Further, it hides and shows the user selected categories in the
         * full-screen pixel-overview.
         */
        $scope.showSelectedNamedEntityCategoriesFullScreen = function(
          category,
          checked
        ) {
          if (checked) {
            // store element
            $scope.selectedCategoriesNamedEntityFullScreen.push(category);

            if ($scope.selectedCategoriesNamedEntityFullScreen.length === 1) {
              // hide rest
              d3.selectAll(
                ".namedEntityOverviewFullScreen:not(." + category + ")"
              )
                .classed("namedEntityAnnotationOverviewFullScreenHidden", true)
                .style("background", "lightgrey");
            } else {
              // show again
              d3.selectAll(".namedEntityOverviewFullScreen." + category).each(
                function() {
                  d3.select(this)
                    .style("background", d3.select(this).attr("pixelColor"))
                    .classed(
                      "namedEntityAnnotationOverviewFullScreenHidden",
                      false
                    );
                }
              );
            }
          } else {
            // remove the element
            $scope.selectedCategoriesNamedEntityFullScreen.splice(
              $scope.selectedCategoriesNamedEntityFullScreen.indexOf(category),
              1
            );

            if ($scope.selectedCategoriesNamedEntityFullScreen.length === 0) {
              d3.selectAll(
                ".namedEntityOverviewFullScreen:not(." + category + ")"
              ).each(function() {
                d3.select(this)
                  .style("background", d3.select(this).attr("pixelColor"))
                  .classed(
                    "namedEntityAnnotationOverviewFullScreenHidden",
                    false
                  );
              });
            } else {
              // hide element
              d3.selectAll(".namedEntityOverviewFullScreen." + category)
                .style("background", "lightgrey")
                .classed("namedEntityAnnotationOverviewFullScreenHidden", true);
            }
          }
        };

        // create list which stores the selected categories from the view options of full-screen modal window
        $scope.selectedCategoriesSentimentFullScreen = [];

        /**
         * This method manages a list with selected sentiment categories
         * from the full-screen modal window in which the pixel-overview is placed.
         * Further, it hides and shows the user selected categories in the
         * full-screen pixel-overview.
         */
        $scope.showSelectedSentimentCategoriesFullScreen = function(
          sentiment,
          checked
        ) {
          if (checked) {
            // push element into list
            $scope.selectedCategoriesSentimentFullScreen.push(sentiment);

            if ($scope.selectedCategoriesSentimentFullScreen.length === 1) {
              // hide rest

              if (sentiment === "positive") {
                d3.selectAll(".negativeSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", true)
                  .style("background", "lightgrey");
              } else {
                d3.selectAll(".positiveSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", true)
                  .style("background", "lightgrey");
              }
            } else {
              // show again

              if (sentiment === "positive") {
                d3.selectAll(".positiveSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", false)
                  .style("background", "green");
              } else {
                d3.selectAll(".negativeSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", false)
                  .style("background", "red");
              }
            }
          } else {
            // remove the element
            $scope.selectedCategoriesSentimentFullScreen.splice(
              $scope.selectedCategoriesSentimentFullScreen.indexOf(sentiment),
              1
            );

            if ($scope.selectedCategoriesSentimentFullScreen.length === 0) {
              // show
              if (sentiment === "positive") {
                d3.selectAll(".negativeSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", false)
                  .style("background", "red");
              } else {
                d3.selectAll(".positiveSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", false)
                  .style("background", "green");
              }
            } else {
              // hide element
              if (sentiment === "positive") {
                d3.selectAll(".positiveSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", true)
                  .style("background", "lightgrey");
              } else {
                d3.selectAll(".negativeSentimentOverviewFullScreen")
                  .classed("sentimentAnnotationOverviewFullScreenHidden", true)
                  .style("background", "lightgrey");
              }
            }
          }
        };

        // create list which stores the selected categories from the view options of full-screen modal window
        $scope.selectedCategoriesPosFullScreen = [];

        /**
         * This method manages a list with selected pos categories
         * from the full-screen modal window in which the pixel-overview is placed.
         * Further, it hides and shows the user selected categories in the
         * full-screen pixel-overview.
         */
        $scope.showSelectedPosCategoriesFullScreen = function(posTag, checked) {
          if (checked) {
            // store element
            $scope.selectedCategoriesPosFullScreen.push(posTag);

            if ($scope.selectedCategoriesPosFullScreen.length === 1) {
              // hide rest
              d3.selectAll(
                ".posAnnotationOverviewFullScreen:not(.posAnnotationOverviewFullScreen" +
                  posTag +
                  ")"
              )
                .classed("posAnnotationOverviewFullScreenHidden", true)
                .style("background", "lightgrey");
            } else {
              // show again
              d3.selectAll(
                ".posAnnotationOverviewFullScreen.posAnnotationOverviewFullScreen" +
                  posTag
              ).each(function() {
                d3.select(this)
                  .style("background", d3.select(this).attr("pixelColor"))
                  .classed("posAnnotationOverviewFullScreenHidden", false);
              });
            }
          } else {
            // remove the element
            $scope.selectedCategoriesPosFullScreen.splice(
              $scope.selectedCategoriesPosFullScreen.indexOf(posTag),
              1
            );

            if ($scope.selectedCategoriesPosFullScreen.length === 0) {
              // show all
              d3.selectAll(
                ".posAnnotationOverviewFullScreen:not(.posAnnotationOverviewFullScreen" +
                  posTag +
                  ")"
              ).each(function() {
                d3.select(this)
                  .style("background", d3.select(this).attr("pixelColor"))
                  .classed("posAnnotationOverviewFullScreenHidden", false);
              });
            } else {
              // hide element
              d3.selectAll(
                ".posAnnotationOverviewFullScreen.posAnnotationOverviewFullScreen" +
                  posTag
              )
                .style("background", "lightgrey")
                .classed("posAnnotationOverviewFullScreenHidden", true);
            }
          }
        };

        $scope.elementsInViewOfTab = [];
        for (let i = 0; i < $scope.filenames.length; i++) {
          $scope.elementsInViewOfTab[i] = [];
        }

        let scrollPos;
        let viewport;
        let viewportRect;
        let viewportTop;
        let viewportHeight;
        let overviewContainerCenter;

        /**
         * This method receives an event, which is triggered after a tab-click or
         * window-resize. To place the tracker with correct height and position,
         * the container dimensions of text/overview are needed,
         * but they only available after the tab content is rendered.
         */

        $scope.$on("tabClicked", function(event, args) {
          let tab = args.tab;
          viewport = d3.select("#text_container-cdr\\ " + tab);
          viewportRect = viewport.node().getBoundingClientRect();
          viewportTop = viewportRect.top;
          overviewContainerCenter = viewportTop + viewportRect.height / 2;

          // initialize tracker
          textScrollListener();

          // track scrolling and update tracker
          // Initial state
          scrollPos = viewportTop;

          // update positions after user scroll the entire window,
          // so that tracker always on correct position in the overview.
          window.addEventListener("scroll", function() {
            scrollPos = scrollPos - window.scrollY;
          });

          document
            .getElementById("text_container-cdr " + tab)
            .addEventListener("scroll", textScrollListener, false);
        });

        function textScrollListener() {
          viewport = d3.select("#text_container-cdr\\ " + $scope.activeTab);
          viewportRect = viewport.node().getBoundingClientRect();
          viewportTop = viewportRect.top;
          viewportHeight = viewportRect.height;
          // need to be updated - necessary when window get resized
          overviewContainerCenter = viewportTop + viewportHeight / 2;

          initializeTracker($scope.activeTab, viewportRect);

          let contentRect = d3
            .select(".content." + $scope.activeTab)
            .node()
            .getBoundingClientRect();

          let shift = Math.abs(contentRect.top - viewportTop);

          let contentTop = contentRect.top - shift;

          let trackerTop = d3
            .select(".tracker-cdr." + $scope.activeTab)
            .node()
            .getBoundingClientRect().top;
          let trackerBottom = d3
            .select(".tracker-cdr." + $scope.activeTab)
            .node()
            .getBoundingClientRect().bottom;

          let trackerCenter =
            trackerTop + Math.abs(trackerTop - trackerBottom) / 2;

          // detects new state and compares it with the new one
          if (contentTop < scrollPos) {
            // scroll down

            if (trackerCenter <= overviewContainerCenter) {
              // move tracker until center is reached
              initializeTracker($scope.activeTab, viewportRect);
            } else if (
              d3.select("#overview_container-cdr\\ " + $scope.activeTab).node()
                .scrollHeight -
                d3
                  .select("#overview_container-cdr\\ " + $scope.activeTab)
                  .node().scrollTop >
              viewportHeight
            ) {
              // now scroll pixel-overview to center of container until we reach scroll end
              scrollPixelOverviewUpDownAndRedrawTracker(
                $scope.activeTab,
                viewportRect,
                overviewContainerCenter,
                "down"
              );
            } else {
              // if end of pixel overview reached - move tracker down
              initializeTracker($scope.activeTab, viewportRect);
            }
          } else {
            // scroll up
            if (trackerCenter >= overviewContainerCenter) {
              // move tracker up until center is reached
              initializeTracker($scope.activeTab, viewportRect);
            } else if (
              d3.select("#overview_container-cdr\\ " + $scope.activeTab).node()
                .scrollTop > 0
            ) {
              // now scroll pixel-overview to center of container until we reach scroll start
              scrollPixelOverviewUpDownAndRedrawTracker(
                $scope.activeTab,
                viewportRect,
                overviewContainerCenter,
                "up"
              );
            } else {
              // if top of pixel overview reached - move tracker up
              initializeTracker($scope.activeTab, viewportRect);
            }
          }

          // saves the new position for iteration.
          scrollPos = contentTop;
        }
      },
      function(reason) {
        alert("Failed: " + reason);
      }
    )
    .catch(function(response) {
      console.log(response.statusText);
    });

  /**
   * This function returns the first sentence which is located in the viewport.
   * Further, it stores also the id for the corresponding pixel in the full screen overview.
   * It is necessary to bring the sentence back into the viewport,
   * since annotating features e.g. pos-tags can increase text-height and visible sentences
   * can move out of the container.
   */

  function getFirstSentenceInViewport(tab) {
    let viewport = d3.select("#text_container-cdr\\ " + tab);
    let viewportRect = viewport.node().getBoundingClientRect();

    let idForPixelOverviewFullScreen;
    let idForGlyphMatrixFullScreen;
    let sentence;
    let flag = true;

    // check which elements in the viewport
    d3.selectAll(".sentence-cdr." + tab + ":not(.utteranceFiltered-cdr)").each(
      function() {
        if (flag) {
          let itIs = false;
          const elementRect = this.getBoundingClientRect();

          if (
            elementRect.top >= viewportRect.top &&
            elementRect.bottom <= viewportRect.bottom
          ) {
            itIs = true;
          }

          if (itIs) {
            sentence = this;
            let utteranceId = d3.select(this).attr("utterance");
            idForPixelOverviewFullScreen =
              "utteranceOverviewFullScreen" +
              utteranceId +
              " sentenceOverviewFullScreen" +
              d3.select(this).attr("sentence");
            idForGlyphMatrixFullScreen = "glyphFullScreen" + utteranceId;
            flag = false;
          }
        }
      }
    );

    return [sentence, idForPixelOverviewFullScreen, idForGlyphMatrixFullScreen];
  }

  /**
   * This method scrolls the pixel-overview up or down and redraws the tracker over
   * the corresponding pixel which are visible as sentences in the viewport,
   * until scrollTop or scrollBottom of pixel-overview is reached.
   * Pixel and tracker are centered in the overview container.
   */
  function scrollPixelOverviewUpDownAndRedrawTracker(
    tab,
    viewportRect,
    overviewContainerCenter,
    direction
  ) {
    if (d3.select(".tracker-cdr." + tab)[0][0] !== null) {
      d3.select(".tracker-cdr." + tab).remove();
    }

    $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)] = [];

    // check which elements in the viewport
    d3.selectAll(".sentence-cdr." + tab + ":not(.utteranceFiltered-cdr)").each(
      function() {
        let itIs = isInViewport(this, viewportRect);

        if (itIs) {
          // store
          $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)].push(this);
        }
      }
    );

    let first = $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)][0];
    let last =
      $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)][
        $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)].length - 1
      ];

    // keep tracker at position; only increase in size
    // further check if filters are applied to take the updated value
    let yStart;
    let yEnd;
    if (
      $scope.selectedSpeakerLists[$scope.filenames.indexOf(tab)].length === 0 &&
      $scope.selectedTopicsLists[$scope.filenames.indexOf(tab)].length === 0
    ) {
      yStart = "yStartOrigin";
      yEnd = "yEndOrigin";
    } else {
      yStart = "yStart";
      yEnd = "yEnd";
    }

    let yFirstSentencePixelStart = d3
      .select(
        "#utteranceOverview" +
          d3.select(first).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(first).attr("sentence") +
          "\\ " +
          tab
      )
      .attr(yStart);
    let yLastSentencePixelEnd = d3
      .select(
        "#utteranceOverview" +
          d3.select(last).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(last).attr("sentence") +
          "\\ " +
          tab
      )
      .attr(yEnd);

    // needed for scroll content
    // calc distance between center of overview and sentence
    let firstSentenceTop = d3
      .select(
        "#utteranceOverview" +
          d3.select(first).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(first).attr("sentence") +
          "\\ " +
          tab
      )
      .node()
      .getBoundingClientRect().top;

    let lastSentenceBottom = d3
      .select(
        "#utteranceOverview" +
          d3.select(last).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(last).attr("sentence") +
          "\\ " +
          tab
      )
      .node()
      .getBoundingClientRect().bottom;

    let center =
      firstSentenceTop + Math.abs(firstSentenceTop - lastSentenceBottom) / 2;

    let distance = Math.abs(center - overviewContainerCenter);

    // scroll content for calculated distance
    if (direction === "down") {
      d3
        .select("#overview_container-cdr\\ " + tab)
        .node().scrollTop += distance;
    } else {
      d3
        .select("#overview_container-cdr\\ " + tab)
        .node().scrollTop -= distance;
    }

    // redraw tracker
    d3.select("#overviewSvg-cdr\\ " + tab)
      .insert("rect", "g")
      //.append("rect")
      .classed("tracker-cdr", true)
      .classed(tab, true)
      .attr("x", "0px")
      .attr("y", yFirstSentencePixelStart + "px")
      .style("width", "100%")
      .style("height", function() {
        return (
          Math.abs(yFirstSentencePixelStart - yLastSentencePixelEnd) + "px"
        );
      })
      .style("fill", "rgba(211,211,211,0.5)");
  }

  /**
   * This method is initializing the tracker in the overview.
   * It checks which sentences are visible in the viewport
   * and draws a rectangle over the corresponding pixel in the overview.
   */
  function initializeTracker(tab, viewportRect) {
    $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)] = [];

    if (d3.select(".tracker-cdr." + tab)[0][0] !== null) {
      d3.select(".tracker-cdr." + tab).remove();
    }

    // check which elements in the viewport
    d3.selectAll(".sentence-cdr." + tab + ":not(.utteranceFiltered-cdr)").each(
      function() {
        let itIs = isInViewport(this, viewportRect);

        if (itIs) {
          // store
          $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)].push(this);
        }
      }
    );

    let first = $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)][0];
    let last =
      $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)][
        $scope.elementsInViewOfTab[$scope.filenames.indexOf(tab)].length - 1
      ];

    // build id's of "sentence"-overview-pixels to draw tracker over it
    // further check if filters are applied to take the updated value
    let yStart;
    let yEnd;
    if (
      $scope.selectedSpeakerLists[$scope.filenames.indexOf(tab)].length === 0 &&
      $scope.selectedTopicsLists[$scope.filenames.indexOf(tab)].length === 0
    ) {
      yStart = "yStartOrigin";
      yEnd = "yEndOrigin";
    } else {
      yStart = "yStart";
      yEnd = "yEnd";
    }

    let yFirstSentencePixelStart = d3
      .select(
        "#utteranceOverview" +
          d3.select(first).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(first).attr("sentence") +
          "\\ " +
          tab
      )
      .attr(yStart);
    let yLastSentencePixelEnd = d3
      .select(
        "#utteranceOverview" +
          d3.select(last).attr("utterance") +
          "\\ sentenceOverview" +
          d3.select(last).attr("sentence") +
          "\\ " +
          tab
      )
      .attr(yEnd);

    d3.select("#overviewSvg-cdr\\ " + tab)
      .insert("rect", "g")
      //.append("rect")
      .classed("tracker-cdr", true)
      .classed(tab, true)
      .attr("x", "0px")
      .attr("y", yFirstSentencePixelStart + "px")
      .style("width", "100%")
      .style("height", function() {
        return (
          Math.abs(yFirstSentencePixelStart - yLastSentencePixelEnd) + "px"
        );
      })
      .style("fill", "rgba(211,211,211,0.5)");
  }

  /**
   * This method checks if a given element is visible in the viewport
   */
  function isInViewport(element, viewportRect) {
    const elementRect = element.getBoundingClientRect();
    return (
      elementRect.bottom >= viewportRect.top &&
      elementRect.bottom <= viewportRect.bottom
    );
  }

  /**
   * This function defines the layout while resizing window.
   * Further, it renders the full screen modal window content,
   * when body dimension of modal window changes.
   * Also resets the text and overview to top and initialize the tracker.
   */
  function setLayout() {
    let windowHeight = $(window).height();

    $scope.$apply(function() {
      $scope.layout = {
        height: windowHeight - 100 + "px"
      };

      $scope.layoutTextContainer = {
        height: windowHeight - 170 + "px"
      };

      $scope.layoutOverviewContainer = {
        height: windowHeight - 170 + "px"
      };

      $scope.layoutToolContainer = {
        height: windowHeight - 170 + "px"
      };
    });

    // if user resizes the window - the body height of modal window needs to be updated
    // and content has to be new rendered
    if (
      $scope.fullScreenActive.active &&
      $scope.fullScreenActive.content === "glyph"
    ) {
      d3.select("#fullScreenContainer-cdr")
        .selectAll("*")
        .remove();

      d3.select("#fullScreenOverviewInfoContainer")
        .selectAll("text")
        .remove();

      d3.select("#checkboxShowAllGlyphsFullScreenContainer").style(
        "display",
        "none"
      );

      $scope.renderGlyphsInFullScreenModalWindow(
        $scope.fullScreenActive.debateIndex
      );
    }

    if (
      $scope.fullScreenActive.active &&
      $scope.fullScreenActive.content === "overview"
    ) {
      d3.select(".overviewContainerFullScreen").remove();

      d3.select("#fullScreenOverviewInfoContainer")
        .selectAll("text")
        .remove();

      d3.select("#checkboxShowAllUtterancesFullScreenContainer").style(
        "display",
        "none"
      );

      $scope.renderOverviewInFullScreenModalWindow(
        $scope.fullScreenActive.debateIndex
      );
    }

    setTimeout(function() {
      $rootScope.$broadcast("tabClicked", { tab: $scope.activeTab });
    }, 1000);
  }
});

/**
 * A directive to place the structured debate into html page
 * for punctuations, set class attribute to punct
 * for words with apostrophe like I'm , set class attribute to apostrophe
 * some words which I assign to the class attribute have built-in styles, therefore I set class attribute to word_TERM
 */
app.directive("content", function() {
  return {
    scope: {
      debate: "=",
      filename: "="
    },
    template:
      '<div class="fitContent object-cdr {{filename}}" id="object{{$index+1}} {{filename}}" ng-repeat="object in debate"><div class="fitContent utteranceGlyphTopicContainer-cdr {{filename}}" id ="utteranceGlyphTopicContainer{{$index+1}} {{filename}}"><div class="fitContent utterance-cdr {{filename}}" id="utterance{{$parent.$index+1}} {{filename}}" ng-repeat="utterance in object"><div class="fitContent sentence-cdr {{filename}}" id="utterance{{$parent.$parent.$index+1}} sentence{{$index+1}} {{filename}}" utterance="{{$parent.$parent.$index+1}}" sentence="{{$index+1}}" ng-repeat="sentence in utterance"><div class="wordContainer-cdr {{filename}}" id="utterance{{$parent.$parent.$parent.$index+1}} sentence{{$parent.$index+1}} wordContainer{{$index+1}} {{filename}}" ng-repeat="word in sentence"><div class="wordDiv-cdr {{filename}}"><span id="forTopicKeywordHighlighting utterance{{$parent.$parent.$parent.$index+1}} sentence{{$parent.$index+1}} word{{$index+1}} {{filename}}"><text utterance="{{$parent.$parent.$parent.$index+1}}" sentence="{{$parent.$index+1}}" word="{{$index+1}}" id="utterance{{$parent.$parent.$parent.$index+1}} sentence{{$parent.$index+1}} word{{$index+1}} {{filename}}" class="word-cdr {{setClassForWord(word)}} {{filename}}" previous="none" next="false" value="{{setValueForWord(word)}}" >{{word}}</text></span></div></div></div></div></div></div></div></div>',
    link: function(scope) {
      scope.setClassForWord = function(word) {
        if (word.match(/^[.,!?;:]/)) {
          return "punct";
        } else if (word.match(/[']/)) {
          return "apostrophe";
        } else {
          return "word_" + word.toLowerCase();
        }
      };

      scope.setValueForWord = function(word) {
        if (word.match(/^[.,!?;:]/)) {
          return "punct";
        } else {
          return word.toLowerCase();
        }
      };
    }
  };
});

/**
 * A directive to place the template for the pixel overview.
 * Assign a class and an attribute for speaker and topics - needed for filtering.
 * Further, call method for aligning the pixels and default initialization (default-color, hover, tooltip)
 */
app.directive("overview", function($timeout) {
  return {
    scope: {
      debate: "=",
      filename: "=",
      speaker: "=",
      topics: "=",
      debateIndex: "="
    },
    template:
      '<div class="fitContent overviewSvgContainer-cdr {{filename}}" id="overviewSvgContainer-cdr {{filename}}"><svg class="overviewSvg-cdr {{filename}}" id="overviewSvg-cdr {{filename}}"><g class="objectOverview-cdr {{filename}}" id="objectOverview{{$index+1}} {{filename}}" ng-repeat="object in debate"><g class="utteranceOverview-cdr {{filename}}" id="utteranceOverview{{$parent.$index+1}} {{filename}}" ng-repeat="utterance in object"><g class="sentenceOverview-cdr {{filename}}" id="utteranceOverview{{$parent.$parent.$index+1}} sentenceOverview{{$index+1}} {{filename}}" ng-repeat="sentence in utterance"><rect class="wordOverview-cdr {{filename}}" id="utteranceOverview{{$parent.$parent.$parent.$index+1}} sentenceOverview{{$parent.$index+1}} wordOverview{{$index+1}} {{filename}}" ng-repeat="word in sentence"></rect></g></g></g></svg></div>',
    link: function(scope) {
      $timeout(function() {
        // assign here topic and speaker as class and attribute to the object group element
        // for each utterance - needed later for filtering.
        d3.selectAll(".objectOverview-cdr." + scope.filename).each(function(
          _,
          i
        ) {
          d3.select(this)
            .classed(
              "topicOverview-cdr-" + scope.topics["utterance" + (i + 1)],
              true
            )
            .classed("speakerOverview-cdr-" + scope.speaker[i], true)
            .attr("topic", scope.topics["utterance" + (i + 1)])
            .attr("speaker", scope.speaker[i]);
        });
        // set width for svg
        // 100% width mean that svg has width of container - padding, and that is to short for displaying long sentences
        // reduce padding on the right side
        // apply width of content
        d3.select(".overviewSvg-cdr." + scope.filename)
          .style("margin-right", "10px")
          .style("width", "fit-content");

        // layout pixel and set height of svg
        initializePixelOverview(scope);
      }, 0);
    }
  };
});

/**
 * A directive to avoid empty input for the word search.
 * In case of no empty input, execute the search function.
 */
app.directive("searchForWordsEnter", function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      // enter key
      if (event.which === 13) {
        scope.$apply(function() {
          // check if search input field is not empty
          if (scope.search != "") {
            scope.$eval(attrs.searchForWordsEnter);
          } else {
            event.preventDefault();
          }
        });
        event.preventDefault();
      }
    });
  };
});

/**
 * controller for pos-tag info modal window
 */
app.controller("modalWindowPosTagInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for sentiment info modal window
 */
app.controller("modalWindowSentimentInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for speaker info modal window
 */
app.controller("modalWindowSpeakerInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for topic info modal window
 */
app.controller("modalWindowTopicsInfoController", function(
  $scope,
  $uibModalInstance,
  debateIndex,
  convertIntToRoman
) {
  $scope.convertIntToRoman = convertIntToRoman;
  $scope.debateIndex = debateIndex;
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for named entities info modal window
 */
app.controller("modalWindowNamedEntitiesInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for glyph info modal window
 */
app.controller("modalWindowGlyphInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for word cloud modal window
 */
app.controller("modalWindowWordCloudController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for word frequency info modal window
 */
app.controller("modalWindowWordFreqInfoController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for word occurrence in utterances modal window
 */
app.controller("modalWindowWordOccurrenceController", function(
  $scope,
  $uibModalInstance
) {
  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
  };
});

/**
 * controller for full screen modal window
 */
app.controller("modalWindowFullScreenController", function(
  $scope,
  $uibModalInstance,
  debateIndex
) {
  $scope.debateIndex = debateIndex;

  // close modal on button click
  $scope.ok = function() {
    $uibModalInstance.close(true);
    // reset variables after close
    $scope.fullScreenActive.active = false;
    $scope.fullScreenActive.debateIndex = null;
    $scope.fullScreenActive.content = null;
  };
});

/**
 * This filter removes whitespace in strings
 * it is used to set measure-names as class attribute
 */
app.filter("removeSpacesAndLowercase", [
  function() {
    return function(string) {
      if (!angular.isString(string)) {
        return string;
      }
      return string.replace(/[\s]/g, "").toLowerCase();
    };
  }
]);

/**
 * This function parses json-strings into objects
 */
function parseJsonStringsToObjects(feature) {
  let temp = [];

  //JSON-parser accepts only strings in single quote, but I receive a string in double quotes from server
  // so i have to change this "{\"utterance1\":{\"sentence1\": ..." to this '{"utterance1":{"sentence1": ..."'
  // https://stackoverflow.com/questions/30194562/json-parse-not-working
  for (let i = 0; i < feature.length; i++) {
    temp.push(JSON.parse(feature[i].replace(/\\/g, "")));
  }
  return temp;
}

/**
 * This method gets the height of an utterance,
 * which is needed to set the size for speaker annotation
 */
function calcHeightOfSpeakerAnnotation(index, tab) {
  let getHeightOfSiblingDiv = d3
    .select("#utteranceGlyphTopicContainer" + (index + 1) + "\\ " + tab)
    .style("height");

  return getHeightOfSiblingDiv;
}

/**
 * This method recalculates the height of the speaker annotation,
 * since annotating pos-tags or sentiment increases (decreases while removing)
 * the height of the utterance
 */
function recalcSpeakerAnnotationHeight(speaker, tab) {
  d3.selectAll(".speakerTag-cdr." + tab)
    .data(speaker)
    .each(function(_, i) {
      d3.select(this).style("height", function() {
        return calcHeightOfSpeakerAnnotation(i, tab);
      });
    });
}

/**
 * This method gets for each selected measures an object containing
 * the name the type and the min/max value.
 */
function getSelectedMeasureNames(
  debateIndex,
  $scope,
  selectedMeasuresToAnnotate
) {
  let temp = [];

  for (let i = 0; i < selectedMeasuresToAnnotate.length; i++) {
    let measureName = Object.keys(selectedMeasuresToAnnotate[i])[0];

    for (let j = 0; j < $scope.measureNamesList[debateIndex].length; j++) {
      if (measureName === $scope.measureNamesList[debateIndex][j].name) {
        temp.push($scope.measureNamesList[debateIndex][j]);
      }
    }
  }

  return temp;
}

/**
 * This function preprocesses and structures the input data for the glyph.
 * It creates an object for each utterance containing the selected measures
 * and its values.
 */
function prepareDataForGlyph(debateIndex, scope, selectedMeasuresToAnnotate) {
  let temp = [];
  for (let i = 0; i < scope.debateList[debateIndex].length; i++) {
    let obj = {};
    for (let j = 0; j < selectedMeasuresToAnnotate.length; j++) {
      let measure = selectedMeasuresToAnnotate[j];
      let measureKey = Object.keys(measure)[0];
      obj[measureKey] = measure[measureKey]["utterance" + (i + 1)];
    }
    temp.push(obj);
  }

  return temp;
}

/**
 * This method gets the corresponding measure objects from the
 * user selection. Each measure contains the values for each utterance.
 */
function getMeasureObjects(debateIndex, scope) {
  let temp = [];

  for (let i = 0; i < scope.selectedMeasuresLists[debateIndex].length; i++) {
    let selected = scope.selectedMeasuresLists[debateIndex][i];

    let measures = scope.measuresList[debateIndex];

    for (let j = 0; j < measures.length; j++) {
      let measure = measures[j];

      if (Object.keys(measure)[0] === selected) {
        temp.push(measure);
      }
    }
  }

  return temp;
}

/**
 * This method constructs a new cloud layout instance.
 * It run an algorithm to find the position of words that suits the requirements.
 */
function generateWordCloudLayout(
  initialWidth,
  initialHeight,
  stepSize,
  frequencyFontSize,
  frequencyFontColor,
  uibModal,
  scope,
  debateIndex
) {
  const layout = d3.layout
    .cloud()
    .size([initialWidth, initialHeight])
    .words(scope.wordFrequenciesList[debateIndex])
    .padding(0)
    .font("Impact")
    .fontSize(function(d) {
      return frequencyFontSize(d.frequency);
    })
    .rotate(function() {
      return 0;
    })
    .spiral("archimedean")
    .on("end", function(d) {
      let renderedWords = d;
      render(
        renderedWords,
        initialHeight,
        initialWidth,
        stepSize,
        frequencyFontSize,
        frequencyFontColor,
        uibModal,
        scope,
        debateIndex
      );
    });

  layout.start();
}

/**
 * This function takes the output of 'layout' above and draw the words.
 * Since this not guaranty that all word will drawn or have enough space
 * in the svg, increase the size of svg recursively until all words can be placed.
 * Append the 'word cloud' to modal window.
 * Also enable zooming and panning.
 * Further if a word is double clicked open a modal window and show the utterances in
 * which the word occur.
 */
function render(
  renderedWords,
  initialHeight,
  initialWidth,
  stepSize,
  frequencyFontSize,
  frequencyFontColor,
  uibModal,
  scope,
  debateIndex
) {
  if (renderedWords.length < scope.wordFrequenciesList[debateIndex].length) {
    // The size of the layout was to small, increase and try again.
    // Adapt the `stepSize` to constrain the resulting SVG size.
    generateWordCloudLayout(
      initialHeight * stepSize,
      initialWidth * stepSize,
      stepSize,
      frequencyFontSize,
      frequencyFontColor,
      uibModal,
      scope,
      debateIndex
    );
    return;
  }

  let svg = d3
    .select("#wordCloudContainer-cdr")
    .append("svg")
    .call(
      d3.behavior.zoom().on("zoom", function() {
        // transform g element (word cloud) while panning and zooming
        g.attr(
          "transform",
          "translate(" +
            d3.event.translate[0] +
            "," +
            d3.event.translate[1] +
            ") scale(" +
            d3.event.scale +
            ")"
        );

        // Problem: zooming on mouse position did not work
        // Solution: update viewBox of svg
        // https://bl.ocks.org/seemantk/80613e25e9804934608ac42440562168
        // The first two coordinates compensate the lack of the initial transform on the `svg`’s `g` element whose transform gets overwritten by the above call.
        svg.attr(
          "viewBox",
          `${-initialWidth / 2} ${-initialHeight /
            2} ${initialWidth} ${initialHeight}`
        );
      })
    )
    .attr("height", "100%")
    .attr("width", "100%")
    // show large world cloud in small svg
    .attr("viewBox", `0 0 ${initialWidth} ${initialHeight}`);

  let g = svg
    .append("g")
    // place word cloud at the center of viewBox
    .attr("transform", `translate(${initialWidth / 2}, ${initialHeight / 2})`);

  g.selectAll("text")
    .data(renderedWords)
    .enter()
    .append("text")
    .text(function(d) {
      return d.word;
    })
    .style("font-size", function(d) {
      return frequencyFontSize(d.frequency);
    })
    .style("font-family", "Impact")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      return `translate(${d.x}, ${d.y})`;
    })
    .style("fill", function(d) {
      return frequencyFontColor(d.frequency);
    })
    .style("cursor", "pointer")
    .on("dblclick", function(d) {
      uibModal
        .open({
          templateUrl: "views/modalWindowWordOccurrenceCDR.html",
          controller: "modalWindowWordOccurrenceController",
          scope: scope,
          backdrop: false
        })
        .rendered.then(function() {
          let utterances =
            scope.frequencyWordsToUtteranceList[debateIndex][0][d.word];

          let speakerColors = d3.scaleOrdinal(
            scope.speakerList[debateIndex],
            d3.schemeDark2
          );

          // show also speaker encoding in modal window to see which speaker belong to which utterance in which the selected word occur
          let speakerLegend =
            "<span style='display: flex; flex-direction: row; '>";
          for (let i = 0; i < scope.speakerList[debateIndex].length; i++) {
            speakerLegend +=
              "<div style='width: 10px; height: 10px; margin-top: 5px; background-color: " +
              speakerColors(scope.speakerList[debateIndex][i]) +
              "'></div><text style='margin-left: 2px; margin-right: 4px;'>" +
              scope.speakerList[debateIndex][i] +
              "</text>";
          }
          speakerLegend += "</span>";

          d3.select("#wordOccurrenceInfo-cdr").html(function() {
            return (
              "selected word: <b>" +
              d.word +
              "</b>(" +
              d.frequency +
              ") <br> number of utterances: " +
              utterances.length +
              "<br>" +
              speakerLegend
            );
          });

          // show utterances; encode speaker; highlight word
          d3.select("#wordOccurInUtterancesContainer-cdr")
            .selectAll("div")
            .data(utterances)
            .enter()
            .append("div")
            .style("border", function(d) {
              return (
                "solid 2px " +
                speakerColors(scope.speakerOrderList[debateIndex][d - 1])
              );
            })
            .style("margin-top", "3px")
            .style("padding", "3px")
            .html(function(utteranceNumber) {
              let temp = "";
              let utterance = angular.copy(
                scope.debateList[debateIndex][utteranceNumber - 1][
                  "utterance" + utteranceNumber
                ]
              );

              for (let sentences in utterance) {
                let sentence = utterance[sentences];
                let wordCount = 0;
                for (let words in sentence) {
                  let word = sentence[words];
                  wordCount++;

                  if (wordCount === 1) {
                    // place first word - check if it is selected one from cloud
                    if (word.toLowerCase() !== d.word) {
                      temp += word;
                    } else {
                      // highlight
                      temp +=
                        "<text style='background-color: yellow'>" +
                        word +
                        "</text>";
                    }
                  } else {
                    // is following tag a word or a punctuation/ punctuation with a word ('ve)
                    if (!word.match(/^[.,!?;:']/)) {
                      // no punctuation - reached end of sentence?
                      if (wordCount < Object.keys(sentence).length) {
                        // no, so check if tag is selected word from cloud and highlight
                        if (word.toLowerCase() !== d.word) {
                          temp += " " + word;
                        } else {
                          // highlight
                          temp +=
                            " <text style='background-color: yellow'>" +
                            word +
                            "</text>";
                        }
                      } else {
                        // yes, so new line
                        temp += " " + word + "<br>";
                      }
                    } else {
                      // punctuation check if its end off sentence
                      if (wordCount < Object.keys(sentence).length) {
                        temp += word;
                      } else {
                        // yes, so new line
                        temp += word + "<br>";
                      }
                    }
                  }
                }
              }
              return temp;
            });
        });
    });
}

/**
 * This method is placing each pixel which is rendered by the overview-directive
 * to its final position in the svg.
 * Further, it provides a tooltip for each pixel with its corresponding word.
 * To reduce the computational complexity of hovering the pixels and displaying tooltips,
 * the tooltip will show up after a timeout.
 * The pixels will also be highlighted - they increase in size.
 */
let svgHeightTab = [];

function initializePixelOverview(scope) {
  let debate = scope.debate;
  let tab = scope.filename;
  let debateIndex = scope.debateIndex;

  let pixelSize = 5.5;
  let gap = 3;
  let positionY = 5;

  let timeout;
  let flag = false;

  let greatGrandParentNextSibling;
  let parentNextSibling;
  let nodeNextSibling;

  for (let i = 0; i < debate.length; i++) {
    let sentenceCount = 1;
    let utterance = debate[i]["utterance" + (i + 1)];

    // pixel utterance start
    d3.select("#objectOverview" + (i + 1) + "\\ " + tab)
      .attr("yStartOrigin", positionY)
      .attr("objectId", i + 1);

    for (let sentence in utterance) {
      let words = angular.copy(utterance[sentence]);
      let wordCount = 1;
      let positionX = 5;

      d3.select(
        "#utteranceOverview" +
          (i + 1) +
          "\\ sentenceOverview" +
          sentenceCount +
          "\\ " +
          tab
      )
        .attr("yStartOrigin", positionY)
        .attr("yStart", positionY);

      for (let word in words) {
        d3.select(
          "#utteranceOverview" +
            (i + 1) +
            "\\ sentenceOverview" +
            sentenceCount +
            "\\ wordOverview" +
            wordCount +
            "\\ " +
            tab
        )
          .style("width", pixelSize)
          .style("height", pixelSize)
          .style("fill", "lightgrey")
          .attr("utteranceId", i + 1)
          .attr("sentenceId", sentenceCount)
          .attr("wordId", wordCount)
          .attr("pixelColor", "lightgrey")
          .attr("word", words[word])
          .attr("x", positionX)
          .attr("y", positionY)
          .on("mouseover", function() {
            d3.select(this).style("fill", "grey");

            let element = d3.select(this);
            let node = this;

            // build element ID and get element
            let elementID =
              "utterance" +
              d3.select(node).attr("utteranceId") +
              " sentence" +
              d3.select(node).attr("sentenceId") +
              " word" +
              d3.select(node).attr("wordId") +
              " " +
              tab;

            timeout = setTimeout(function() {
              flag = true;

              // show tooltip
              element
                .append("svg:title")
                .classed("overviewTooltip-cdr", true)
                .text(function() {
                  let text = words[word];

                  if (element.classed("posAnnotationOverview-cdr")) {
                    text +=
                      "\n" +
                      element.attr("posTagCategory") +
                      ":" +
                      element.attr("tag");
                  }

                  if (element.classed("namedEntityOverview-cdr")) {
                    text += "\n" + element.attr("namedEntityCategory");
                  }
                  return text;
                });

              if (
                d3.select(node).classed("wordSearchHighlightedOverview-cdr")
              ) {
                elementID += " searchWordHighlighted";
              }

              // highlight word in text
              d3.select("#" + elementID.replace(/ /g, "\\ "))
                .classed("pixelHovered-cdr", true)
                .style("background-color", "rgba(0,255,255,0.5)");

              // move pixel to front and increase size
              // since svg elements have no z-index, you have to append element new to the tree
              // https://stackoverflow.com/questions/482115/with-javascript-can-i-change-the-z-index-layer-of-an-svg-g-element/482147#482147
              // therefore append new the whole object g-element, the utterance g-element, the sentence g-element and last the pixel on which is hovered
              // selection.raise() is not available in d3.v3
              // Note: dont forget to place it back after mouseout
              // https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3

              let parent = node.parentNode;
              let grandparent = parent.parentNode;
              let greatGrandparent = grandparent.parentNode;
              let svg = greatGrandparent.parentNode;

              // store reference elements which are needed to place it back
              greatGrandParentNextSibling = greatGrandparent.nextElementSibling;
              parentNextSibling = parent.nextElementSibling;
              nodeNextSibling = node.nextElementSibling;

              // append new to the svg tree
              svg.appendChild(greatGrandparent);
              greatGrandparent.appendChild(grandparent);
              grandparent.appendChild(parent);
              parent.appendChild(node);

              // append tracker new to svg tree - should always latest element
              // needed here when tracker is placed over pixel
              //svg.appendChild(d3.select(".tracker-cdr." + tab).node());

              d3.select(node)
                .style("fill", function() {
                  if (
                    d3
                      .select(this)
                      .classed("namedEntityAnnotationOverviewHidden-cdr") ||
                    d3
                      .select(this)
                      .classed("sentimentAnnotationOverviewHidden-cdr") ||
                    d3.select(this).classed("posAnnotationOverviewHidden-cdr")
                  ) {
                    return "lightgrey";
                  } else if (
                    d3.select(this).classed("wordSearchHighlightedOverview-cdr")
                  ) {
                    return "yellow";
                  } else {
                    return d3.select(this).attr("pixelColor");
                  }
                })
                .style("stroke", "black")
                .style("stroke-width", "1.5px")
                .style("width", pixelSize * 2 + "px")
                .style("height", pixelSize * 2 + "px")
                .style(
                  "transform",
                  "translate(" + -pixelSize / 2 + "px," + -pixelSize / 2 + "px)"
                );
            }, 900);
          })
          .on("mouseout", function() {
            d3.select(this).style("fill", function() {
              if (
                d3
                  .select(this)
                  .classed("namedEntityAnnotationOverviewHidden-cdr") ||
                d3
                  .select(this)
                  .classed("sentimentAnnotationOverviewHidden-cdr") ||
                d3.select(this).classed("posAnnotationOverviewHidden-cdr")
              ) {
                return "lightgrey";
              } else if (
                d3.select(this).classed("wordSearchHighlightedOverview-cdr")
              ) {
                return "yellow";
              } else {
                return d3.select(this).attr("pixelColor");
              }
            });

            if (flag) {
              flag = false;

              // remove tooltip
              d3.select(".overviewTooltip-cdr").remove();

              // remove word highlighting
              d3.select(".pixelHovered-cdr")
                .classed("pixelHovered-cdr", false)
                .style("background-color", function() {
                  if (d3.select(this).classed("searchWordHighlighted-cdr")) {
                    return "rgba(255,255,0,0.5)";
                  } else {
                    return "unset";
                  }
                });

              d3.select(this)
                .style("width", pixelSize + "px")
                .style("height", pixelSize + "px")
                .style("stroke", "unset")
                .style("stroke-width", "unset")
                .style("transform", "translate(0px,0px)");

              // place elements after hover back to their original position in the svg tree
              let parent = this.parentNode;
              let grandparent = parent.parentNode;
              let greatGrandparent = grandparent.parentNode;
              let svg = greatGrandparent.parentNode;

              svg.insertBefore(greatGrandparent, greatGrandParentNextSibling);

              grandparent.insertBefore(parent, parentNextSibling);
              parent.insertBefore(this, nodeNextSibling);
            } else {
              clearTimeout(timeout);
            }
          })
          .on("dblclick", function() {
            // build element ID and get element
            let elementID =
              "utterance" +
              d3.select(this).attr("utteranceId") +
              " sentence" +
              d3.select(this).attr("sentenceId") +
              " word" +
              d3.select(this).attr("wordId") +
              " " +
              tab;

            if (d3.select(this).classed("wordSearchHighlightedOverview-cdr")) {
              elementID += " searchWordHighlighted";
            }

            let element = document.getElementById(elementID);

            // build container ID and get container
            let containerID = "text_container-cdr " + tab;
            let container = document.getElementById(containerID);

            // highlight word in text container
            let word = d3.select(
              "#utterance" +
                d3.select(this).attr("utteranceId") +
                "\\ sentence" +
                d3.select(this).attr("sentenceId") +
                "\\ word" +
                d3.select(this).attr("wordId") +
                "\\ " +
                tab
            );
            word.style("background-color", "aqua");

            // smooth scroll to element and align it at the center of container
            container.scrollTo({
              top:
                element.offsetTop -
                container.getBoundingClientRect().height / 2,
              behavior: "smooth"
            });

            // remove background highlighting after few sec
            setTimeout(function() {
              word.style("background-color", function() {
                if (word.classed("searchWordHighlighte-cdr")) {
                  return "rgba(255,255,0,0.5)";
                } else {
                  return "unset";
                }
              });
            }, 4000);
          });

        positionX += pixelSize;

        wordCount++;
      }
      positionY += pixelSize;

      d3.select(
        "#utteranceOverview" +
          (i + 1) +
          "\\ sentenceOverview" +
          sentenceCount +
          "\\ " +
          tab
      )
        .attr("yEndOrigin", positionY)
        .attr("yEnd", positionY);

      sentenceCount++;
    }

    // pixel utterance end
    d3.select("#objectOverview" + (i + 1) + "\\ " + tab).attr(
      "yEndOrigin",
      positionY
    );

    positionY += gap;
  }

  // set height of svg
  svgHeightTab[debateIndex] = positionY + gap;

  d3.select(".overviewSvg-cdr." + tab).style(
    "height",
    svgHeightTab[debateIndex]
  );
}

/**
 * This method resets the sentence start and end position attributes
 * after one filter is applied or removed
 */
function resetYPositionsSentences(tab) {
  // reset sentence y positions for tracker
  d3.selectAll(".sentenceOverview-cdr." + tab).each(function() {
    let yOriginStartSentence = parseFloat(d3.select(this).attr("yStartOrigin"));
    let yOriginEndSentence = parseFloat(d3.select(this).attr("yEndOrigin"));

    d3.select(this)
      .attr("yStart", yOriginStartSentence)
      .attr("yEnd", yOriginEndSentence);
  });
}

/**
 * This function align the "utterance" pixel in the overview
 * after topics and/or speaker filter applied.
 * Also update sentence y positions -needed for tracker
 */
function alignUtterancePixelInOverview(tab) {
  let y = 5;
  let gap = 3;

  d3.selectAll(
    ".objectOverview-cdr." + tab + ":not(.overviewFiltered-cdr)"
  ).each(function() {
    let yOriginStart = parseFloat(d3.select(this).attr("yStartOrigin"));
    let yOriginEnd = parseFloat(d3.select(this).attr("yEndOrigin"));

    let newYStartObj = -yOriginStart + y;

    d3.select(this).style("transform", "translate(0px," + newYStartObj + "px)");

    // update sentence y positions for tracker
    let utter = d3.select(this).select(".utteranceOverview-cdr");

    utter.selectAll(".sentenceOverview-cdr").each(function() {
      let yOriginStartSentence = parseFloat(
        d3.select(this).attr("yStartOrigin")
      );
      let yOriginEndSentence = parseFloat(d3.select(this).attr("yEndOrigin"));

      let updatedYStart = yOriginStartSentence + newYStartObj;
      let updatedYEnd = yOriginEndSentence + newYStartObj;

      d3.select(this)
        .attr("yStart", updatedYStart)
        .attr("yEnd", updatedYEnd);
    });

    y += Math.abs(yOriginStart - yOriginEnd) + gap;
  });

  // set new height of svg
  d3.select(".overviewSvg-cdr." + tab).style("height", y + "px");
}

/*
 * Taken from https://github.com/jasondavies/d3-cloud/blob/master/examples/browserify.js
 * and modified accordingly.

 * By default, `d3-cloud` does not guarantee that all words will be placed in the resulting
 * word cloud. For more information, refer to
 *  - https://github.com/jasondavies/d3-cloud/issues/159
 *  - https://github.com/jasondavies/d3-cloud/issues/166
 *  - https://github.com/jasondavies/d3-cloud#start

 * Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf

 * To mitigate this issue, use an iterative approach to determine the approximate size of
 * the SVG. Start with a sufficiently small size (compare end of the file),
 * increase iteratively the size of the SVG until all specified words are rendered.

 * Beware that the layout is generated randomly which generates a result of varying quality
 * and size. If you want to achieve consistency, remove any notion of randomness.
 */

(function(exports) {
  function cloud() {
    var size = [256, 256],
      text = cloudText,
      font = cloudFont,
      fontSize = cloudFontSize,
      fontStyle = cloudFontNormal,
      fontWeight = cloudFontNormal,
      rotate = cloudRotate,
      padding = cloudPadding,
      spiral = archimedeanSpiral,
      words = [],
      timeInterval = Infinity,
      event = d3.dispatch("word", "end"),
      timer = null,
      cloud = {};

    cloud.start = function() {
      var board = zeroArray((size[0] >> 5) * size[1]),
        bounds = null,
        n = words.length,
        i = -1,
        tags = [],
        data = words
          .map(function(d, i) {
            d.text = text.call(this, d, i);
            d.font = font.call(this, d, i);
            d.style = fontStyle.call(this, d, i);
            d.weight = fontWeight.call(this, d, i);
            d.rotate = rotate.call(this, d, i);
            d.size = ~~fontSize.call(this, d, i);
            d.padding = padding.call(this, d, i);
            return d;
          })
          .sort(function(a, b) {
            return b.size - a.size;
          });

      if (timer) clearInterval(timer);
      timer = setInterval(step, 0);
      step();

      return cloud;

      function step() {
        var start = +new Date(),
          d;
        while (+new Date() - start < timeInterval && ++i < n && timer) {
          d = data[i];
          d.x = (size[0] * (Math.random() + 0.5)) >> 1;
          d.y = (size[1] * (Math.random() + 0.5)) >> 1;
          cloudSprite(d, data, i);
          if (d.hasText && place(board, d, bounds)) {
            tags.push(d);
            event.word(d);
            if (bounds) cloudBounds(bounds, d);
            else
              bounds = [
                { x: d.x + d.x0, y: d.y + d.y0 },
                { x: d.x + d.x1, y: d.y + d.y1 }
              ];
            // Temporary hack
            d.x -= size[0] >> 1;
            d.y -= size[1] >> 1;
          }
        }
        if (i >= n) {
          cloud.stop();
          event.end(tags, bounds);
        }
      }
    };

    cloud.stop = function() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      return cloud;
    };

    cloud.timeInterval = function(x) {
      if (!arguments.length) return timeInterval;
      timeInterval = x == null ? Infinity : x;
      return cloud;
    };

    function place(board, tag, bounds) {
      var perimeter = [{ x: 0, y: 0 }, { x: size[0], y: size[1] }],
        startX = tag.x,
        startY = tag.y,
        maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
        s = spiral(size),
        dt = Math.random() < 0.5 ? 1 : -1,
        t = -dt,
        dxdy,
        dx,
        dy;

      while ((dxdy = s((t += dt)))) {
        dx = ~~dxdy[0];
        dy = ~~dxdy[1];

        if (Math.min(dx, dy) > maxDelta) break;

        tag.x = startX + dx;
        tag.y = startY + dy;

        if (
          tag.x + tag.x0 < 0 ||
          tag.y + tag.y0 < 0 ||
          tag.x + tag.x1 > size[0] ||
          tag.y + tag.y1 > size[1]
        )
          continue;
        // TODO only check for collisions within current bounds.
        if (!bounds || !cloudCollide(tag, board, size[0])) {
          if (!bounds || collideRects(tag, bounds)) {
            var sprite = tag.sprite,
              w = tag.width >> 5,
              sw = size[0] >> 5,
              lx = tag.x - (w << 4),
              sx = lx & 0x7f,
              msx = 32 - sx,
              h = tag.y1 - tag.y0,
              x = (tag.y + tag.y0) * sw + (lx >> 5),
              last;
            for (var j = 0; j < h; j++) {
              last = 0;
              for (var i = 0; i <= w; i++) {
                board[x + i] |=
                  (last << msx) |
                  (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
              }
              x += sw;
            }
            delete tag.sprite;
            return true;
          }
        }
      }
      return false;
    }

    cloud.words = function(x) {
      if (!arguments.length) return words;
      words = x;
      return cloud;
    };

    cloud.size = function(x) {
      if (!arguments.length) return size;
      size = [+x[0], +x[1]];
      return cloud;
    };

    cloud.font = function(x) {
      if (!arguments.length) return font;
      font = d3.functor(x);
      return cloud;
    };

    cloud.fontStyle = function(x) {
      if (!arguments.length) return fontStyle;
      fontStyle = d3.functor(x);
      return cloud;
    };

    cloud.fontWeight = function(x) {
      if (!arguments.length) return fontWeight;
      fontWeight = d3.functor(x);
      return cloud;
    };

    cloud.rotate = function(x) {
      if (!arguments.length) return rotate;
      rotate = d3.functor(x);
      return cloud;
    };

    cloud.text = function(x) {
      if (!arguments.length) return text;
      text = d3.functor(x);
      return cloud;
    };

    cloud.spiral = function(x) {
      if (!arguments.length) return spiral;
      spiral = spirals[x + ""] || x;
      return cloud;
    };

    cloud.fontSize = function(x) {
      if (!arguments.length) return fontSize;
      fontSize = d3.functor(x);
      return cloud;
    };

    cloud.padding = function(x) {
      if (!arguments.length) return padding;
      padding = d3.functor(x);
      return cloud;
    };

    return d3.rebind(cloud, event, "on");
  }

  function cloudText(d) {
    return d.text;
  }

  function cloudFont() {
    return "serif";
  }

  function cloudFontNormal() {
    return "normal";
  }

  function cloudFontSize(d) {
    return Math.sqrt(d.value);
  }

  function cloudRotate() {
    return (~~(Math.random() * 6) - 3) * 30;
  }

  function cloudPadding() {
    return 1;
  }

  // Fetches a monochrome sprite bitmap for the specified text.
  // Load in batches for speed.
  function cloudSprite(d, data, di) {
    if (d.sprite) return;
    c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
    var x = 0,
      y = 0,
      maxh = 0,
      n = data.length;
    --di;
    while (++di < n) {
      d = data[di];
      c.save();
      c.font =
        d.style +
        " " +
        d.weight +
        " " +
        ~~((d.size + 1) / ratio) +
        "px " +
        d.font;
      var w = c.measureText(d.text + "m").width * ratio,
        h = d.size << 1;
      if (d.rotate) {
        var sr = Math.sin(d.rotate * cloudRadians),
          cr = Math.cos(d.rotate * cloudRadians),
          wcr = w * cr,
          wsr = w * sr,
          hcr = h * cr,
          hsr = h * sr;
        w =
          ((Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5) <<
          5;
        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
      } else {
        w = ((w + 0x1f) >> 5) << 5;
      }
      if (h > maxh) maxh = h;
      if (x + w >= cw << 5) {
        x = 0;
        y += maxh;
        maxh = 0;
      }
      if (y + h >= ch) break;
      c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
      if (d.rotate) c.rotate(d.rotate * cloudRadians);
      c.fillText(d.text, 0, 0);
      if (d.padding) (c.lineWidth = 2 * d.padding), c.strokeText(d.text, 0, 0);
      c.restore();
      d.width = w;
      d.height = h;
      d.xoff = x;
      d.yoff = y;
      d.x1 = w >> 1;
      d.y1 = h >> 1;
      d.x0 = -d.x1;
      d.y0 = -d.y1;
      d.hasText = true;
      x += w;
    }
    var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
      sprite = [];
    while (--di >= 0) {
      d = data[di];
      if (!d.hasText) continue;
      var w = d.width,
        w32 = w >> 5,
        h = d.y1 - d.y0;
      // Zero the buffer
      for (var i = 0; i < h * w32; i++) sprite[i] = 0;
      x = d.xoff;
      if (x == null) return;
      y = d.yoff;
      var seen = 0,
        seenRow = -1;
      for (var j = 0; j < h; j++) {
        for (var i = 0; i < w; i++) {
          var k = w32 * j + (i >> 5),
            m = pixels[((y + j) * (cw << 5) + (x + i)) << 2]
              ? 1 << (31 - (i % 32))
              : 0;
          sprite[k] |= m;
          seen |= m;
        }
        if (seen) seenRow = j;
        else {
          d.y0++;
          h--;
          j--;
          y++;
        }
      }
      d.y1 = d.y0 + seenRow;
      d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
    }
  }

  // Use mask-based collision detection.
  function cloudCollide(tag, board, sw) {
    sw >>= 5;
    var sprite = tag.sprite,
      w = tag.width >> 5,
      lx = tag.x - (w << 4),
      sx = lx & 0x7f,
      msx = 32 - sx,
      h = tag.y1 - tag.y0,
      x = (tag.y + tag.y0) * sw + (lx >> 5),
      last;
    for (var j = 0; j < h; j++) {
      last = 0;
      for (var i = 0; i <= w; i++) {
        if (
          ((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0)) &
          board[x + i]
        )
          return true;
      }
      x += sw;
    }
    return false;
  }

  function cloudBounds(bounds, d) {
    var b0 = bounds[0],
      b1 = bounds[1];
    if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
    if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
    if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
    if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
  }

  function collideRects(a, b) {
    return (
      a.x + a.x1 > b[0].x &&
      a.x + a.x0 < b[1].x &&
      a.y + a.y1 > b[0].y &&
      a.y + a.y0 < b[1].y
    );
  }

  function archimedeanSpiral(size) {
    var e = size[0] / size[1];
    return function(t) {
      return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
  }

  function rectangularSpiral(size) {
    var dy = 4,
      dx = (dy * size[0]) / size[1],
      x = 0,
      y = 0;
    return function(t) {
      var sign = t < 0 ? -1 : 1;
      // See triangular numbers: T_n = n * (n + 1) / 2.
      switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
        case 0:
          x += dx;
          break;
        case 1:
          y += dy;
          break;
        case 2:
          x -= dx;
          break;
        default:
          y -= dy;
          break;
      }
      return [x, y];
    };
  }

  // TODO reuse arrays?
  function zeroArray(n) {
    var a = [],
      i = -1;
    while (++i < n) a[i] = 0;
    return a;
  }

  var cloudRadians = Math.PI / 180,
    cw = (1 << 11) >> 5,
    ch = 1 << 11,
    canvas,
    ratio = 1;

  if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    ratio = Math.sqrt(
      canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2
    );
    canvas.width = (cw << 5) / ratio;
    canvas.height = ch / ratio;
  } else {
    // node-canvas support
    var Canvas = require("canvas");
    canvas = new Canvas(cw << 5, ch);
  }

  var c = canvas.getContext("2d"),
    spirals = {
      archimedean: archimedeanSpiral,
      rectangular: rectangularSpiral
    };
  c.fillStyle = c.strokeStyle = "red";
  c.textAlign = "center";

  exports.cloud = cloud;
})(typeof exports === "undefined" ? d3.layout || (d3.layout = {}) : exports);

/*
 * Porter stemmer.
 *  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
 *  no. 3, pp 130-137,

 * see also http://www.tartarus.org/~martin/PorterStemmer

 * Release 1 be 'andargor', Jul 2004
 * Release 2 (substantially revised) by Christopher McKenzie, Aug 2009
 */
let stemmer = (function() {
  var step2list = {
      ational: "ate",
      tional: "tion",
      enci: "ence",
      anci: "ance",
      izer: "ize",
      bli: "ble",
      alli: "al",
      entli: "ent",
      eli: "e",
      ousli: "ous",
      ization: "ize",
      ation: "ate",
      ator: "ate",
      alism: "al",
      iveness: "ive",
      fulness: "ful",
      ousness: "ous",
      aliti: "al",
      iviti: "ive",
      biliti: "ble",
      logi: "log"
    },
    step3list = {
      icate: "ic",
      ative: "",
      alize: "al",
      iciti: "ic",
      ical: "ic",
      ful: "",
      ness: ""
    },
    c = "[^aeiou]", // consonant
    v = "[aeiouy]", // vowel
    C = c + "[^aeiouy]*", // consonant sequence
    V = v + "[aeiou]*", // vowel sequence
    mgr0 = "^(" + C + ")?" + V + C, // [C]VC... is m>0
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", // [C]VC[V] is m=1
    mgr1 = "^(" + C + ")?" + V + C + V + C, // [C]VCVC... is m>1
    s_v = "^(" + C + ")?" + v; // vowel in stem

  return function(w) {
    var stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4,
      origword = w;

    if (w.length < 3) {
      return w;
    }

    firstch = w.substr(0, 1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) {
      w = w.replace(re, "$1$2");
    } else if (re2.test(w)) {
      w = w.replace(re2, "$1$2");
    }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re, "");
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        if (re2.test(w)) {
          w = w + "e";
        } else if (re3.test(w)) {
          re = /.$/;
          w = w.replace(re, "");
        } else if (re4.test(w)) {
          w = w + "e";
        }
      }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(s_v);
      if (re.test(stem)) {
        w = stem + "i";
      }
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !re3.test(stem))) {
        w = stem;
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re, "");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }

    return w;
  };
})();
