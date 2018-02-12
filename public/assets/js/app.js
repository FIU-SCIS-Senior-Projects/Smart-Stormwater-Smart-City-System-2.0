angular.module('sopApp', ['firebase', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html'
      })
      .when('/account', {
        templateUrl: 'views/account.html'
      })
      .when('/users', {
        templateUrl: 'views/users.html'
      })
      .when('/devices', {
        templateUrl: 'views/devices.html'
      })
      .when('/notifications', {
        templateUrl: 'views/notifications.html'
      })
      .when('/maps', {
        templateUrl: 'views/maps.html'
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

    var currentUser = firebase.auth().currentUser;

    $scope.user = {
      uid: '',
      firstname: '',
      lastname: '',
      role: '',
      department: '',
      phoneNumber: '',
      parentid: ''
    }

    var PasswordData = {
      password: '',
      password2: '',
      oldpassword: '',
      error: ''
    };
    $scope.PasswordData = PasswordData;

    $scope.newUser = {
      email: '',
      password: '',
      role: '',
      department: '',
      parentid: currentUser.uid
    };

    // console.log(currentUser.uid);
    /*
    if (currentUser != null) {
      $scope.user.email = currentUser.email;
      $scope.user.uid = currentUser.uid;
    }
    */

    var usersRef = firebase.database().ref('users');
    var user = $firebaseObject(usersRef.child(currentUser.uid));
    $scope.user = user;


    var subuserRef = firebase.database().ref('subusers/' + currentUser.uid);
    $scope.mylist = $firebaseArray(subuserRef);

    $scope.createUser = function() {
      $http.post("https://us-central1-broadcastapp-1119.cloudfunctions.net/createUser", $scope.newUser)
        .then(function success(response) {
          console.log("Success!!!");
          $scope.newUser = {
            email: '',
            password: '',
            role: '',
            department: '',
            parentid: currentUser.uid
          };
          $scope.close();
        }, function error(error) {
          console.log(error);
          $scope.errorMessage = error.data;
        });
    };

    $scope.updateProfile = function() {
      usersRef.child(currentUser.uid)
        .update({
          'firstname': $scope.user.firstname,
          'lastname': $scope.user.lastname,
          'phoneNumber': $scope.user.phoneNumber
        });

      var subusersRef = firebase.database().ref('subusers/' + user.parentid);
      subusersRef.child(currentUser.uid)
        .update({
          'firstname': $scope.user.firstname,
          'lastname': $scope.user.lastname
        });

      alert('Profile updated successfully');
    };

    $scope.changePassword = function() {
      var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, $scope.PasswordData.oldpassword);
      currentUser.reauthenticateWithCredential(credential).then(function() {
        currentUser.updatePassword($scope.PasswordData.password).then(function() {
          var PasswordData = {
            password: '',
            password2: '',
            oldpassword: '',
            error: ''
          };
          $scope.close();
        }).catch(function(error) {
          alert('Error updating password');
          console.log(error);
          var PasswordData = {
            password: '',
            password2: '',
            oldpassword: '',
            error: ''
          };
        });
      }).catch(function(error) {
        alert(error);
        console.log(error);
      });
    }

    $scope.logout = function () {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }).catch(function(error) {
            // An error happened.
        });
    }

    $scope.textChanged = function() {
      if ($scope.PasswordData.password2 == '') {
        if (($scope.PasswordData.password.length > 0) && ($scope.PasswordData.password.length < 6)) {
          $scope.PasswordData.error = 'The new password must be at least six characters long';
          document.getElementById("password2").disabled = true;
        } else {
          $scope.PasswordData.error = '';
          document.getElementById("password2").disabled = false;          
        }
      } else {
        if ($scope.PasswordData.password == $scope.PasswordData.password2) {
          $scope.PasswordData.error = '';
        } else {
          $scope.PasswordData.error = 'Passwords must match';
        }
      }
      if ($scope.PasswordData.error != '') {
        document.getElementById("UpdatePassword").disabled = true;
      } else {
        document.getElementById("UpdatePassword").disabled = false;
      }
    };

    $scope.close = function() {
      $('#addUser').modal('hide');
      $('#changePassword').modal('hide');
    }


    $scope.idSelected = null;
    $scope.setSelected = function(idSelected) {
      $scope.idSelected = idSelected;
      var devicesRef = firebase.database().ref('subusers/' + idSelected);
      $scope.devices = $firebaseArray(devicesRef);
    };

    $scope.roles = [{
      'name': 'User'
    }, {
      'name': 'Admin'
    }, {
      'name': 'Super Admin'
    }];

    var devicesRef = firebase.database().ref('devices');
    var geoFire = new GeoFire(devicesRef);
    
  })





