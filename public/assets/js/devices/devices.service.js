angular.module('sopApp')
  .factory('Devices', function($firebaseArray, $firebaseObject) {

    var currentUser = firebase.auth().currentUser;

    var mainUserDevicesRef = firebase.database().ref('userdevices/' + currentUser.uid);
    var userDevices = $firebaseArray(mainUserDevicesRef);

    var usersRef = firebase.database().ref('deviceusers');

    var userdevicesRef = firebase.database().ref('userdevices');

    //turn into Promise
    function assignDevices(selectedUser, subusers, multiselect) {
      if (multiselect) {
        for (var i = 0; i < subusers.length; i++) {
          if (subusers[i].selected)
            assign(subusers[i]);
        }
      } else {
        assign(selectedUser);
      }
      for (var i = 0; i < userDevices.length; i++) {
        userDevices[i].selected = false;
      }
    }

    function assign(selectedUser) {
      for (var i = 0; i < userDevices.length; i++) {
        if (userDevices[i].selected) {
          var dev = {};
          dev = {
            name: userDevices[i].$id,
            location: userDevices[i].position
          };
          userdevicesRef.child(selectedUser.$id).child(userDevices[i].$id)
            .set(dev, function(error) {
              if (error) {
                console.log("Devices could not be assigned to userdevices node", error);
              } else {
                console.log("Successfully assigned devices to userdevices node");
              }
            });
          var u = {
            firstname: selectedUser.firstname,
            lastname: selectedUser.lastname,
            email: selectedUser.email,
            role: selectedUser.role,
            department: selectedUser.department,
            phoneNumber: selectedUser.phoneNumber
          };
          usersRef.child(userDevices[i].$id).child(selectedUser.$id)
            .set(u, function(error) {
              if (error) {
                console.log("Devices could not be assigned to deviceusers node", error);
              } else {
                console.log("Successfully assigned devices to deviceusers node");
              }
            });
        }
      }
    }

    //turn into Promise
    function unassignDevice(selectedUser, selectedDevice) {
      userdevicesRef.child(selectedUser.$id).child(selectedDevice.id).remove().then(function() {
        console.log("Successfully removed device from userdevices node");
        usersRef.child(selectedDevice.id).child(selectedUser.$id).remove().then(function() {
          console.log("Successfully removed device from deviceusers node");
        });
      });
    };

    function deleteUserDevices(id) {
      var devicesToDelete = $firebaseArray(userdevicesRef.child(id));

      devicesToDelete.$loaded()
        .then(function() {
          angular.forEach(devicesToDelete, function(device) {
            console.log(device.$id);
            usersRef.child(device.$id).child(id).remove().then(function() {
              console.log("Removed " + device.$id);
            });
          });
        });

      userdevicesRef.child(id).remove()
        .then(function() {
          console.log("Removed from userdevices");
        });
    }

    function addDevice(newDeviceId) {
      var ref = firebase.database().ref('devices');

      var device = {
        "filled": 0,
        "position": [0, 0],
        "battery": 100,
        "lastseen": firebase.database.ServerValue.TIMESTAMP
      };

      if (newDeviceId) { //Add custom id
        ref.child(newDeviceId).set(device);

        mainUserDevicesRef.child(newDeviceId).set(device);

        var uRef = firebase.database().ref('users/' + currentUser.uid);
        var user = $firebaseObject(uRef);

        user.$loaded().then(function() {
          usersRef.child(newDeviceId + '/' + currentUser.uid).set({
            'firstname': user.firstname,
            'lastname': user.lastname,
            'phoneNumber': user.phoneNumber,
            'role': user.role,
            'department': user.department
          });
        });

      } else { //Auto generate id
        var newref = ref.push();
        newref.set(device);
      }
    }

    var Devices = {
      getMainDevices: function() {
        for (var i = 0; i < userDevices.length; i++) {
          userDevices[i].selected = false;
        }
        return userDevices;
      },
      getUsersPerDevice: function(id) {
        return $firebaseArray(usersRef.child(id));
      },
      getDevicesPerUser: function(id) {
        return $firebaseArray(userdevicesRef.child(id));
      },
      assignDevices: assignDevices,
      unassignDevice: unassignDevice,
      deleteUserDevices: deleteUserDevices,
      addDevice: addDevice
    };

    return Devices;
  });
