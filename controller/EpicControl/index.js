module.exports = function( io ) {
	var 
		moment = require('moment'),
		fs = require('fs'),
		json2csv = require('json2csv'),
		epics = [],
		branches = [],
		BRANCH_HEADERS = ['name', 'env', 'manager', 'index', 'deploys'],
		BRANCHES_FILE = 'branches.csv',
		EPIC_HEADERS = ['name','branch', 'index', 'people'],
		EPIC_FILE = 'epics.csv',
		toFile = function( json, fields, filename ) {
			json2csv({ data: json, fields: fields }, function(err, csv) {
			  if (err) console.log(err);
			  fs.writeFile(filename, csv, function(err) {
				    if(err) {
				        return console.log(err);
				    }
				}); 
			});
		};

		toFile(branches, BRANCH_HEADERS, BRANCHES_FILE);
		toFile(epics, EPIC_HEADERS, EPIC_FILE);
	
	io.on('connection', function(socket){

		socket.emit('update_epics', epics);
		socket.emit('update_branches', branches);

		socket.on('update_branch_info', function( branch ) {
			if( branch.index == undefined ) {
				branch.index = branches.length;
			} else {
				var i = branches.length;
	 			for( ; i-- ; ) {
	 				if( branches[i].index == branch.index ) {
	 					branches.splice(i, 1);
	 				}
	 			}
			}
			branches.push( branch );
			toFile(branches, BRANCH_HEADERS, BRANCHES_FILE);
 			io.emit('update_branches', branches);
 		});

 		socket.on( 'delete_branch', function( branch ) {
 			var i = branches.length;
 			for( ; i-- ; ) {
 				if( branches[i].index == branch.index ) {
 					branches.splice(i, 1);
 				}
 			}
 			toFile(branches, BRANCH_HEADERS, BRANCHES_FILE);
 			io.emit('update_branches', branches);
 		});

		socket.on('update_epic_info', function( epic ) {

			if( epic.index == undefined ) {
				epic.index = epics.length;
			} else {
				var i = epics.length;
	 			for( ; i-- ; ) {
	 				if( epics[i].index == epic.index ) {
	 					epics.splice(i, 1);
	 				}
	 			}
			}
			epics.push( epic );
			toFile(epics, EPIC_HEADERS, EPIC_FILE);
 			io.emit('update_epics', epics);
 		});

 		socket.on( 'delete_epic', function( data ) {
 			var i = epics.length;
 			for( ; i-- ; ) {
 				if( epics[i].index == data.index ) {
 					epics.splice(i, 1);
 				}
 			}
 			toFile(epics, EPIC_HEADERS, EPIC_FILE);
 			io.emit('update_epics', epics);
 		});
	});
};