'use strict';

var App = angular.module('app', [])
	.factory( 'socket', function( $rootScope ) {
		var socket = io.connect( config.socketConnection );
		return {
		    on: function (eventName, callback) {
		      socket.on(eventName, function () {  
		        var args = arguments;
		        $rootScope.$apply(function () {
		          callback.apply(socket, args);
		        });
		      });
		    },
		    emit: function (eventName, data, callback) {
		      socket.emit(eventName, data, function () {
		        var args = arguments;
		        $rootScope.$apply(function () {
		          if (callback) {
		            callback.apply(socket, args);
		          }
		        });
		      })
		    }
		  };

	})
  	.controller('DashboardCtrl', [ '$scope', 'socket', function( $scope, socket ) {
    	$scope.jenkins = [];
    	$scope.deploys = [];

    	socket.on( 'updateDeploys', function( data ) {
    		$scope.deploys = data;
    	});

    	socket.on( 'updateJenkins', function( data ) {
    		$scope.jenkins = data;
    	});

  }]);