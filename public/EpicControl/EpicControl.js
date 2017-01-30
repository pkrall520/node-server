function EpicControl() {
	var
   		socket = io.connect( config.socketConnection ),
   		_branches = [],
   		_epics = [],
		people = {
			bsa : [
				'Genevieve Devivo',
				'Jamie Linder',
				'Kristen Keeley',
				'Lisa Deyarmin'
			],
			java : [
				'Beth Beary',
				'Guhan S Sundaram',
				'Jeff Mosca',
				'Sivashankar Nandakumar'
			],
			ui : [
				'Jason Yeager',
				'Phill Krall',
				'Ryan Jackson',
				'Sean Patnode'
			],
			po : [
				'Jason Gurney',
				'Kim Blackstone',
				'Manny Wiggins',
				'Kristen Miller',
				'Leah Rubenstein'
			],
			qa : [
				'Aney Jaxon',
				'Aparajita Thakur',
				'Kamran Ibrahim',
				'Kristen Burja',
				'Mohsin Iqbal',
				'Shilpi Katoch',
				'Vamsi Alapati'
			]
		},
		env = [
		'P1',
		'P2',
		'P3',
		'P4',
		'P5',
		'P6',
		'P7',
		'P8',
		'P9',
		'QA',
		'Q1',
		'Q2',
		'Q3',
		'Q4',
		'Q5',
		'Q6',
		'Q7',
		'Q8',
		'Q9'
		],
		dateTimeCounter = 1,
		personCounter = 0,
		_createPeopleSection = function() {
			var 
			createHeader = function( group ) {
				return $('<div>', { class : group } )
					.append( $('<b>', { text : group.toUpperCase() } ) );
			},
			createPerson = function( person ) {
				var _id = 'personChk-' + personCounter++;
				return $('<div>', { class : 'col-sm-4' } )
					.append( $('<input>', { type : 'checkbox', id : _id, 'data-value' : person }))
					.append( $('<label>', { text : person, for : _id } ) );
			};
			for( group in people ) {
				var 
					groupHeader = createHeader( group ),
					row = $('<div>', { class : 'row'} ),
					rowCounter = 0;

				for( var i = 0; i < people[group].length; i++ ) {
					rowCounter++;
					row.append( createPerson( people[group][i] ) );
					if( rowCounter == 3 || ( i +1 == people[group].length ) ) {
						groupHeader.append( row );
						row = $('<div>', { class : 'row'} );
						rowCounter = 0;
					}
				}
				groupHeader.append( $('<br>') );
				$('#newEpicPeople').append( groupHeader );
			}
		},
		_addDateTime = function() {
			var 
				_id = 'dailyDeploy-' + dateTimeCounter++;

			$('#extraDateTime')
				.append( $('<div>', { class : 'input-group date datetimepicker' } )
					.append( $('<input>', { type : 'text', class : 'form-control datetime', 'data-checkbox' : _id } ) )
					.append( $('<span>', { class : 'input-group-addon' } ) 
						.append( $('<span>', { class : 'glyphicon glyphicon-calendar' } ) )
					)

				)
				.append( $('<input>', { type : 'checkbox', id : _id } ) )
				.append( $('<label>', { for : _id, text : 'Daily Deploy Time' } ) );
			$('.datetimepicker').datetimepicker();	
		},
		_createEnvDropDown = function() {
			$('#branchEnv').append( $('<option>', { disabled : 'disabled', selected : 'selected', value : 'Notselected', text : 'Not Selected' } ) )
			for( var i = 0; i < env.length; i++ ) {
				$('#branchEnv').append( $('<option>', { value : env[i], text : env[i] } ) )
			}
		},
		_createNewBranch = function() {
			var 
				update  = ( $('#editNewBranch').css('display') == 'none' ? false : true ),
				data = {
				name : $('#branchName').val(),
				env : $('#branchEnv').val(), 
				manager : $('#branchManager').val(),
				index : ( update ? $('#branchName').attr('data-index') : undefined ),
				deploys : []};
			$('.datetime').each( function() {
				data.deploys.push({
					dateTime : $(this).val(),
					daily : $( '#' + $(this).attr('data-checkbox') ).prop('checked')
				});
			});
			socket.emit( 'update_branch_info', data );
			_clearEditBranch();
			$('#newBranchBtn').prop('checked', false);
		},
		_editBranch = function(  ) {
			var index = $(this).attr('branch-index'), branch = null;
			for( var i = 0; i < _branches.length; i++ ) {
				if( _branches[i].index == index ) {
					branch = _branches[i];
					$('#newBranchBtn').prop('checked', true);
					$('#branchName').val(branch.name);
					$('#branchName').attr('data-index', branch.index);
					$('#branchEnv').val(branch.env);
					$('#branchManager').val(branch.manager);
					$('#addBranch').hide();
					$('#editNewBranch').show();

					$('.datetime').val( moment( branch.deploys[0].dateTime ).format('L h:mm a') );
					$('#dailyDeploy-0').prop('checked', branch.deploys[0].daily );
					if( branch.deploys.length > 1 ) {
						for( var j = 1; j < branch.deploys.length; j++ ) {
							_addDateTime();
							$('input[data-checkbox=dailyDeploy-' + ( dateTimeCounter -1) + ']' ).val( moment( branch.deploys[j].dateTime ).format('L h:mm a') );
							$('#dailyDeploy-' + ( dateTimeCounter -1) ).prop('checked', branch.deploys[j].daily );
						}
					}
				}
			}
		},
		_deleteBranch = function() {
			var data = { index : $('#branchName').attr('data-index') };
			socket.emit( 'delete_branch', data );
			_clearEditBranch();
			$('#newBranchBtn').prop('checked', false);
		},
		_clearEditBranch = function() {
			$('#branchName').val('');
			$('#branchEnv').val('Notselected');
			$('#branchManager').val('');
			$('.datetime').val('');
			$('#dailyDeploy-0').prop('checked', false);
			$('#extraDateTime').empty();
			$('#branchName').removeAttr('data-index');
			$('#addBranch').show();
			$('#editNewBranch').hide();
			dateTimeCounter = 1;
		},
		_clearEditEpic = function() {
			$('#epicName').val('');
			$('#epicName').removeAttr('data-index');
			$('#epicBranch').val('');
			$('#newEpicPeople input:checked').prop('checked', false);
			$('#addEpicBtn').show();
			$('#editNewEpic').hide();
		},
		_createNewEpic = function() {

			var 
				update  = ( $('#editNewEpic').css('display') == 'none' ? false : true ),
				data = {
					name : $('#epicName').val(),
					branch : $('#epicBranch').val(), 
					index : ( update ? $('#epicName').attr('data-index') : undefined ),
					people : {
						bsa : [],
						java : [],
						ui : [],
						po : [],
						qa : []
					}};
			$('#newEpicPeople .bsa input:checked').each( function() {
				data.people.bsa.push( $(this).attr('data-value') );
			});
			$('#newEpicPeople .java input:checked').each( function() {
				data.people.java.push( $(this).attr('data-value') );
			});
			$('#newEpicPeople .ui input:checked').each( function() {
				data.people.ui.push( $(this).attr('data-value') );
			});
			$('#newEpicPeople .po input:checked').each( function() {
				data.people.po.push( $(this).attr('data-value') );
			});
			$('#newEpicPeople .qa input:checked').each( function() {
				data.people.qa.push( $(this).attr('data-value') );
			});
			socket.emit( 'update_epic_info', data );
			_clearEditEpic();
			$('#newEpicBtn').prop('checked', false);
		},
		_editEpic = function() {
			var index = $(this).attr('epic-index'), epic = null;
			for( var i = 0; i < _epics.length; i++ ) {
				if( _epics[i].index == index ) {
					epic = _epics[i];
					$('#epicName').val( epic.name );
					$('#epicBranch').val( epic.branch );
					$('#epicName').attr('data-index', epic.index );
					$('#newEpicBtn').prop('checked', true);
					$('#addEpicBtn').hide();
					$('#editNewEpic').show();
					for( group in epic.people ) {
						for( var j = 0; j < epic.people[group].length; j++ ) {
							$('input[data-value="' + epic.people[group][j] + '"]').prop('checked', true);
						}
					}
				}
			}
		},
		_deleteEpic = function() {
			var data = { index : $('#epicName').attr('data-index') };
			socket.emit( 'delete_epic', data );
			_clearEditEpic();
			$('#newEpicBtn').prop('checked', false);
		},
		_updateEpicBranches = function() {
			$('#epicBranch').empty();
			for( var i = 0; i < _branches.length; i++ ) {
				$('#epicBranch').append( $('<option>', { text : _branches[i].name, value : _branches[i].name } ) );
			}
			if( $('#epicBranch option').length == 0 ) {
				$('#addEpicBtn').addClass('disabled').prop('disabled', 'disabled');
			} else {
				$('#addEpicBtn').removeClass('disabled').removeAttr('disabled');
			}
		},
		_init = function() {
			_createPeopleSection();
			_createEnvDropDown();
			$('.datetimepicker').datetimepicker();
			$('#addDateTime').click( _addDateTime );
			$('#addBranch').click( _createNewBranch );
			$('label[for=newBranchBtn]').click( _clearEditBranch );
			$('#editBranch').click(_createNewBranch);
			$('#deleteBranch').click(_deleteBranch);
			$('#addEpicBtn').click( _createNewEpic );
			$('label[for=newEpicBtn]').click( _clearEditEpic );
			$('#editEpic').click( _createNewEpic );
			$('#deleteEpic').click( _deleteEpic );
		};

		socket.on( 'update_epics', function( epics ) {
			_epics = epics;
			var body = $('.body').empty(),
				row = $('<div>', { class : 'row'} ),
				rowCounter = 0,
				createSetting = function( text, value ) {
					return $('<p>', { text : value } ).prepend( $('<b>', { class : 'field', text : text + ' : ' } ) ).append( $('<br>') ) ;
				};
			for( var i = 0; i < epics.length; i++ ) {
				var 
					epic = epics[i],
					div = $('<div>', { class : 'col-sm-2 well' });
					header = $('<div>', { class : 'header' }),
					people = $('<div>', { class : 'people' }),
					bodyDivs = {
						java : $('<div><b>Java</b>', { class : 'java' }),
						po : $('<div><b>PO</b>', { class : 'po' }),
						bsa : $('<div><b>BSA</b>', { class : 'bsa' }),
						ui : $('<div><b>UI</b>', { class : 'ui' }),
						qa : $('<div><b>QA</b>', { class : 'qa' })
					},
					rowCounter++;
				header
					.append( $( '<span>', { 'class' : 'glyphicon glyphicon-edit editEpic', style : 'float:right', 'epic-index' : epic.index } )  )
					.append( createSetting( 'Epic Name', epic.name ) )
					.append( createSetting( 'Branch', epic.branch ) );

				for( var j = 0 ; j < epic.people.java.length; j++ ) {
					bodyDivs.java.append( $('<p>', { text : epic.people.java[j] }));
				}

				if( epic.people.java.length > 0 ) {
					people.append( bodyDivs.java );
				}

				for( var j = 0 ; j < epic.people.ui.length; j++ ) {
					bodyDivs.ui.append( $('<p>', { text : epic.people.ui[j] }));
				}

				if( epic.people.ui.length > 0 ) {
					people.append( bodyDivs.ui );
				}

				for( var j = 0 ; j < epic.people.po.length; j++ ) {
					bodyDivs.po.append( $('<p>', { text : epic.people.po[j] }));
				}

				if( epic.people.po.length > 0 ) {
					people.append( bodyDivs.po );
				}

				for( var j = 0 ; j < epic.people.bsa.length; j++ ) {
					bodyDivs.bsa.append( $('<p>', { text : epic.people.bsa[j] }));
				}

				if( epic.people.bsa.length > 0 ) {
					people.append( bodyDivs.bsa );
				}

				for( var j = 0 ; j < epic.people.qa.length; j++ ) {
					bodyDivs.qa.append( $('<p>', { text : epic.people.qa[j] }));
				}

				if( epic.people.qa.length > 0 ) {
					people.append( bodyDivs.qa );
				}

				div.append( header );
				div.append( $('<hr>') );
				div.append( people );
				row.append( div );
				if( rowCounter == 4 || ( i +1 == epics.length ) ) {
					body.append( row );
					row = $('<div>', { class : 'row'} );
					rowCounter = 0;
				}
			}
			$('.editEpic').off('click').on( 'click', _editEpic );
		});

		socket.on('update_branches', function( branches ) {
			_branches = branches;
			_updateEpicBranches();
			var topNav = $('.topNav').empty(),
				row = $('<div>', { class : 'row'} ),
				rowCounter = 0;
			for( var i = 0; i < branches.length; i++ ) {
				var 
					branch = branches[i],
					div = $('<div>', { class : 'col-sm-3' }),
					dailyDeploys = '',
					prevDeploy = '',
					nextDeploy = '',
					dates = [],
					_createSetting = function( text, value ) {
						return  $('<p>', { text : value, class : 'branchInfo' } ).prepend( $('<b>', { text : text + ' : ' }) );
					};
					rowCounter++;
				for( var j = 0; j < branch.deploys.length; j++ ) {
					if( branch.deploys[j].daily === true ) {
						dailyDeploys += ' ' + moment( branch.deploys[j].dateTime ).format('h:mm a');
					}
					dates.push( moment( branch.deploys[j].dateTime ).toDate( ) );
				}

				// Sorts dates closest to right now. Could be in the past
				dates.sort(function(a, b) {
				    var 
				    	today = new Date(),
				    	distancea = Math.abs(today - a),
				    	distanceb = Math.abs(today - b);
				    return distancea - distanceb; // sort a before b when the distance is smaller
				});
				
				for( var k = 0; k < dates.length; k++ ) {
					if( moment( dates[k] ) < moment() && prevDeploy == '' ) {
						prevDeploy = moment( dates[k] ).calendar()
					}
					if( moment( dates[k] ) > moment() && nextDeploy == '' ) {
						nextDeploy = moment( dates[k] ).calendar()
					}
				}

					div
						.append( $('<h4>', { class : 'branchHeader', text : branch.name } ).prepend( $( '<span>', { 'class' : 'glyphicon glyphicon-edit edit', 'branch-index' : branch.index } ) ) )
						.append( _createSetting( 'Branch Manager', branch.manager ) ) 
						.append( _createSetting( 'Environment', branch.env ) ) 
						.append( _createSetting( 'Previous Deploy Time', prevDeploy ) ) 
						.append( _createSetting( 'Next Deploy Time', nextDeploy ) ) 
						.append(_createSetting ('Daily Deploys', dailyDeploys) );
					row.append( div );
					if( rowCounter == 4 || ( i +1 == branches.length ) ) {
						topNav.append( row );
						row = $('<div>', { class : 'row'} );
						rowCounter = 0;
					}
			}
			$('.edit').off('click').on( 'click', _editBranch );
		});

		_init();
}