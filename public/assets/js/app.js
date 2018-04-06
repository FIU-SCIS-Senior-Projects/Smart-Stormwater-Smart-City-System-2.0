var sys = {
  mapInit: false
};

angular.module('sopApp', ['firebase', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html'
      })
      .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl as accountCtrl'
      })
      .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UserCtrl as userCtrl'
      })
      .when('/devices', {
        templateUrl: 'views/devices.html',
        controller: 'DeviceCtrl as deviceCtrl'
      })
      .when('/notifications', {
        templateUrl: 'views/notifications.html',
        controller: 'NotificationCtrl as notificationCtrl'
      })
      .when('/maps', {
        templateUrl: 'views/maps.html',
        controller: 'MapCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl as settingsCtrl'
      })
      .otherwise({
        templateUrl: 'views/dashboard.html'
      });

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })
  .controller('MainCtrl', function($scope, $http, $firebaseArray, $firebaseObject) {

    // var currentUser = firebase.auth().currentUser;
    //
    // $scope.user = {
    //   uid: '',
    //   firstname: '',
    //   lastname: '',
    //   role: '',
    //   department: '',
    //   phoneNumber: '',
    //   parentid: ''
    // }
    //
    // $scope.selectedUser = {
    //   uid: '',
    //   firstname: '',
    //   lastname: '',
    //   role: '',
    //   department: '',
    //   phoneNumber: '',
    //   parentid: ''
    // }
    //
    // var PasswordData = {
    //   password: '',
    //   password2: '',
    //   oldpassword: '',
    //   error: ''
    // };
    // $scope.PasswordData = PasswordData;
    //
    // var usersRef = firebase.database().ref('users');
    // var user = $firebaseObject(usersRef.child(currentUser.uid));
    // $scope.user = user;
    //
    // $scope.updateProfile = function() {
    //   usersRef.child(currentUser.uid)
    //     .update({
    //       'firstname': $scope.user.firstname,
    //       'lastname': $scope.user.lastname,
    //       'phoneNumber': $scope.user.phoneNumber
    //     });
    //
    //   var subusersRef = firebase.database().ref('subusers/' + user.parentid);
    //   subusersRef.child(currentUser.uid)
    //     .update({
    //       'firstname': $scope.user.firstname,
    //       'lastname': $scope.user.lastname,
    //       'phoneNumber': $scope.user.phoneNumber
    //     });
    //
    //   alert('Profile updated successfully');
    // };
    //
    // $scope.changePassword = function() {
    //   var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, $scope.PasswordData.oldpassword);
    //   currentUser.reauthenticateWithCredential(credential).then(function() {
    //     currentUser.updatePassword($scope.PasswordData.password).then(function() {
    //       var PasswordData = {
    //         password: '',
    //         password2: '',
    //         oldpassword: '',
    //         error: ''
    //       };
    //       $scope.close();
    //     }).catch(function(error) {
    //       alert('Error updating password');
    //       console.log(error);
    //       var PasswordData = {
    //         password: '',
    //         password2: '',
    //         oldpassword: '',
    //         error: ''
    //       };
    //     });
    //   }).catch(function(error) {
    //     alert(error);
    //     console.log(error);
    //   });
    // }

    $scope.logout = function() {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    }

    // $scope.textChanged = function() {
    //   if ($scope.PasswordData.password2 == '') {
    //     if (($scope.PasswordData.password.length > 0) && ($scope.PasswordData.password.length < 6)) {
    //       $scope.PasswordData.error = 'The new password must be at least six characters long';
    //       document.getElementById("password2").disabled = true;
    //     } else {
    //       $scope.PasswordData.error = '';
    //       document.getElementById("password2").disabled = false;
    //     }
    //   } else {
    //     if ($scope.PasswordData.password == $scope.PasswordData.password2) {
    //       $scope.PasswordData.error = '';
    //     } else {
    //       $scope.PasswordData.error = 'Passwords must match';
    //     }
    //   }
    //   if ($scope.PasswordData.error != '') {
    //     document.getElementById("UpdatePassword").disabled = true;
    //   } else {
    //     document.getElementById("UpdatePassword").disabled = false;
    //   }
    // };

    $scope.close = function() {
      $('#addUser').modal('hide');
      $('#changePassword').modal('hide');
      $('#modifyUser').modal('hide');
      $('#deleteUser').modal('hide');
      $('#addDevice').modal('hide');
      $('#removeDevice').modal('hide');
    }

  }).filter('filter', function($filter) {

    return function(input) {

      var date = new Date(input);
      return ($filter('date')(date, 'EEE MMM dd yyyy HH:mm:ss'));
    }
  })
  .controller('MapCtrl', function($scope, $firebaseArray) {
    $scope.devicesRef = $firebaseArray(firebase.database().ref('devicetype/Stormwater'));
  	$scope.position = {lat:'', lng:''};
  	$scope.infowindow;
  	$scope.markers = [];
  	$scope.map;

  	$scope.devicesRef.$loaded().then(function() {
  		$scope.initMap();
    	 	angular.forEach($scope.devicesRef, function(value, key){
  			sensorMarker(value);
    	 	})
    	})

    	firebase.database().ref('devicetype/Stormwater').on('child_changed', function(snapshot) {
    		// console.log($scope.markers.length)
    		for (var i = 0; i <= $scope.markers.length; i++) {
    			if ($scope.markers[i].title == snapshot.key) {
    				info($scope.markers[i], snapshot.val());
    			}
    		}
  	});

    	function sensorMarker(value) {
    		$scope.position.lat = value.position[0];
  		$scope.position.lng = value.position[1];
  		var geocoder = new google.maps.Geocoder;
    	 	var marker = new google.maps.Marker({
  	     	position: new google.maps.LatLng($scope.position.lat, $scope.position.lng),
  	     	map: $scope.map,
  	     	// animation: google.maps.Animation.DROP,
  	     	title: value.$id
  	   	});
  	 	info(marker, value);
  	 	$scope.markers.push(marker);
    	}

    	function info(marker, value) {
    		$scope.position.lat = value.position[0];
  		$scope.position.lng = value.position[1];
    		var geocoder = new google.maps.Geocoder;
    		geocoder.geocode({'location': {lat:$scope.position.lat, lng:$scope.position.lng}}, (results, status) => {
  	   		var info = `<strong>Address</strong>: ${results[0].formatted_address}
  	   		 <br> <strong>Filled</strong>: ${value.filled}%
  	   		 <br> <strong>Battery</strong>: ${value.battery}%`;
  	   		var infowindow = new google.maps.InfoWindow({});
      		marker.set('content', info);
      		marker.addListener('click', function() {
      			infowindow.setContent(this.get('content'));
         			infowindow.open($scope.map, marker);
      		});
      	});
    	}


  	$scope.initMap = function() {
  	  	$scope.map = new google.maps.Map(document.getElementById('map'), {
  	  	  	center: new google.maps.LatLng(25.7498, -80.2157),
  	  	  	zoom: 12,
  	  	  	styles: [{
  	  	  		featureType: 'poi',
  	  	    	stylers: [{ visibility: 'off' }]  // Turn off points of interest.
  	  	  	},
  	  	  	{
  	  	    	featureType: 'transit.station',
  	  	    	stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
  	  	  	}],
  	  	  	disableDoubleClickZoom: true
  	  	});
  	}
  })
