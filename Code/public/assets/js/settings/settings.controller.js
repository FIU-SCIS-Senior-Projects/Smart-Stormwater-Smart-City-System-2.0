angular.module('sopApp')
  .controller('SettingsCtrl', ["$scope", "$firebaseObject", "$firebaseArray", function($scope, $firebaseObject, $firebaseArray) {
    var settingsCtrl = this;

    var currentUser = firebase.auth().currentUser;

    var usersRef = firebase.database().ref('users');
    var user = $firebaseObject(usersRef.child(currentUser.uid));
    settingsCtrl.user = user;

    settingsCtrl.updateNotificationSettings = function() {
      usersRef.child(currentUser.uid).child('settings')
        .update({
          'emailNotification': settingsCtrl.user.settings.emailNotification,
          'smsNotification': settingsCtrl.user.settings.smsNotification,
          'fillLevel': settingsCtrl.user.settings.fillLevel
        });
      demo.showNotification('top', 'right', 'Notifications Settings updated successfully', 2);
      $scope.settingsForm.$setPristine();
    }

    $scope.$on("$locationChangeStart", function(event) {
      if ($scope.settingsForm.$dirty && !confirm('You have unsaved changes. Continue without saving?'))
        event.preventDefault();
    });

  }]);
