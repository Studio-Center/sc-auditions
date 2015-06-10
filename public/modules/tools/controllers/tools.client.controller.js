'use strict';

// Tools controller
angular.module('tools').controller('ToolsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tools', 'Talents', '$http',
	function($scope, $stateParams, $location, Authentication, Tools, Talents, $http ) {
		$scope.authentication = Authentication;

		// scope variables
		$scope.emailClients = [];
		$scope.talents = [];
		$scope.email = {
						all: '',
						subject: '',
						body: ''
					};

		// call list vals
		$scope.talentStatus = ['Cast', 'Emailed', 'Scheduled', 'Message left', 'Out', 'Received needs to be posted', 'Posted', 'Not Posted (Bad Read)'];
		$scope.callTalents = [];
		$scope.messagedTalents = [];
		$scope.alreadyScheduledTalents = [];

		// toggle checkbox options
		$scope.toggleEmailer = function(id,talent){
			  var idx = $scope.emailClients.indexOf(id);
			  if (idx > -1){
			    $scope.emailClients.splice(idx, 1);
			  }else{
			    $scope.emailClients.push(id);
			}
		};
		$scope.checkToggleEmail = function(talentId){
			var idx = $scope.emailClients.indexOf(talentId);
			if (idx > -1){
				return true;
			} else {
				return false;
			}
		};
		$scope.gatherTalents = function(){
			$scope.talents = Talents.query();
		};
		$scope.talentLookup = function(id){
			for(var i = 0; i < $scope.talents.length; ++i){
				if($scope.talents[i]._id == id){
					return $scope.talents[i].name + ' ' + $scope.talents[i].lastName;
				}
			}
		};
		$scope.removeSelectedTalents = function(){
			for(var i = 0; i < $scope.verifySelected.length; ++i){
				for(var j = 0; j < $scope.emailClients.length; ++j){
					if($scope.verifySelected[i] == $scope.emailClients[j]){
						var idx = $scope.emailClients.indexOf($scope.emailClients[j]);
						if (idx > -1){
						    $scope.emailClients.splice(idx, 1);
						}
						var idx = $scope.verifySelected.indexOf($scope.emailClients[j]);
						if (idx > -1){
						    $scope.verifySelected.splice(idx, 1);
						}
					}
				}
			}
		};
		$scope.sendTalentEmails = function(){
			var conf = confirm('Are you sure you would like to send the entered email information to your selected talent?');
			if(conf === true){
				if($scope.email.subject !== '' && $scope.email.body !== ''){
					// pass entered values to the server
					$http.post('/tools/sendtalentemails', {
				        email: $scope.email,
				        emailClients: $scope.emailClients
				    }).
					success(function(data, status, headers, config) {
						alert('Talent has been emailed!');
					});
				} else {
					alert('Email subject and message cannot be empty!');
				}
			}
		};
		$scope.$watch('selected', function(verifySelected){
		    // reset to nothing, could use `splice` to preserve non-angular references
		    $scope.verifySelected = [];

		    if( ! verifySelected ){
		        // sometimes selected is null or undefined
		        return;
		    }

		    // here's the magic
		    angular.forEach(verifySelected, function(val){
		        $scope.verifySelected.push( val );
		    });
		});

		// call list methods
		// gather list of talents to call
		$scope.talentLookupData = function(id){
			for(var i = 0; i < $scope.talents.length; ++i){
				console.log($scope.talents[i]);
				if($scope.talents[i]._id == id){
					return $scope.talents[i];
				}
			}
		};
		$scope.gatherTalentsToCall = function(){

			$http.post('/tools/gatherTalentsToCall').
			success(function(data, status, headers, config) {
				$scope.callProjects = data;
			});

		};
		// gather talents 
		$scope.gatherTalentsMessagesLeft = function(){

			$http.post('/tools/gatherTalentsMessagesLeft').
			success(function(data, status, headers, config) {
				$scope.messagedTalents = data;
			});

		};
		$scope.gatherTalentsAlreadyScheduled = function(){

			$http.post('/tools/gatherTalentsAlreadyScheduled').
			success(function(data, status, headers, config) {
				$scope.alreadyScheduledTalents = data;
			});

		};
		$scope.emailCallListTalent = function(talentId, projectId){

			// $http.post('/projects/sendtalentemail', {
		 //        talent: talent,
		 //        project: $scope.project
		 //    }).
			// success(function(data, status, headers, config) {
			// 	alert('Selected talent has been emailed.');
			// });

		};

	}
]);