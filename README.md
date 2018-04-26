# Smart-Stormwater-Smart-City-System-2.0

### Top-level directory structure
    .
    ├── functions                   # Firebase functions (backend)
    │   ├── index.js
    │   ├── package-lock.json
    │   └── package.json
    ├── public                      # Webapp files (firebase hosting)
    │   ├── index.html
    │   ├── assets
    │   │   ├── css
    │   │   │   ├── bootstrap.min.css
    │   │   │   ├── material-dashboard.css
    │   │   │   └── style.css
    │   │   ├── js
    │   │   │   ├── account
    │   │   │   │   └── account.controller.js
    │   │   │   ├── dashboard
    │   │   │   │   └── dashboard.controller.js
    │   │   │   ├── devices
    │   │   │   │   ├── devices.controller.js
    │   │   │   │   └── devices.service.js
    │   │   │   ├── notifications
    │   │   │   │   └── notifications.controller.js
    │   │   │   ├── settings
    │   │   │   │   └── settings.controller.js
    │   │   │   ├── users
    │   │   │   │   ├── users.controller.js    
    │   │   │   │   └── users.service.js
    │   │   │   ├── app.js
    │   │   │   ├── arrive.min.js
    │   │   │   ├── auth.js
    │   │   │   ├── bootstrap-notify.js
    │   │   │   ├── bootstrap.min.js
    │   │   │   ├── chartist.min.js
    │   │   │   ├── demo.js
    │   │   │   ├── jquery-3.2.1.min.js
    │   │   │   ├── material-dashboard.js
    │   │   │   ├── material.min.js
    │   │   │   └── perfect-scrollbar.jquery.min.js
    │   │   └── sass
    │   │   │   ├── material-dashboard.scss
    │   │   │   └── md                      # Material design files
    │   ├── login
    │   │   ├── app.js
    │   │   ├── index.html
    │   │   └── style.css
    │   └── views
    │   │   ├── account.html
    │   │   ├── dashboard.html
    │   │   ├── devices.html
    │   │   ├── maps.html
    │   │   ├── notifications.html
    │   │   ├── settings.html
    │   │   └── users.html
    └── README.md
    
### Installation

Download and install npm
```
npmjs.com
```
Install firebase cli from your terminal or command prompt
```
$ npm install -g firebase-tools
```
In the in Smart-Stormwater-Smart-City-System-2.0/functions folder, run
```
$ npm install
```
In the in Smart-Stormwater-Smart-City-System-2.0 folder, run
```
$ firebase init
```
Then run to deploy the webapp files and the functions files.
```
$ firebase deploy
```
To deploy only webapp files, run
```
$ firebase deploy --only hosting
```
and to deploy only functions files, run
```
$ firebase deploy --only functions
```

