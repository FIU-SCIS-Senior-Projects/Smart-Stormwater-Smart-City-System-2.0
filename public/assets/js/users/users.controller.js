angular.module('sopApp')
  .controller('UserCtrl', function(Users, Devices, $scope) {
    var userCtrl = this;
    var currentUser = firebase.auth().currentUser;
    var multiselect = {
      selected: false
    };
    userCtrl.multiselect = multiselect;
    userCtrl.subusers = Users.getSubUsers();
    userCtrl.myDevices = Devices.getMainDevices();
    var origDevices = null;
    var origSelectedUser = null;

    userCtrl.newUser = {
      email: '',
      password: '',
      role: '',
      department: '',
      parentid: currentUser.uid,
      phoneNumber: ''
    };

    userCtrl.createUser = function() {
      $(document.body).css({
        'cursor': 'wait'
      });

      Users.createUser(userCtrl.newUser).then(function success(response) {
        console.log("Success!!!");
        userCtrl.newUser = {
          email: '',
          password: '',
          role: '',
          department: '',
          parentid: currentUser.uid
        };
        $scope.close();
        $(document.body).css({
          'cursor': 'default'
        });
      }, function error(error) {
        console.log(error);
        userCtrl.errorMessage = error.data;
        $(document.body).css({
          'cursor': 'default'
        });
      });

    };

    userCtrl.selectedUser = Users.getSelectedUser();

    userCtrl.selectedDevice = {
      id: ''
    };

    userCtrl.idSelected = null;
    userCtrl.setSelected = function(idSelected) {
      Users.setSelectedUser(idSelected);
      userCtrl.selectedUser = Users.getSelectedUser();
      userCtrl.idSelected = idSelected;
      userCtrl.devices = Devices.getDevicesPerUser(idSelected);
    };

    userCtrl.assignDevices = function() {
      Devices.assignDevices(userCtrl.selectedUser, userCtrl.subusers, userCtrl.multiselect.selected);
      $scope.close();
    };

    userCtrl.unassignDevice = function() {
      Devices.unassignDevice(userCtrl.selectedUser, userCtrl.selectedDevice);
      $scope.close();
    };

    userCtrl.updateSubuser = function(id) {
      Users.updateSubuser(id).then(function success(response) {
        console.log("Success!!!");
        $scope.close();
      }, function error(error) {
        console.log(error);
        userCtrl.errorMessage = error.data;
      });
    };

    userCtrl.deleteSubuser = function(id) {
      $(document.body).css({
        'cursor': 'wait'
      });
      Users.deleteSubuser(id).then(function success(response) {
        console.log("Success!!!");
        $scope.close();
        $(document.body).css({
          'cursor': 'default'
        });
      }, function error(error) {
        console.log(error);
        userCtrl.errorMessage = error.data;
        $(document.body).css({
          'cursor': 'default'
        });
      });
    };

    userCtrl.showAddDevice = function(){
      origDevices = angular.copy(userCtrl.myDevices);
    };

    userCtrl.cancelAddDevice = function(){
      userCtrl.myDevices = origDevices;
    };

    userCtrl.showModifyUser = function(){
      origSelectedUser = angular.copy(userCtrl.selectedUser);
    };

    userCtrl.cancelModifyUser = function(){
      Users.cancelEditSubUser(origSelectedUser);
      Users.setSelectedUser(origSelectedUser.$id);
      userCtrl.selectedUser = Users.getSelectedUser();
    };

    userCtrl.unselectSubusers = function() {
      Users.unselectSubusers();
    };

  });
