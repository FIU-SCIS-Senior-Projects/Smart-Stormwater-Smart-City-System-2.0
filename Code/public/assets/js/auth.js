
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        angular.bootstrap(document, ['sopApp']);
    } else location.href = "/login/";
});