var jenkins = new require('./jenkins'),
appServerLib = new require('./appServer'),
co = require("co");

module.exports = function( io, constants ) {
	

	// Test notifier
	//setTimeout( () => {io.emit('sendMsg', { title : 'Hello', msg : 'World!'}); }, 5000)

	var 
		startAppServerCheck = true,
		emitUpdate = () => {
			io.emit('updateJenkins', jenkins.getJobs( ) );
		},
		updateWbbApp = () => {
			try {
				jenkins.update_wbb_app().then(() => {
		        	emitUpdate();
		        	setTimeout( updateWbbApp, 1000 );
				}).catch(()=>{
					console.log('Error in wbb-app');
					updateWbbApp();
				});
			} catch( e ) {
				console.log('Error in wbb-app');
				updateWbbApp();
			}
		},
		updateWbbLib = () => {
			try {
				jenkins.update_wbb_lib().then(() => {
		        	emitUpdate();
		        	setTimeout( updateWbbLib, 1000 );
				}).catch(()=>{
					console.log('Error in wbb-lib');
					updateWbbLib();
				});
			} catch( e ) {
				console.log('Error in wbb-lib');
				updateWbbLib();
			}
		},
		updateWbbWs = () => {
			try {
				jenkins.update_wbb_ws().then(() => {
		        	emitUpdate();
		        	setTimeout( updateWbbWs, 1000 );
				}).catch(()=>{
					console.log('Error in wbb-ws');
					updateWbbWs();
				});
			} catch( e ) {
				console.log('Error in wbb-ws');
				updateWbbWs();
			}
		};
		updateDeploys = () => {
			try {
				jenkins.update_deploys().then(() => {
		        	io.emit('updateDeploys', jenkins.getDeploys( ) );
		        	if( startAppServerCheck ) {
		        		startAppServerCheck = false;
						updateAppServers();
		        	}
		        	setTimeout( updateDeploys, 1000 );
				}).catch(()=>{
					console.log('Error in update deploys');
					updateDeploys();
				});
			} catch( e ) {
				console.log('Error in update deploys');
				updateDeploys();
			}
		};
		updateAppServers = () => {
			try {
				jenkins.update_servers().then(() => {
		        	io.emit('updateDeploys', jenkins.getDeploys( ) );
		        	setTimeout( updateAppServers, 1000 );
				}).catch(()=>{
					console.log('Error in update Server');
					updateAppServers();
				});
			} catch( e ) {
				console.log('Error in update servers');
				updateAppServers();
			}
		};

	updateWbbApp();
	updateWbbLib();
	updateWbbWs();
	updateDeploys();
};


