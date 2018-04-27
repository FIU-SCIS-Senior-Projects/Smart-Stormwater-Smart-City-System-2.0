angular.module('sopApp')
  .controller('DashboardCtrl', ["$scope", "$firebaseObject", "$firebaseArray", "Devices", "Users", function($scope, $firebaseObject, $firebaseArray, Devices, Users) {
    var dashboardCtrl = this;

    var currentUser = firebase.auth().currentUser;

    dashboardCtrl.subs = 0;
    var subusers = Users.getSubUsers();
    subusers.$loaded().then(function() {
      if (subusers != null && subusers.length > 0)
        dashboardCtrl.subs = subusers.length;
    });

    dashboardCtrl.devices = 0;
    var devs = Devices.getMainDevices();
    devs.$loaded().then(function() {
      if (devs != null && devs.length > 0)
        dashboardCtrl.devices = devs.length;
    });

    var notificationsRef = firebase.database().ref('notifications/' + currentUser.uid);
    var notifications = $firebaseArray(notificationsRef);
    dashboardCtrl.ntfs = 0;
    notifications.$loaded().then(function() {
      if (notifications != null && notifications.length > 0)
        dashboardCtrl.ntfs = notifications.length;
    });

    $(document).ready(function() {

      devs.$loaded().then(function() {
        var dataBatteryChart = {
          labels: [],
          series: [
            []
          ]
        };

        for (var i = 0; i < devs.length; i++) {
          dataBatteryChart.labels.push(devs[i].$id);
          dataBatteryChart.series[0].push(devs[i].battery);
        }

        var optionsBatteryChart = {
          axisX: {
            showGrid: false
          },
          low: 0,
          high: 125,
          chartPadding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 0
          }
        };
        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function(value) {
                return value[0];
              }
            }
          }]
        ];
        var batteryChart = Chartist.Bar('#batteryChart', dataBatteryChart, optionsBatteryChart, responsiveOptions);

        md.startAnimationForBarChart(batteryChart);


        var dataFillLevelChart = {
          labels: [],
          series: [
            []
          ]
        };

        for (var i = 0; i < devs.length; i++) {
          dataFillLevelChart.labels.push(devs[i].$id);
          dataFillLevelChart.series[0].push(devs[i].filled);
        }

        var optionsFillLevelChart = {
          axisX: {
            showGrid: false
          },
          low: 0,
          high: 125,
          chartPadding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 0
          }
        };
        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function(value) {
                return value[0];
              }
            }
          }]
        ];
        var fillLevelChart = Chartist.Bar('#fillLevelChart', dataFillLevelChart, optionsFillLevelChart, responsiveOptions);


        md.startAnimationForBarChart(fillLevelChart);
      });


    });

  }]);
