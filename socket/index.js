'use strict';

module.exports.listen = function( http, config, constants ){
	
	var io = require('socket.io')(http),
	fs = require('fs'),
	folder = null, 
	subSocket = null,
	path = null,
	localConfig = null,
	routes = config.routes,
	PUBLIC = './public/',
	CONFIG = '/config.js',
	DISCLAIMER = '/* This file is auto generated. Do NOT write to this file */\n';
	
	for( folder in routes ) {

		if( fs.existsSync('./controller/' + folder) ) {

			/* Write Socket info to client config file */
			path = PUBLIC + folder + CONFIG;

			localConfig = 'var config = { ';
			localConfig += '"socketConnection" : "http://' + config.domain + ':' + config.port + '/' + routes[ folder ] + '"';
			localConfig += ' };';

			fs.createWriteStream( path, { overwrite : true } );
			fs.writeFileSync( path , DISCLAIMER + localConfig );

			subSocket = io.of( '/' + routes[ folder ] );
			require( '../controller/' + folder )( subSocket, constants );
		}
	}

    return io;
}