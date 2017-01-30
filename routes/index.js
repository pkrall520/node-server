'use strict';
module.exports = function ( app, routes ) {

	var 
		path = require( 'path' ),
		express = require( 'express' ),
		root = path.join( __dirname, './..' );

	// Static Paths
  	app.use( '/lib',  express.static( path.join( root, '/lib' ) ) );
	app.use( '/', express.static( path.join( root, '/public' ) ) );

	for( var folder in routes ) {
		app.use( '/' + routes[ folder ], express.static( path.join( root, '/public/' + folder ) ) );
	}
};