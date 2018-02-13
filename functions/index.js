const functions = require('firebase-functions');
const admin = require('firebase-admin');
var cors = require('cors')({origin:true});
admin.initializeApp(functions.config().firebase);

exports.createUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.auth().createUser({
            email: req.body.email,
            password: req.body.password
        })
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully created new user:", userRecord.uid);
            //here goes create user in firebase
            res.json({status:"ok"});
        })
        .catch(function(error) {
            console.error("Error creating new user:", error);
            res.status(400).json(error.errorInfo.message);
        });
        // on error:
        // res.status(400).send('Invalid request');
        //success:
        // res.json({status:"ok"});
        //or
        // res.end();
        //or
        // res.send('Hello');
    });
});

exports.getUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.auth().getUser(uid)
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log("Successfully fetched user data:", userRecord.toJSON());
        })
        .catch(function(error) {
          console.log("Error fetching user data:", error);
        });
    });
});

exports.updateProfile = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        var db = admin.database();
        var ref = db.ref();
        var user = {};
        user[req.body.uid] = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            role: req.body.role,
            department: req.body.department,
            phoneNumber: req.body.phoneNumber
        };
        ref.child("users")
        .set(user, function(error) {
            if (error) {
                // alert("Data could not be saved." + error);
            } else {
                // alert("Data saved successfully.");
            }
        });
    });
});

exports.updateEmail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.auth().updateUser(req.body.uid, {
            email: req.body.email,
        })
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error updating user:", error);
        });
    });
});

exports.updatePassword = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.auth().updateUser(req.body.uid, {
            password: req.body.password
        })
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error updating user:", error);
        });
    });
});

exports.listAllUsers = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        function listAllUsers(nextPageToken) {
            // List batch of users, 1000 at a time.
            admin.auth().listUsers(1000, nextPageToken)
            .then(function(listUsersResult) {
                listUsersResult.users.forEach(function(userRecord) {
                    console.log("user", userRecord.toJSON());
                });
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    listAllUsers(listUsersResult.pageToken)
                }
            })
            .catch(function(error) {
                console.log("Error listing users:", error);
            });
        }
        // Start listing users from the beginning, 1000 at a time.
        listAllUsers();
    });
});

exports.deleteUser = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.auth().deleteUser(uid)
        .then(function() {
            console.log("Successfully deleted user");
        })
        .catch(function(error) {
            console.log("Error deleting user:", error);
        });
    });
});



