/**
 * @ngdoc overview
 * @name visArgueClientApp
 * @description
 * # visArgueClientApp
 *
 * Main module of the application.
 */
angular
  .module("visArgueClientApp", [
    "ngAnimate",
    "ngAria",
    "ngCookies",
    "ngMessages",
    "ngResource",
    "ngSanitize",
    "ui.bootstrap",
    "ui.router",
    "ngMaterial",
    "ngFileUpload",
    "dndLists",
    "mp.colorPicker",
    "validation.match",
    "md.data.table",
    "angular-bind-html-compile",
    "colorpicker.module",
    "ngStomp",
    "ui.tree",
    "xeditable",
    "ngTagsInput",
    "ngDragDrop",
    "angular-intro",
    "ngStorage",
    "angular-toArrayFilter",
    "rzModule"
  ])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$locationProvider",
    "$httpProvider",
    "$mdThemingProvider",
    function(
      $stateProvider,
      $urlRouterProvider,
      $locationProvider,
      $httpProvider,
      $mdThemingProvider
    ) {
      "use strict";

      $mdThemingProvider
        .theme("default")
        // .dark();
        .primaryPalette("teal")
        .accentPalette("teal", {
          default: "500"
        });

      // HTML5 PUSH STATE
      $locationProvider.html5Mode(true).hashPrefix("!");

      $urlRouterProvider.otherwise("/");

      $stateProvider
        .state("main", {
          url: "/",
          title: "Main",
          templateUrl: "views/login.html",
          controller: "LoginCtrl as ctrl"
        })
        .state("preprocessing", {
          url: "/preprocessing",
          title: "Preprocessing",
          views: {
            "": {
              templateUrl: "views/preprocessing.html"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.preprocessing.html",
              controller: "IHTMStreamingSettingsController as ctrl"
            },
            "sidebar-details": {
              templateUrl: "html-templates/sidebar.details.preprocessing.html",
              controller: "IHTMStreamingDetailController as ctrl"
            }
          }
        })
        .state("login", {
          url: "/login",
          title: "Login",
          templateUrl: "views/login.html",
          controller: "LoginCtrl as ctrl"
        })
        .state("alignment", {
          abstract: true,
          url: "/alignment",
          template: "<ui-view/>"
          //templateUrl: 'views/alignment.html'
        })
        .state("alignment.features", {
          url: "/features",
          title: "Text-Feature Settings",
          templateUrl: "views/alignment.features.html"
        })
        .state("alignment.vis", {
          url: "/vis",
          title: "Alignment Visualization",
          templateUrl: "views/alignment.vis.html"
        })
        .state("topicmodelling", {
          url: "/topicmodelling",
          templateUrl: "views/topicmodelling.html"
        })
        .state("users", {
          url: "/users",
          templateUrl: "views/users.html"
        })
        .state("profile", {
          url: "/profile",
          title: "Profile",
          templateUrl: "views/profile.html",
          controller: "ProfileCtrl as ctrl"
        })
        .state("sessions", {
          url: "/sessions",
          templateUrl: "views/sessions.html",
          controller: "SessionsCtrl as ctrl"
        })
        .state("metrics", {
          url: "/metrics",
          templateUrl: "views/metrics.html",
          controller: "MetricsCtrl as ctrl"
        })
        .state("apiurl", {
          url: "/apiurl",
          templateUrl: "views/apiurl.html",
          controller: "ApiUrlCtrl as ctrl"
        })
        .state("argumentation", {
          url: "/argumentation",
          views: {
            "": {
              templateUrl: "views/argumentation.html"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.newGlyphs.html"
            }
          }
        })
        .state("table", {
          url: "/table",
          parent: "argumentation",
          views: {
            table: {
              templateUrl: "views/argumentation-table.html"
            }
          }
        })
        .state("topicSpace", {
          url: "/topics?id&all",
          title: "Topic Space",
          views: {
            "": {
              templateUrl: "views/topicSpace.html"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.topicSpace.html"
            }
          }
        })
        .state("newGlyphs", {
          url: "/newGlyphs?speakers&glyphTable&x&y",
          parent: "argumentation",
          views: {
            table: {
              templateUrl: "views/argumentation-newGlyphs.html"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.newGlyphs.html"
            }
          }
        })
        .state("clusters", {
          url: "/clusters",
          parent: "argumentation",
          views: {
            table: {
              templateUrl: "views/argumentation-pca.html"
            }
          }
        })
        .state("episodes", {
          url: "/episodes",
          title: "Episodes",
          views: {
            "": {
              templateUrl: "views/episodes.html",
              controller: "MainEpisodesCtrl as ctrl"
            },
            "sidebar-details": {
              templateUrl: "html-templates/sidebar.details.episodes.html",
              controller: "LeftCtrlForEpisodes as ctrl"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.episodes.html",
              controller: "RightCtrlForEpisodes as ctrl"
            }
          }
        })
        .state("episodesWithGlyphs", {
          url: "/episodesWithGlyphs",
          title: "Episodes with Glyphs",
          views: {
            "": {
              templateUrl: "views/episodesWithGlyphs.html"
            }
          }
        })
        .state("lexicalUnits", {
          url: "/lexicalUnits",
          title: "Lexical units",
          views: {
            "": {
              templateUrl: "views/lexicalUnits.html",
              controller: "MainLexicalUnitsCtrl as ctrl"
            },
            "sidebar-details": {
              templateUrl: "html-templates/sidebar.details.episodes.html",
              controller: "LeftCtrlForLexicalUnits as ctrl"
            }
          }
        })
        .state("statistics", {
          url: "/statistics",
          title: "Statistics",
          views: {
            "": {
              templateUrl: "views/statistics.html"
            }
          }
        })
        .state("demo", {
          url: "/demo",
          title: "Demo",
          views: {
            "": {
              templateUrl: "views/demo.html"
            }
          }
        })
        .state("contributors", {
          url: "/contributors",
          title: "Contributors",
          views: {
            "": {
              templateUrl: "views/contributors.html"
            }
          }
        })
        .state("speakers", {
          url: "/speakers",
          views: {
            "": {
              templateUrl: "views/speakers.html"
            }
          }
        })
        .state("speakerBusinessCards", {
          url: "/speakerBusinessCards",
          title: "Speaker Business Card",
          views: {
            "": {
              templateUrl: "views/speakerBusinessCards.html"
            }
          }
        })
        .state("namedEntities", {
          url: "/namedEntities",
          title: "Named Entities",
          views: {
            "": {
              templateUrl: "views/namedEntities.html",
              controller: "MainNamedEntitiesCtrl as ctrl"
            },
            "sidebar-details": {
              templateUrl: "html-templates/sidebar.details.namedEntities.html"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.namedEntities.html",
              controller: "RightCtrlForNamedEntities as ctrl"
            }
          }
        })
        .state("ihtmVis", {
          url: "/ihtmVis",
          views: {
            "": {
              templateUrl: "views/topicVisIHTM.html",
              controller: "MainTopicVisIHTMCtrl as ctrl"
            }
          }
        })
        .state("bubbleTalk", {
          url: "/bubbleTalk",
          views: {
            "": {
              templateUrl: "views/bubbleTalk.html",
              controller: "MainBubbleTalkCtrl as ctrl"
            }
          }
        })
        .state("topicsummarizer", {
          url: "/topicSummarizer",
          views: {
            "": {
              templateUrl: "views/topicSummarizer.html",
              controller: "MainTopicSummarizerCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl:
                "html-templates/sidebar.settings.topicSummarizer.html",
              controller: "RightCtrlForTopicSummarizer as ctrl"
            }
          }
        })
        .state("mdsVisualization", {
          url: "/mdsVisualization",
          views: {
            "": {
              templateUrl: "views/mdsVisualization.html",
              controller: "MainMdsVisualizationCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl:
                "html-templates/sidebar.settings.mdsVisualization.html",
              controller: "RightCtrlForMdsVisualization as ctrl"
            }
          }
        })
        .state("topicMatching", {
          url: "/topicMatching",
          views: {
            "": {
              templateUrl: "views/topicMatching.html",
              controller: "MainTopicMatchingCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.topicMatching.html",
              controller: "RightCtrlForTopicMatching as ctrl"
            }
          }
        })
        .state("closeAndDistantReading", {
          url: "/closeAndDistantReading",
          views: {
            "": {
              templateUrl: "views/closeAndDistantReading.html",
              controller: "MainCloseAndDistantReadingCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl:
                "html-templates/sidebar.settings.closeAndDistantReading.html",
              controller: "RightCtrlForCloseAndDistantReading as ctrl"
            }
          }
        })
        .state("threadReconstruction", {
          url: "/threadReconstruction",
          views: {
            "": {
              templateUrl: "views/threadReconstruction.html",
              controller: "ThreadReconstructionCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl:
                "html-templates/sidebar.settings.threadReconstruction.html",
              controller: "RightCtrlForThreadReconstruction as ctrl"
            }
          }
        })
        .state("arguments", {
          url: "/arguments",
          views: {
            "": {
              templateUrl: "views/arguments.html",
              controller: "MainArgumentationCtrl as ctrl"
            },
            "sidebar-settings": {
              templateUrl: "html-templates/sidebar.settings.arguments.html",
              controller: "ArgumentsSettingsCtrl as ctrl"
            }
          }
        });

      //INTERCEPTORS
      /* Register error provider that shows message on failed requests or redirects to login page on
       * unauthenticated requests */
      $httpProvider.interceptors.push(function(
        $q,
        $rootScope,
        $location,
        $injector
      ) {
        return {
          responseError: function(rejection) {
            var status = rejection.status,
              config = rejection.config,
              method = config.method,
              url = config.url;

            var alertService = $injector.get("alertService");
            var cookieStore = $injector.get("$cookieStore");

            if (status === 401) {
              var state = $injector.get("$state");

              delete $rootScope.user;
              delete $rootScope.authToken;
              cookieStore.remove("authToken");
              if (state.current.name !== "login") {
                alertService.error("Please log in first");
                state.go("login");
              }
            } else if (status === 409) {
              $injector.get("$state").go("preprocessing");
              alertService.error("You must preprocess the data first");
            } else {
              if (url !== "/VERSION.json") {
                if (
                  rejection.data !== null &&
                  rejection.data.message !== null
                ) {
                  alertService.exception(rejection.data);
                } else {
                  alertService.error(
                    method + " on " + url + " failed with status " + status
                  );
                }
              }
            }

            return $q.reject(rejection);
          }
        };
      });

      /* Registers auth token interceptor, auth token is either passed by header or by query parameter
       * as soon as there is an authenticated user */
      $httpProvider.interceptors.push(function($q, $rootScope) {
        return {
          request: function(config) {
            config.headers["X-Auth-Token"] = $rootScope.authToken;
            //config.headers['X-CSRF-TOKEN'] = $rootScope.csrfToken;
            return config || $q.when(config);
          },
          response: function(response) {
            var csrfToken = response.headers("X-CSRF-TOKEN");
            if (csrfToken) {
              $rootScope.csrfToken = csrfToken;
              console.log("X-CSRF-TOKEN: " + csrfToken);
            }
            return response;
          }
        };
      });

      $httpProvider.defaults.xsrfHeaderName = "X-CSRF-TOKEN";
    }
  ])
  .run(function(
    $rootScope,
    $cookieStore,
    UserService,
    $state,
    $http,
    APIURL,
    alertService,
    VISCOOKIE,
    socketService
  ) {
    "use strict";

    //here some stupid variable initializing
    $rootScope.preprocessing = {};
    $rootScope.preprocessing.ispreprocessing = false;
    $rootScope.preprocessing.ispreprocessed = false;
    $rootScope.preprocessing.ispreprocessed = false;

    if ($cookieStore.get("preprocessing") !== undefined) {
      $rootScope.preprocessing = $cookieStore.get("preprocessing");
    }

    $rootScope.$on("$stateChangeSuccess", function(
      event,
      nextState,
      toParams,
      from
    ) {
      $rootScope.previousState = from;
      $rootScope.title = nextState.title + " | LingVis";
    });

    $rootScope.hasRole = function(role) {
      if ($rootScope.user === undefined) {
        return false;
      }

      if ($rootScope.user.roles[role] === undefined) {
        return false;
      }

      return $rootScope.user.roles[role];
    };

    $rootScope.logout = function() {
      $http
        .post(APIURL + "user/logout", {})
        .then(function() {
          delete $rootScope.user;
          delete $rootScope.authToken;
          $cookieStore.remove("authToken");
          $state.go("login");
          alertService.success("Successfully signed out");
        })
        .catch(function(/*data*/) {
          delete $rootScope.user;
          delete $rootScope.authToken;
          $cookieStore.remove("authToken");
          $state.go("login");
        });

      //we do that here anyway :)
      $rootScope.preprocessing.ispreprocessing = false;
      $rootScope.preprocessing.ispreprocessed = false;
      $rootScope.preprocessing.files = null;
      $cookieStore.put("preprocessing", $rootScope.preprocessing);
      socketService.disconnect();
    };

    $rootScope.isLoggedIn = function() {
      return typeof $rootScope.authToken !== "undefined";
    };

    if ($cookieStore.get(VISCOOKIE) !== undefined) {
      $rootScope.vissel = $cookieStore.get(VISCOOKIE);
    } else {
      $rootScope.vissel = {};
    }

    /* Try getting valid user from cookie or go to login page */
    var origState = $state.current,
      authToken = $cookieStore.get("authToken");
    $state.go("login");
    if (authToken !== undefined) {
      $rootScope.authToken = authToken;
      UserService.get(
        function(user) {
          $rootScope.user = user;
          if (origState !== undefined && origState.abstract === false) {
            $state.go(origState);
          }
        },
        function(error) {
          console.error(error);
        }
      );
    }

    $rootScope.initialized = true;
  });
