angular.module('sopApp')
  .controller('DeviceCtrl', ["Devices", "$scope", "$firebaseArray", function(Devices, $scope, $firebaseArray) {
    var deviceCtrl = this;

    deviceCtrl.myDevices = Devices.getMainDevices();

    deviceCtrl.idSelected = null;
    deviceCtrl.setSelected = function(idSelected) {
      deviceCtrl.idSelected = idSelected;
      deviceCtrl.users = Devices.getUsersPerDevice(idSelected);
    };


    deviceCtrl.errorMessage;
    deviceCtrl.checkedId = "Include device own Id";
    deviceCtrl.disabled = true;
    deviceCtrl.newDeviceId;

    deviceCtrl.addDevice = function() {
       if (deviceCtrl.disabled && !deviceCtrl.newDeviceId) {
        deviceCtrl.errorMessage = "Missing Device ID";
      } else {

        Devices.addDevice(deviceCtrl.newDeviceId);
        deviceCtrl.newDeviceId = "";

        $('#addDevice').modal('hide');
        deviceCtrl.myDevices = Devices.getMainDevices();
      }
    };

    //Helper disable fields in form
  	deviceCtrl.dis = function(){
  		deviceCtrl.disabled = !deviceCtrl.disabled;
  	}

  }]);
