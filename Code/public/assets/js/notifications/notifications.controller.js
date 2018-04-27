angular.module('sopApp')
  .controller('NotificationCtrl', ["$scope", "$firebaseObject", "$firebaseArray", "Devices", function($scope, $firebaseObject, $firebaseArray, Devices) {
    var notificationCtrl = this;

    var currentUser = firebase.auth().currentUser;

    var notificationsRef = firebase.database().ref('notifications/' + currentUser.uid);
    var notifications = $firebaseArray(notificationsRef);
    notificationCtrl.notifications = notifications;

    var sortOrder = '+date';
    notificationCtrl.sortOrder = sortOrder;

    var devices = Devices.getMainDevices();
    notificationCtrl.devices = devices;

    notificationCtrl.test = function(){
      console.log(notificationCtrl.sortOrder);
    };

  }])
  .filter('deviceFilter', function($filter) {
    return function(notifications, names) {
      var out = [];

      var empty = true;
      for(var i = 0; i < names.length; i++){
        if(names[i].selected){
          empty = false;
          break;
        }
      }

      for(var i = 0; i < notifications.length; i++){
        //console.log(notifications[i]);
        var name = names.$getRecord(notifications[i].device);
        if(empty || (name != null && name.selected))
          out.push(notifications[i]);
      }

      return out;
    }
  });
