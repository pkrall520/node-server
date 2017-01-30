'use strict';

(function() {
var 
	express = require( 'express' ),
	app = express( ), 
	http = require( 'http' ).Server( app ), 
	path = require( 'path' ),
	config = require( './config' ),
	constants = require('./const.json');
	
	require('./routes') ( app, config.routes );
	require('./socket').listen( http, config, constants );

	http.listen( config.port, function( ) {
	  console.log( 'listening on *:' + config.port );
	});

})();