/**
 * Created by xx67511 on 4/6/2016.
 */
var socket = io.connect( config.socketConnection ),
mainApp = angular.module('mainApp', ['ngRoute'])
    .service('pageBean', function() {
        var cardList = [],
        printTemplate = false;

        return {
            getCardList: function(){
                return cardList;
            },
            setCardList: function(value) {
                cardList = value;
            },
            isPrintTemplate : function() {
                return printTemplate;
            },
            setPrintTemplate : function( value ) {
                printTemplate = value;
            }
        };
    });

    mainApp.service('jira', ['$http', '$q', function($http,$q) {

        return {
            getSprint: function( req ){
                socket.emit( 'get_sprint', { id : req.sprint.id, username : req.user, password : req.pass } );
                var deferred = $q.defer();
                socket.on('sprintData', function( data ) {
                    if( data.status == 200 )
                        deferred.resolve( data.data );
                    else
                        deferred.reject( data );
                });

                return deferred.promise;
                   
            },
            getSprints: function() {
                return [
                {
                    name : "Team Awesome Sprint 16",
                    id : 4915
                },
                {
                    name : "Ma$$ Mayhem Sprint 17",
                    id : 4997
                },
                {
                    name : "Paperless Sprint 18",
                    id : 4612
                }];
            }
        };
    }]);


mainApp.config(function($routeProvider) {
    $routeProvider

        // route for the splash screen
        .when('/', {
            templateUrl: 'cardCreation.html',
            controller: 'mainController'
        })

        //route for the card creation page
        .when('/cardPrint', {
            templateUrl: 'cardPrint.html',
            controller: 'printController'
        });
});

mainApp.filter('ceil', function() {
    return function(input) {
        return Math.ceil(input);
    };
});

mainApp.controller('mainController', function($scope, pageBean, jira) {
    $scope.cardListBackUp = [];
    $scope.templateSwitch = "Show Template";
    $scope.isEditing = false;
    $scope.index = 0; // used to keep track of what card is being edited
    $scope.addBtnText = "Add";
    $scope.loading = false;

    $scope.title = '';
    $scope.card = {
        number: '',
        epic: '',
        name: '',
        points: ''
    };
    $scope.sprints = jira.getSprints();
    $scope.cardList = pageBean.getCardList();

    $scope.import = {
        user : '',
        pass : '',
        sprint : ''
    };
    $scope.allowImport = function() {
        return ( $scope.import.user != '' && $scope.import.pass != '' && $scope.import.sprint != '' );
    };

    $scope.makePostItsfromJira = function() {
        $scope.loading = true;
        jira.getSprint( $scope.import ).then( function( data ) {
            window.testData = data;

            var i = 0, j = data.issues.length, MAX_STR_LEN = 73;
            for( ; i < j; i++ ) {
                var issue = data.issues[i],
                name = ( issue.fields.summary.length > MAX_STR_LEN ? issue.fields.summary.substring(0, MAX_STR_LEN) + '...': issue.fields.summary );
                $scope.cardList.unshift({
                    number : Number( issue.key.split('-')[1] ),
                    epic : '',
                    name : name,
                    points : issue.fields.customfield_10002
                });
            }
            pageBean.setCardList($scope.cardList);
            $scope.loading = false;
        });
    };

    $scope.addCard = function(){
        $scope.focusElement = 'numberInput';
        $scope.cardList.unshift(angular.copy($scope.card));
        pageBean.setCardList($scope.cardList);
        resetCard();
        return false;
    };

    $scope.delete = function(card, index){
        $scope.cardList.splice(index, 1);
    };

    $scope.edit = function(card, index){
        $scope.isEditing = true;
        $scope.addBtnText = "Save";

        $scope.index = index;
        $scope.card.number = Number($scope.cardList[$scope.index].number);
        $scope.card.epic = $scope.cardList[$scope.index].epic;
        $scope.card.name = $scope.cardList[$scope.index].name;
        $scope.card.points = $scope.cardList[$scope.index].points;
    };

    $scope.save = function(){
        $scope.focusElement = 'numberInput';
        var tempCard = {
            number: $scope.card.number,
            epic: $scope.card.epic,
            name: $scope.card.name,
            points: $scope.card.points
        };

        $scope.cardList.splice($scope.index, 1, tempCard);
        pageBean.setCardList($scope.cardList);
        resetCard();

        $scope.addBtnText = "Add";
        $scope.isEditing = false;
    };

    $scope.printTemplate = function() {
        $scope.isEditing = false;
        resetCard();
        $scope.addBtnText = "Add";
        pageBean.setPrintTemplate( true );
        window.location.href = "#cardPrint";
    }

    $scope.finish = function(){
        if($scope.cardList.length > 0){
            $scope.isEditing = false;
            resetCard();
            $scope.addBtnText = "Add";
            window.location.href = "#cardPrint";
        }else{
            alert("You have not created any notes! Please create at least one before clicking Finish.");
        }
    };

    function resetCard(){
        $scope.card.number = '';
        $scope.card.epic = '';
        $scope.card.name = '';
        $scope.card.points = '';
    }
});

mainApp.directive('myFocus', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        if (attrs.myFocus == "") {
          attrs.myFocus = "focusElement";
        }
        scope.$watch(attrs.myFocus, function(value) {
          if(value == attrs.id) {
            element[0].focus();
          }
        });
        element.on("blur", function() {
          scope[attrs.myFocus] = "";
          scope.$apply();
        })        
      }
    };
  });

mainApp.controller('printController', function($scope, pageBean) {
    $scope.cardList = pageBean.getCardList();

    $scope.showTemplate = function(){
        if($scope.templateSwitch == "Show Template"){
            $scope.templateSwitch = "Hide Template";
            $scope.cardListBackUp = pageBean.getCardList();
            $scope.cardList = [];
            for(var i = 0; i <= 5; i++){
                $scope.card.number = '2030';
                $scope.card.epic = 'Epic';
                $scope.card.name = 'Story Name';
                $scope.card.points = '1';
                $scope.cardList.unshift(angular.copy($scope.card));
                pageBean.setCardList($scope.cardList);
                $scope.card.number = '';
                $scope.card.epic = '';
                $scope.card.name = '';
                $scope.card.points = '';
            }
            pageBean.setCardList($scope.cardList);
        }else{
            $scope.templateSwitch = "Show Template";
            $scope.cardList = $scope.cardListBackUp;
            pageBean.setCardList($scope.cardList);
        }
    };

    $scope.data = {
        sizes: [
            {id: '0', name: '3 x 3'},
            {id: '1', name: '3 x 5'}
        ],
        selectedSize: {id: '0', name: '3 x 3'} //This sets the default value of the select in the ui
    };
console.log(pageBean.isPrintTemplate())
    if( pageBean.isPrintTemplate() ) {
        $scope.templateSwitch = "Show Template";
        $scope.showTemplate();
        pageBean.setPrintTemplate( false );
    }

    $scope.back = function(){
        if( $scope.templateSwitch == 'Hide Template' ) {
            $scope.cardList = $scope.cardListBackUp;
            pageBean.setCardList($scope.cardList);
        }
        window.location.href = "#/";
    };

    $scope.print = function(){
        window.print();
    };
});
