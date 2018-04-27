angular.module('sopApp')
  .factory('Users', function($firebaseArray, $firebaseObject, $http, Devices) {

    var currentUser = firebase.auth().currentUser;
    var usersRef = firebase.database().ref('users');
    var subuserRef = firebase.database().ref('subusers/' + currentUser.uid);
    var subusers = $firebaseArray(subuserRef);
    var selectedUser = null;
    // $q.when(db.put(doc)).then(/* ... */); make non promise to promise
    function createUser(newUser) {
      return new Promise((resolve, reject) => {
        $http.post("https://us-central1-broadcastapp-1119.cloudfunctions.net/createUser", newUser)
          .then(function success(response) {
            var email = newUser.email;
            console.log(email);
            firebase.auth().sendPasswordResetEmail(email).then(function() {
              console.log("Reset password email sent");
              resolve("User created successfully");
            }).catch(function(error) {
              console.log(error);
              reject(error);
            });
          }, function error(error) {
            console.log(error);
            reject(error);
          });
      });
    };

    function updateSubuser(id) {
      return new Promise((resolve, reject) => {
        subusers.$save(selectedUser)
          .then(function success(response) {
            console.log("saved");
            usersRef.child(id)
              .update({
                'firstname': selectedUser.firstname,
                'lastname': selectedUser.lastname,
                'phoneNumber': selectedUser.phoneNumber,
                'role': selectedUser.role,
                'department': selectedUser.department
              }).then(function() {
                console.log("User Updated");
                resolve("User updated successfully");
              }).catch(function(error) {
                console.log(error);
                reject(error);
              });
          }, function error(error) {
            console.log(error);
            reject(error);
          });
      });
    };

    function deleteSubuser(id) {
      return new Promise((resolve, reject) => {
        var sub = {
          uid: id
        };
        $http.post("https://us-central1-broadcastapp-1119.cloudfunctions.net/deleteUser", sub)
          .then(function success(response) {
            subusers.$remove(selectedUser).then(function() {

              usersRef.child(id).remove();
              console.log("user deleted from users");

              Devices.deleteUserDevices(id);

              var ref = firebase.database().ref('subusers');
              var subs = $firebaseArray(ref.child(id));

              subs.$loaded()
                .then(function() {
                  angular.forEach(subs, function(sub) {
                    var user = {};
                    user = {
                      firstname: sub.firstname,
                      lastname: sub.lastname,
                      email: sub.email,
                      role: sub.role,
                      department: sub.department,
                      parentid: currentUser.uid,
                      phoneNumber: sub.phoneNumber
                    };
                    subuserRef.child(sub.$id)
                      .set(user);
                    usersRef.child(sub.$id + '/parentid')
                     .set(currentUser.uid);
                  });

                  ref.child(id).remove(sub.$id);

                });
              resolve("Yes");
            });
            //need to delete from subusers node and assign subusers to parent
          }, function error(error) {
            console.log(error);
            reject(error);
          });
      });
    };


    var Users = {
      getSubUsers: function() {
        for (var i = 0; i < subusers.length; i++) {
          subusers.selected = false;
        }
        return subusers;
      },
      createUser: createUser,
      updateSubuser: updateSubuser,
      deleteSubuser: deleteSubuser,
      getSelectedUser: function() {
        return selectedUser;
      },
      setSelectedUser: function(id) {
        selectedUser = subusers.$getRecord(id);
      },
      cancelEditSubUser: function(origSelectedUser) {
        var index = subusers.$indexFor(origSelectedUser.$id);
        subusers[index] = origSelectedUser;
      },
      unselectSubusers: function(){
        for (var i = 0; i < subusers.length; i++) {
          subusers[i].selected = false;
        }
      },
      getCurrentUser: function(){
        return usersRef.child(currentUser.uid);
      }
    };

    return Users;

  });
