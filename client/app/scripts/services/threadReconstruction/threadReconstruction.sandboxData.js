/* global angular*/
/**
 * Created by rita_temp on 09.06.17.
 */
angular.module("visArgueClientApp").factory("ThreadReconstructionSandboxData", [
  "$rootScope",
  function($rootScope) {
    "use strict";
    var messageData = [];
    var foundLinks = [];
    var givenLinks = [];
    var modalId = "";
    var allCategories = [];

    var setMessages = function(messages) {
      messageData = messages;
    };

    var getMessages = function() {
      return messageData;
    };

    var setFoundlinks = function(found) {
      foundLinks = found;
    };

    var getFoundLinks = function() {
      return foundLinks;
    };

    var setGivenlinks = function(given) {
      givenLinks = given;
    };

    var getGivenLinks = function() {
      return givenLinks;
    };

    var setModalId = function(modal) {
      modalId = modal;
    };

    var getModalId = function() {
      return modalId;
    };

    var setAllCategories = function(categories) {
      allCategories = categories;
    };

    var getAllCategories = function() {
      return allCategories;
    };

    var createDataForSandbox = function(d, allMessages) {
      var messages = [];
      var foundLinks = d.foundChildren;
      var givenLinks = d.givenChildren;
      allMessages.forEach(function(data) {
        d.foundChildren.forEach(function(dataChild) {
          if (dataChild.childId === data.id) {
            if (messages.indexOf(data) === -1) {
              messages.push(data);
            }
          }
        });
        d.givenChildren.forEach(function(dataChild) {
          if (dataChild.childId === data.id) {
            if (messages.indexOf(data) === -1) {
              messages.push(data);
            }
          }
        });
      });
      if (messages.indexOf(d) === -1) {
        messages.push(d);
      }

      messages.sort(function(a, b) {
        return parseInt(a.id.split("ID")[1]) - parseInt(b.id.split("ID")[1]);
      });
      setMessages(messages);
      setFoundlinks(foundLinks);
      setGivenlinks(givenLinks);
    };

    /** count each message categories to display statistics(for found and not found messages separately) */
    var getMessageCategoriesForCorrectlyFoundRelations = function() {
      var categoryList = [];
      var messageList = [];
      var categoryData = {};
      foundLinks.forEach(function(link) {
        if (link.theSameAsGiven || link.transitiveSameAsGiven) {
          var message = getMessageWithId(link.parentId);
          if (messageList.indexOf(message) === -1) {
            messageList.push(message);
          }
          var childMessage = getMessageWithId(link.childId);
          if (messageList.indexOf(childMessage) === -1) {
            childMessage.categories.forEach(function(category) {
              if (categoryList.indexOf(category) === -1) {
                categoryList.push(category);
                categoryData[category] = 1;
              } else {
                categoryData[category] = categoryData[category] + 1;
              }
            });
            messageList.push(childMessage);
          }
        }
      });
      return categoryData;
    };

    /** count each message categories to display statistics(for found and not found messages separately) */
    var getMessageCategoriesForNotFoundRelations = function() {
      var categoryList = [];
      var messageList = [];
      var categoryData = {};
      givenLinks.forEach(function(link) {
        if (!link.theSameAsGiven && !link.transitiveSameAsGiven) {
          var message = getMessageWithId(link.parentId);
          if (messageList.indexOf(message) === -1) {
            messageList.push(message);
          }
          var childMessage = getMessageWithId(link.childId);
          if (messageList.indexOf(childMessage) === -1) {
            childMessage.categories.forEach(function(category) {
              if (categoryList.indexOf(category) === -1) {
                categoryList.push(category);
                categoryData[category] = 1;
              } else {
                categoryData[category] = categoryData[category] + 1;
              }
            });
            messageList.push(childMessage);
          }
        }
      });
      foundLinks.forEach(function(link) {
        if (!link.theSameAsGiven && !link.transitiveSameAsGiven) {
          var message = getMessageWithId(link.parentId);
          if (messageList.indexOf(message) === -1) {
            messageList.push(message);
          }
          var childMessage = getMessageWithId(link.childId);
          if (messageList.indexOf(childMessage) === -1) {
            childMessage.categories.forEach(function(category) {
              if (categoryList.indexOf(category) === -1) {
                categoryList.push(category);
                categoryData[category] = 1;
              } else {
                categoryData[category] = categoryData[category] + 1;
              }
            });
            messageList.push(childMessage);
          }
        }
      });
      return categoryData;
    };

    var getCategoryNameToDisplay = function(name) {
      var nameToDisplay;
      getAllCategories().forEach(function(d) {
        if (d.name === name) {
          nameToDisplay = d.nameToDisplay;
        }
      });
      return nameToDisplay;
    };

    var getMessageWithId = function(id) {
      var searched;
      messageData.forEach(function(message) {
        if (message.id === id) {
          searched = message;
        }
      });
      return searched;
    };

    // Public API here
    return {
      setMessages: setMessages,
      getMessages: getMessages,
      setFoundLinks: setFoundlinks,
      getFoundLinks: getFoundLinks,
      setGivenLinks: setGivenlinks,
      getGivenLinks: getGivenLinks,
      setModalId: setModalId,
      getModalId: getModalId,
      setAllCategories: setAllCategories,
      getAllCategories: setAllCategories,
      createDataForSandbox: createDataForSandbox,
      getMessageCategoriesForCorrectlyFoundRelations: getMessageCategoriesForCorrectlyFoundRelations,
      getMessageCategoriesForNotFoundRelations: getMessageCategoriesForNotFoundRelations,
      getCategoryNameToDisplay: getCategoryNameToDisplay
    };
  }
]);
