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
	appName: 'Buy Smart',
	port: '3001',
	mode: 'development',
	firebase:{
   		versionRef
   	}
};
