const functions = require('firebase-functions');
const admin = require('firebase-admin');
var cors = require('cors')({origin: true});
admin.initializeApp(functions.config().firebase);
const nodemailer = require('nodemailer');
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {user: gmailEmail, pass: gmailPassword},
});
const APP_NAME = 'SOP Systems';

exports.sendEmailAlert = functions.database.ref('/userdevices').onUpdate((event) => {
  // const user = event.data; // The Firebase user.
  const email = "migherr@hotmail.com"; // The email of the user.
  const displayName = "Miguel"; // The display name of the user.
  console.log(event);
  // return sendEmailAlert(email, displayName);
});

function sendEmailAlert(email, displayName) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@broadcastapp-1119.firebaseapp.com>`,
    to: email,
  };
  mailOptions.subject = `Alert from your ${APP_NAME} device!`;
  mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. Your device alert!.`;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('New alert email sent to:', email);
  });
}

exports.createUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    admin.auth().createUser({
        email: req.body.email,
        password: 'req.body.password'
      })
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully created new user:", userRecord.uid);

        console.log("Adding new user to Realtime DB:", userRecord.uid);

        var db = admin.database();

        var userRef = db.ref("users");
        var user = {};
        user = {
          firstname: '',
          lastname: '',
          email: req.body.email,
          role: req.body.role,
          department: req.body.department,
          parentid: req.body.parentid,
          phoneNumber:'',
          settings: {
            emailNotification: false,
            smsNotification: false,
            fillLevel: 60
          }
        };
        userRef.child(userRecord.uid)
          .set(user, function(error) {
            if (error) {
              console.log("New user could not be saved to Realtime DB ", error);
            } else {
              console.log("Successfully added new user to Realtime DB:", userRecord.uid);
            }
          });

        var subuserRef = db.ref("subusers");
        subuserRef.child(req.body.parentid + "/" + userRecord.uid).set(user, function(error){
          if (error) {
            console.log("New user could not be saved to subusers ", error);
          } else {
            console.log("Successfully added new user to subusers:", userRecord.uid);
          }
        });

        res.json({
          status: "ok"
        });

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
    var ref = db.ref("users");
    var user = {};
    user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      role: req.body.role,
      department: req.body.department,
      phoneNumber: req.body.phoneNumber
    };
    ref.child(req.body.uid)
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
    admin.auth().deleteUser(req.body.uid)
      .then(function() {
        console.log("Successfully deleted user");
      })
      .catch(function(error) {
        console.log("Error deleting user:", error);
      });
  });
});

exports.addIotcore = 

exports.receiveTelemetry = functions.pubsub.topic('fiu-test').onPublish(event => {
    const attributes = event.data.attributes;
    const deviceId = attributes['deviceId'];
    const pubSubMessage = event.data;
    // Decode the PubSub Message body.
    const messageBody = pubSubMessage.data ? Buffer.from(pubSubMessage.data,'base64').toString() : null;
    // console.log(JSON.parse(messageBody));
    const data = JSON.parse(messageBody);
    // var location = [parseFloat(data[1]), parseFloat(data[2])];

    return Promise.all([
      updateCurrentDataFirebase(deviceId, data)
    ]);
  });

/** 
 * Maintain last status in firebase
*/
function updateCurrentDataFirebase(deviceId, data) {
  var updateData = {};
  updateData[`deviceusers/${deviceId}`] = data;
  updateData[`userdevices/userid`] = data;
  admin.database().ref('deviceusers').child(deviceId).update({'lastseen': admin.database.ServerValue.TIMESTAMP});
  return admin.database().ref().update(updateData);

  // return admin.database().ref('deviceusers').child(deviceId).update(data).then(function() {
  //    return admin.database().ref('userdevices/userid').child(deviceId).update(data).then(function() {
  // }, function(error) {
  //    console.log("Error: " + error);
  // });
}
// go deviceusers/deviceid=>forEach (userid) {
//  userdevices/userid/deviceid=>update(data)
// }
 