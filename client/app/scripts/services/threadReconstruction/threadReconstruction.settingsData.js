/* global angular*/
/**
 * Created by rita_temp on 09.06.17.
 */
angular
  .module("visArgueClientApp")
  .factory("ThreadReconstructionSettingsData", [
    "$rootScope",
    function($rootScope) {
      "use strict";
      var titleMessage = {};
      var settingsData = {};
      var messagesData = [];
      var sortedGivenConnectedComponents = [];
      var sortedFoundConnectedComponents = [];
      var queryData = [];
      var rightModelQueryData = [];
      var leftModelQueryData = [];
      var parentCandidateRelations = [];
      var clickedFeature = "NO_FEATURE";
      var tempVisibleMessagesInParentChildSpace = [];
      var titleMessageChildrenids = [];
      var sortedOutRelations = [];
      var storedRelations = [];
      var relevantMessageIds = [];
      var classifier = "";
      var leftModel = false;
      var featureToCategory = {};
      var features = [];
      var featuresRM = [];
      var featuresLM = [];
      var featureToCategoryRM = [];
      var featureToCategoryLM = [];
      var currentLeftModel;
      var currentRightModel;
      var maxLeftModelDistance;
      var maxRightModelDistance;
      var showTrueRelations;
      var showAgreement;
      var transitionLM;
      var transitionRM;
      var oneMessageSelected;

      var setClickedFeature = function(feature) {
        clickedFeature = feature;
      };

      var getClickedFeature = function() {
        return clickedFeature;
      };

      var setTitleMessage = function(title) {
        titleMessage = title;
      };

      var getTitleMessage = function() {
        return titleMessage;
      };

      var setMessagesData = function(messages) {
        messagesData = messages;
      };

      var getMessagesData = function() {
        return messagesData;
      };

      var setData = function(settings) {
        settingsData = settings;
      };

      var getData = function() {
        return settingsData;
      };

      var setGivenConnectedComponentsData = function(components) {
        sortedGivenConnectedComponents = components;
      };

      var getGivenConnectedComponentsData = function() {
        return sortedGivenConnectedComponents;
      };

      var setFoundConnectedComponentsData = function(components) {
        sortedFoundConnectedComponents = components;
      };

      var getFoundConnectedComponentsData = function() {
        return sortedFoundConnectedComponents;
      };

      var setQueryData = function(query) {
        queryData = query;
        setCategoriesToFeatures();
      };

      var getQueryData = function() {
        return queryData;
      };

      var setRightModelQueryData = function(query) {
        rightModelQueryData = query;
        setCategoriesToFeaturesForRM();
      };

      var getRightModelQueryData = function() {
        return rightModelQueryData;
      };

      var setLeftModelQueryData = function(query) {
        leftModelQueryData = query;
        setCategoriesToFeaturesForLM();
      };

      var getLeftModelQueryData = function() {
        return leftModelQueryData;
      };

      var setPrentCandidateRelations = function(relations) {
        parentCandidateRelations = relations;
      };

      var getPrentCandidateRelations = function() {
        return parentCandidateRelations;
      };

      var getMessageWithId = function(id) {
        var searched;
        messagesData.forEach(function(message) {
          if (message.id === id) {
            searched = message;
          }
        });
        return searched;
      };

      var setTempVisibleMessagesInParentChildSpace = function(messages) {
        tempVisibleMessagesInParentChildSpace = messages;
      };

      var getTempVisibleMessagesInParentChildSpace = function() {
        return tempVisibleMessagesInParentChildSpace;
      };

      var getTitleMessageChildrenIds = function() {
        return titleMessageChildrenids;
      };

      var setTitleMessageChildrenIds = function(ids) {
        titleMessageChildrenids = ids;
      };

      var setSortedOutRelations = function(relations) {
        sortedOutRelations = relations;
      };

      var getSortedOutRelations = function() {
        return sortedOutRelations;
      };

      var setStoredRelations = function(relations) {
        storedRelations = relations;
      };

      var getStoredRelations = function() {
        return storedRelations;
      };

      var getRelevantMessageIds = function() {
        return relevantMessageIds;
      };

      var setRelevantMessageIds = function(ids) {
        relevantMessageIds = ids;
      };

      var setCurrentClassifier = function(c) {
        classifier = c;
      };

      var getCurrentClassifier = function() {
        return classifier;
      };

      var setLeftModel = function(value) {
        leftModel = value;
      };

      var isLeftModel = function() {
        return leftModel;
      };

      var setCategoriesToFeatures = function() {
        var featureData = getData();
        features = [];
        featureToCategory = {};
        Object.keys(featureData).forEach(function(category) {
          featureData[category].forEach(function(feature) {
            var found = false;
            getQueryData().forEach(function(queryFeature) {
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
      };

      var setCategoriesToFeaturesForRM = function() {
        var featureData = getData();
        featuresRM = [];
        featureToCategoryRM = {};
        Object.keys(featureData).forEach(function(category) {
          featureData[category].forEach(function(feature) {
            var found = false;
            getRightModelQueryData().forEach(function(queryFeature) {
              if (queryFeature.name === feature.name) {
                found = true;
              }
            });
            featuresRM.push(feature.name);
            featureToCategoryRM[feature.name] = {
              category: category,
              usedInQuery: found
            };
          });
        });
      };

      var setCategoriesToFeaturesForLM = function() {
        var featureData = getData();
        featuresLM = [];
        featureToCategoryLM = {};
        Object.keys(featureData).forEach(function(category) {
          featureData[category].forEach(function(feature) {
            var found = false;
            getLeftModelQueryData().forEach(function(queryFeature) {
              if (queryFeature.name === feature.name) {
                found = true;
              }
            });
            featuresLM.push(feature.name);
            featureToCategoryLM[feature.name] = {
              category: category,
              usedInQuery: found
            };
          });
        });
      };

      var getFeatureDataLM = function() {
        return featuresLM;
      };

      var getFeaturesToCategoriesLM = function() {
        return featureToCategoryLM;
      };

      var getFeatureDataRM = function() {
        return featuresRM;
      };

      var getFeaturesToCategoriesRM = function() {
        return featureToCategoryRM;
      };

      var getFeatureData = function() {
        return features;
      };

      var getFeaturesToCategories = function() {
        return featureToCategory;
      };

      var setCurrentLeftModel = function(model) {
        currentLeftModel = model;
      };

      var getCurrentLeftModel = function() {
        return currentLeftModel;
      };

      var setCurrentRightModel = function(model) {
        currentRightModel = model;
      };

      var getCurrentRightModel = function() {
        return currentRightModel;
      };

      var setMaxRightModelDistance = function(distance) {
        maxRightModelDistance = distance;
      };

      var getMaxRightModelDistance = function() {
        return maxRightModelDistance;
      };

      var setMaxLeftModelDistance = function(distance) {
        maxLeftModelDistance = distance;
      };

      var getMaxLeftModelDistance = function() {
        return maxLeftModelDistance;
      };

      var setShowTrueRelations = function(show) {
        showTrueRelations = show;
      };

      var getShowTrueRelations = function() {
        return showTrueRelations;
      };

      var setShowAgreement = function(show) {
        showAgreement = show;
      };

      var getShowAgreement = function() {
        return showAgreement;
      };

      var setTransitionLM = function(is) {
        transitionLM = is;
      };

      var setTransitionRM = function(is) {
        transitionRM = is;
      };

      var getTransitionLM = function() {
        return transitionLM;
      };

      var getTransitionRM = function() {
        return transitionRM;
      };

      var setIsMessageSelected = function(is) {
        oneMessageSelected = is;
      };

      var isMessageSelected = function() {
        return oneMessageSelected;
      };

      // Public API here
      return {
        setData: setData,
        getData: getData,
        setMessagesData: setMessagesData,
        getMessagesData: getMessagesData,
        setGivenConnectedComponentsData: setGivenConnectedComponentsData,
        getGivenConnectedComponentsData: getGivenConnectedComponentsData,
        setFoundConnectedComponentsData: setFoundConnectedComponentsData,
        getFoundConnectedComponentsData: getFoundConnectedComponentsData,
        setQueryData: setQueryData,
        getQueryData: getQueryData,
        setPrentCandidateRelations: setPrentCandidateRelations,
        getPrentCandidateRelations: getPrentCandidateRelations,
        getMessageWithId: getMessageWithId,
        setTitleMessage: setTitleMessage,
        getTitleMessage: getTitleMessage,
        setClickedFeature: setClickedFeature,
        getClickedFeature: getClickedFeature,
        setTempVisibleMessagesInParentChildSpace: setTempVisibleMessagesInParentChildSpace,
        getTempVisibleMessagesInParentChildSpace: getTempVisibleMessagesInParentChildSpace,
        getTitleMessageChildrenIds: getTitleMessageChildrenIds,
        setTitleMessageChildrenIds: setTitleMessageChildrenIds,
        setSortedOutRelations: setSortedOutRelations,
        getSortedOutRelations: getSortedOutRelations,
        setStoredRelations: setStoredRelations,
        getStoredRelations: getStoredRelations,
        getRelevantMessageIds: getRelevantMessageIds,
        setRelevantMessageIds: setRelevantMessageIds,
        setCurrentClassifier: setCurrentClassifier,
        getCurrentClassifier: getCurrentClassifier,
        setLeftModel: setLeftModel,
        isLeftModel: isLeftModel,
        setCategoriesToFeatures: setCategoriesToFeatures,
        getFeatureData: getFeatureData,
        getFeaturesToCategories: getFeaturesToCategories,
        setCategoriesToFeaturesForLM: setCategoriesToFeaturesForLM,
        getFeatureDataLM: getFeatureDataLM,
        getFeaturesToCategoriesLM: getFeaturesToCategoriesLM,
        setCategoriesToFeaturesForRM: setCategoriesToFeaturesForRM,
        getFeatureDataRM: getFeatureDataRM,
        getFeaturesToCategoriesRM: getFeaturesToCategoriesRM,
        setCurrentLeftModel: setCurrentLeftModel,
        getCurrentLeftModel: getCurrentLeftModel,
        setCurrentRightModel: setCurrentRightModel,
        getCurrentRightModel: getCurrentRightModel,
        setMaxRightModelDistance: setMaxRightModelDistance,
        getMaxRightModelDistance: getMaxRightModelDistance,
        setMaxLeftModelDistance: setMaxLeftModelDistance,
        getMaxLeftModelDistance: getMaxLeftModelDistance,
        setShowTrueRelations: setShowTrueRelations,
        getShowTrueRelations: getShowTrueRelations,
        setRightModelQueryData: setRightModelQueryData,
        getRightModelQueryData: getRightModelQueryData,
        setLeftModelQueryData: setLeftModelQueryData,
        getLeftModelQueryData: getLeftModelQueryData,
        setShowAgreement: setShowAgreement,
        getShowAgreement: getShowAgreement,
        setTransitionLM: setTransitionLM,
        setTransitionRM: setTransitionRM,
        getTransitionLM: getTransitionLM,
        getTransitionRM: getTransitionRM,
        setIsMessageSelected: setIsMessageSelected,
        isMessageSelected: isMessageSelected
      };
    }
  ]);
