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

exports.sendEmailAlert = functions.database.ref('/userdevices/{pudhId}').onUpdate((event) => {
  const obj = event.data.val();
  const userId = event.data.ref.key;
  const devices = Object.getOwnPropertyNames(obj);
  return Object.keys(obj).map(i => obj[i]).forEach((device, id) => {
    // console.log("id: ", devices[id]);
    // console.log("val: ", val.filled);
    admin.database().ref('users/'+userId).on('value', function(snapshot) {
      const info = snapshot.val();
      const myLevel = info.settings.fillLevel;
      const displayName = info.firstname;
      const email = info.email;
      if(info.settings.emailNotification && (device.filled >= myLevel)) {
        const data = {"date":admin.database.ServerValue.TIMESTAMP, "device":devices[id], "fillLevel":device.filled};
        admin.database().ref('notifications/'+userId).child(devices[id]).set(data);
        return Promise.all([sendEmailAlert(email, displayName, devices[id], device.filled)]);
      }
      else return 0;
    });
  });
});

function sendEmailAlert(email, displayName, deviceId, level) {
  const mailOptions = {
    from: `${APP_NAME} <noreply@yourapp.firebaseapp.com>`,
    to: email,
  };
  mailOptions.subject = `Alert from your ${APP_NAME} device!`;
  mailOptions.text = `Hey ${displayName || ''}! Your device ${deviceId} is ${level}% filled.`;
  return new Promise((resolve, reject) => {
    mailTransport.sendMail(mailOptions).then(() => {
      console.log('New alert email sent to:', email);
      resolve(true);
    });
  });
}

exports.createUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    console.log('TESTINGG');
    admin.auth().createUser({
        email: req.body.email,
        password: '123456'
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
    admin.auth().getUser(req.body.uid)
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

exports.addIotDevice = functions.https.onRequest((req, res) => {
  // cors(req, res, () => {
    
  // });
});

exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    admin.auth().deleteUser(req.body.uid)
      .then(function() {
        console.log("Successfully deleted user");
        res.json({
           status: "ok"
         });
      })
      .catch(function(error) {
        console.log("Error deleting user:", error);
      });
  });
});

exports.receiveTelemetry = functions.pubsub.topic('fiu-test').onPublish(event => {
    const attributes = event.data.attributes;
    const deviceId = attributes['deviceId'];
    const pubSubMessage = event.data;
    // Decode the PubSub Message body.
    const messageBody = pubSubMessage.data ? Buffer.from(pubSubMessage.data,'base64').toString() : null;
    console.log("Message: ",JSON.parse(messageBody));
    const data = JSON.parse(messageBody);
    // var location = [parseFloat(data[1]), parseFloat(data[2])];

    return Promise.all([
      updateCurrentDataFirebase(deviceId, data)
    ]);
  });

// Maintain last status in firebase
function updateCurrentDataFirebase(deviceId, data) {
  return admin.database().ref('deviceusers/'+deviceId).on('value', function(snapshot) {
    const users = snapshot.val()
    return Object.keys(users).forEach(function(id) {
      // console.log(key);
      admin.database().ref('userdevices/'+id).child(deviceId).update({'lastseen': admin.database.ServerValue.TIMESTAMP});
      admin.database().ref('userdevices/'+id).child(deviceId).update(data)
    });
  });

}
