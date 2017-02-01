let co = require("co"),
request = require("co-request"),
appServerLib = new require('./appServer'),
constants = require('../../const.json');

module.exports = new function( ) {
	var 
		auth = constants.JENKINS.user + ':' + constants.JENKINS.pass + '@',
		JENKINS = {
		  deploys : 'https://' + auth + 'jnk-master1.pncint.net/job/RTL-OLB/job/WBB/job/Deployments/api/json?pretty=true',
		  building_wbb_app : 'https://' + auth + 'jnk-master1.pncint.net/job/RTL-OLB/job/WBB/job/wbb-app/api/json?tree=jobs[name,builds[fullDisplayName,building,result]]',
		  building_wbb_lib : 'https://' + auth + 'jnk-master1.pncint.net/job/RTL-OLB/job/WBB/job/wbb-lib/api/json?tree=jobs[name,builds[fullDisplayName,building,result]]',
		  building_wbb_ws : 'https://' + auth + 'jnk-master1.pncint.net/job/RTL-OLB/job/WBB/job/wbb-ws/api/json?tree=jobs[name,builds[fullDisplayName,building,result]]'
		},
		self = this, 
		setBuilding = ( jobs, fieldName ) => {
			jobs = jobs.map( job => {
				if( job.builds ) {
					job[fieldName] = job.builds.filter( build => build.building ).length > 0;
				}
				delete job.builds;
				delete job._class;
				return job;
			});
		},
		extractJobs = ( response )=> {
			body = JSON.parse( response.body );
			let jobs;
			jobs = body.jobs
			return jobs;
		},
		merge = ( jobs1, jobs2 ) => {
			for( key2 in jobs2 ) {
				var hasKey = false;
				for( key1 in jobs1 ) {
					if( jobs1[ key1].name === jobs2[key2].name ) {
						hasKey = true;
					  	Object.assign(jobs1[key1], jobs2[key2] );
					}
				}
				if( !hasKey ) {
					jobs1.push( jobs2[key2] )
				}
			}
		};

	self.jobs = [];
	self.deploys = [];
	self.update_wbb_app = function* () {
		let response = yield request( JENKINS.building_wbb_app ); 
	    merge( self.jobs, extractJobs( response ) );
	    setBuilding( self.jobs, 'wbb_app_building');
	};
	self.update_wbb_lib = function* () {
		let response = yield request( JENKINS.building_wbb_lib ); 
	    merge( self.jobs, extractJobs( response ) );
	    //console.log(self.jobs.filter( ( job => job.name == 'LiveEngageDev') ) );
	    setBuilding( self.jobs, 'wbb_lib_building');
	};
	self.update_wbb_ws = function* () {
		let response = yield request( JENKINS.building_wbb_ws ); 
	    merge( self.jobs, extractJobs( response ) );
	    setBuilding( self.jobs, 'wbb_ws_building');
	};
	self.update_deploys = function* () {
		let response = yield request( JENKINS.deploys ); 
		let { jobs : deploys } = JSON.parse( response.body );
		deploys.forEach( deploy => {
			deploy.isDeploying = ( deploy.color === 'blue_anime' || deploy.color === 'red_anime' );
		});
		merge( self.deploys, deploys );
	};
	self.update_servers = function* () {
		appServerLib.servers.forEach( server => {
			// Start Cluster Thread
			let cluster = server.appServers.map( appServer => {
				return appServerLib.getAppServer( appServer );
			});
			
			// Wait for thread to return then map cluster
			Promise.all( cluster ).then( function( apps ) {
				self.deploys.forEach ( deploy => {
					if( deploy.name == server.name ) {
						deploy['appServers'] = apps;
						deploy['warn'] = apps.filter( app => app.warn ).length > 0;
					}
				});
			});
		});
	};

	return new function() {
		this.update_wbb_app = function() {
			return co( self.update_wbb_app );
		};

		this.update_servers = function() {
			return co( self.update_servers );
		};

		this.update_wbb_lib = function() {
			return co( self.update_wbb_lib );
		};

		this.update_wbb_ws = function() {
			return co( self.update_wbb_ws );
		};

		this.update_deploys = function() {
			return co( self.update_deploys );
		};

		this.getDeploys = function() {
			return self.deploys;
		};

		this.getJobs = function() {
			return self.jobs;
		};
	};
};