let co = require("co"),
request = require("co-request"),
servers = require('./servers.json');

module.exports = new function() {
	var self = this;

	self.getAppServer = function* ( server ) {
	  try {
	    let result = yield request(server.URL); 
	    let status = result.statusCode;
	    let hasSignOnPage = result.body.indexOf('SignonInitServlet') != -1 || result.body.indexOf('wbb-ui-app') != -1;
	    server.hasSignOnPage = hasSignOnPage;
	    server.status = status;
	    server.warn = status != 404 && !hasSignOnPage;
	  } catch (e) {
	    server.status = 404;
	    server.hasSignOnPage = false;
	  }

	  return server;
	};

	return new function() {
		this.servers = servers;
		this.getAppServer = function( server ) {
			return co( self.getAppServer(server) );
		};
	};
}

