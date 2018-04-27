firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        location.href = "/";
    } else angular.bootstrap(document, ['sopApp']);
});

angular.module('sopApp', [])
.controller('AuthCtrl', function($scope, $timeout){
    $scope.user = {
      email: '',
      password: ''
    };
    $scope.login = function (){
        firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function (auth){
            location.href = "/";
        }, function (error){
            $timeout(function(){$scope.error = error;});
        });
    };

    $scope.resetPassword = function (email){
        firebase.auth().sendPasswordResetEmail(email).then(function() {
            console.log("SENT");
        }).catch(function(error) {
            console.log(error);
        });
    };
})