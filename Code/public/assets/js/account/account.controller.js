angular.module('sopApp')
  .controller('AccountCtrl', ["$scope", "$firebaseObject", "$firebaseArray", function($scope, $firebaseObject, $firebaseArray) {
    var accountCtrl = this;

    var currentUser = firebase.auth().currentUser;

    var PasswordData = {
      password: '',
      password2: '',
      oldpassword: '',
      error: ''
    };
    accountCtrl.PasswordData = PasswordData;

    var usersRef = firebase.database().ref('users');
    var user = $firebaseObject(usersRef.child(currentUser.uid));
    accountCtrl.user = user;

    accountCtrl.updateProfile = function() {
      usersRef.child(currentUser.uid)
        .update({
          'firstname': accountCtrl.user.firstname,
          'lastname': accountCtrl.user.lastname,
          'phoneNumber': accountCtrl.user.phoneNumber
        });

      var subusersRef = firebase.database().ref('subusers/' + accountCtrl.user.parentid);
      subusersRef.child(currentUser.uid)
        .update({
          'firstname': accountCtrl.user.firstname,
          'lastname': accountCtrl.user.lastname,
          'phoneNumber': accountCtrl.user.phoneNumber
        });

      demo.showNotification('top', 'right', 'Profile updated successfully', 2);
      $scope.profileForm.$setPristine();
    };

    accountCtrl.changePassword = function() {
      var credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, accountCtrl.PasswordData.oldpassword);
      currentUser.reauthenticateWithCredential(credential).then(function() {
        currentUser.updatePassword(accountCtrl.PasswordData.password).then(function() {
          accountCtrl.PasswordData = {
            password: '',
            password2: '',
            oldpassword: '',
            error: ''
          };
          $scope.close();
        }).catch(function(error) {
          alert('Error updating password');
          console.log(error);
          accountCtrl.PasswordData = {
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

    accountCtrl.cancelChangePassword = function() {
      accountCtrl.PasswordData = {
        password: '',
        password2: '',
        oldpassword: '',
        error: ''
      };
    }

    accountCtrl.textChanged = function() {
      if (accountCtrl.PasswordData.password2 == '') {
        if ((accountCtrl.PasswordData.password.length > 0) && (accountCtrl.PasswordData.password.length < 6)) {
          accountCtrl.PasswordData.error = 'The new password must be at least six characters long';
          document.getElementById("password2").disabled = true;
        } else {
          accountCtrl.PasswordData.error = '';
          document.getElementById("password2").disabled = false;
        }
      } else {
        if (accountCtrl.PasswordData.password == accountCtrl.PasswordData.password2) {
          accountCtrl.PasswordData.error = '';
        } else {
          accountCtrl.PasswordData.error = 'Passwords must match';
        }
      }
      if (accountCtrl.PasswordData.error != '') {
        document.getElementById("UpdatePassword").disabled = true;
      } else {
        document.getElementById("UpdatePassword").disabled = false;
      }
    };

    $scope.$on("$locationChangeStart", function(event) {
      if ($scope.profileForm.$dirty && !confirm('You have unsaved changes. Continue without saving?'))
        event.preventDefault();
    });

  }]);
