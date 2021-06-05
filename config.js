'use strict';

const admin = require('firebase-admin');
const trackerConfig = require('./public/firebase/tracker_configuration.json');
const serviceAccount = require('./public/firebase/firebase.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: trackerConfig.databaseURL,
});
const firebaseDBRef = admin.database();
const versionRef = admin.database().ref('version_selectors');

module.exports = {
	default_language:'EN',
	base_url:'http://localhost:3001/',
	//base_url:'http://143.110.249.142:3001/',
	appName: 'Buy Smart',
	port: '3001',
	mode: 'development',
	push_server_key: 'AAAAztvlt9M:APA91bEEEX2E8nSr2EeBG1ZhinA7ON1977Bc-er9vu-TWc77DjVD2Qlx73yqhhrssvRyJknazC2OSh7X0M6on4El55ZD25bjHUjTUa1wAJk0GAd08oDbmvvYGBE5mVL1f7yp9zkCunAP',
	firebase:{
   		versionRef
   	}
};
