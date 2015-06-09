'use strict';

// Tools controller
angular.module('tools').controller('ToolsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tools', 'Talents', '$http',
	function($scope, $stateParams, $location, Authentication, Tools, Talents, $http ) {
		$scope.authentication = Authentication;

		// scope variables
		$scope.emailClients = [];
		$scope.email = {
						all: '',
						subject: '',
						body: ''
					};

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

	}
]);