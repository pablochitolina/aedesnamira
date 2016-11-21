// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', [, 'ngRoute', 'base64', 'duScroll']);


app.config(function($routeProvider) {

  $routeProvider
   /* .when('/principal', {
      templateUrl: '/templates/principal.html', 
      controller: 'PrincipalCtrl'
    })*/
    .when('/principal/:idservico', {
      templateUrl: '/templates/principal.html', 
      controller: 'PrincipalCtrl'
    })
    .when('/principal/:idservico/:cidadeParams', {
      templateUrl: '/templates/principal.html', 
      controller: 'PrincipalCtrl'
    })
    .when('/principal', {
      templateUrl: '/templates/principal.html', 
      controller: 'PrincipalCtrl'
    })
    /*.when('/tags/:tagId', {
      templateUrl: '/partials/template2.html', 
      controller:  'ctrl2'
    })
    .when('/another', {
      templateUrl: '/partials/template1.html', 
      controller:  'ctrl1'
    })*/
    .otherwise({ redirectTo: '/principal' });

});
