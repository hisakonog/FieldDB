// Set the RequireJS configuration
require.config({
  paths : {
    /* Bootstrap user interface javascript files */
    "bootstrap" : "bootstrap/js/bootstrap",
    "bootstrap-transition" : "bootstrap/js/bootstrap-transition",
    "bootstrap-alert" : "bootstrap/js/bootstrap-alert",
    "bootstrap-modal" : "bootstrap/js/bootstrap-modal",
    "bootstrap-dropdown" : "bootstrap/js/bootstrap-dropdown",
    "bootstrap-scrollspy" : "bootstrap/js/bootstrap-scrollspy",
    "bootstrap-tab" : "bootstrap/js/bootstrap-tab",
    "bootstrap-tooltip" : "bootstrap/js/bootstrap-tooltip",
    "bootstrap-popover" : "bootstrap/js/bootstrap-popover",
    "bootstrap-button" : "bootstrap/js/bootstrap-button",
    "bootstrap-collapse" : "bootstrap/js/bootstrap-collapse",
    "bootstrap-carousel" : "bootstrap/js/bootstrap-carousel",
    "bootstrap-typeahead" : "bootstrap/js/bootstrap-typeahead",
    
    "crypto" : "libs/Crypto_AES",

    /* jQuery and jQuery plugins */
    "jquery" : "libs/jquery",
    "autosize" : "libs/jquery.autosize",
    "hotkeys" : "libs/jquery.hotkeys",
    
    /* Handlebars html templating libraries and compiled templates */
    "compiledTemplates" : "libs/compiled_handlebars",
    "handlebars" : "libs/handlebars.runtime",
    
    /* Backbone Model View Controller framework and its plugins and dependencies */
    "backbone" : "libs/backbone",
    "backbone_pouchdb" : "libs/backbone-pouchdb",
    "backbone_couchdb" : "libs/backbone-couchdb",
    "pouch" : "libs/pouch.alpha",
    "underscore" : "libs/underscore",
    
    "terminal" : "libs/terminal/terminal",
    
    "text" : "libs/text",
    
    "xml2json" : "libs/xml2json"
  },
  shim : {
    "underscore" : {
      exports : "_"
    },
    
    "jquery" : {
      exports : "$"
    },
    
    "bootstrap" :{
      deps : [ "jquery" ],
      exports : function($) {
        return $;
      }
    },
    
    "bootstrap-typeahead" :{
      deps : [ "jquery", "bootstrap","bootstrap-transition", "bootstrap-alert",
          "bootstrap-modal", "bootstrap-dropdown", "bootstrap-scrollspy",
          "bootstrap-tab", "bootstrap-tooltip", "bootstrap-popover",
          "bootstrap-button", "bootstrap-collapse", "bootstrap-carousel"
           ],
      exports : function($) {
        return $;
      }
    },
    
    "pouch" :{
      exports: "Pouch"
    },

    "backbone" : {
      deps : [ "underscore", "jquery", "compiledTemplates" ],
      exports : function(_, $) {
        return Backbone;
      }
    },
    "backbone_pouchdb" :{
      deps : ["backbone", "pouch", "backbone_couchdb"],
      exports : function(Backbone, Pouch, backbone_couchdb) {
        return Backbone;
      }
    },
    
    "backbone_couchdb" :{
      deps : ["backbone", "pouch"],
      exports : function(Backbone, Pouch) {
        return Backbone;
      }
    },

    "handlebars" : {
      deps : ["bootstrap","jquery"],
      exports : "Handlebars"
    },

    "crypto" : {
      exports : "CryptoJS"
    },

    "compiledTemplates" : {
      deps : [ "handlebars" ],
      exports : function(Handlebars) {
        return Handlebars;
      }
    }
    
  }
});

// Initialization
require([
    "app/App",
    "user/User",
    "user/UserWelcomeView",
    "compiledTemplates",
    "backbone",
    "backbone_pouchdb",
    "libs/webservicesconfig_devserver",
    "libs/Utils"
], function(
    App,
    User,
    UserWelcomeView,
    compiledTemplates,
    Backbone,
    forcingpouchtoloadonbackboneearly
) {
  /*
   * Helper functions
   */
  loadFreshApp = function(){
//    document.location.href='sapir_corpus.html';

    Utils.debug("Loading fresh app");
    // Create a UserWelcomeView modal
    var welcomeUserView = new UserWelcomeView();
    welcomeUserView.render();
    $('#user-welcome-modal').modal({
      backdrop : true,
      keyboard : true
    }).css({
      'width' : function() {
        return ($(document).width() * .8 ) + 'px';
      },
      'height' : function() {
        return ($(document).height() * .8 ) + 'px';
      },
      'margin-left' : function() {
        return -($(this).width() * .5 );
      },
      'margin-top' : function() {
        return -($(this).height() * .5 );
      }
    });
    $('#user-welcome-modal').modal("show");
  };
  /*
   * End functions
   */
  
  /*
   * Start the pub sub hub
   */
  window.hub = {};
  Utils.makePublisher(window.hub);
 
    
  /*
   * Check for user's cookie and the dashboard so we can load it
   */
  var username = Utils.getCookie("username");
  if (username != null && username != "") {
//    alert("Welcome again " + username); //Dont need to tell them this anymore, it seems perfectly stable.
    var appjson = localStorage.getItem("mostRecentDashboard");
    appjson = JSON.parse(appjson);
    if (appjson == null){
      alert("We don't know what dashbaord to load for you. Please login and it should fix this problem.");
      document.location.href='user.html';
      return;
    }else if (appjson.length < 3) {
      alert("There was something inconsistent with your prevous dashboard. Please login and it should fix the problem.");
      document.location.href='user.html';
      return;
    }else{
      Utils.debug("Loading app from localStorage");
      var pouchname = null;
      var couchConnection = null;
      if(localStorage.getItem("mostRecentCouchConnection") == "undefined" || localStorage.getItem("mostRecentCouchConnection") == undefined || localStorage.getItem("mostRecentCouchConnection") ==  null){
        alert("We can't accurately guess which corpus to load. Please login and it should fix the problem.");
        document.location.href='user.html';
        return;
      }else{
        if(!localStorage.getItem("encryptedUser")){
          alert("Your corpus is here, but your user details are missing. Please login and it should fix this problem.");
          document.location.href='user.html';
          return;
        }else{
          a = new App();
          window.app = a;
          var auth = a.get("authentication");
          var u = localStorage.getItem("encryptedUser");
          auth.loadEncryptedUser(u, function(success, errors){
            if(success == null){
              alert("We couldn't load your user."+errors.join("<br/>") + " " + Utils.contactUs);  
              loadFreshApp();
              return;
            }else{
              document.location.href='corpus.html';
            }
          });
        }
      }
    }
  } else {
    //new user, let them register or login as themselves or sapir
    loadFreshApp();

 }
  
  
});