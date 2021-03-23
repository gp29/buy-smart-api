'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let async = require('async');
const User = require('./../../models/user');

// var firebase = require('firebase');
// firebase.initializeApp({
//     apiKey: "AIzaSyCql1zAlFz07DhBXjj-LRu332xeaHRydoE",
//     authDomain: "buysmartly-28aeb.firebaseapp.com",
//     databaseURL: "https://buysmartly-28aeb.firebaseio.com",
//     projectId: "buysmartly-28aeb",
//     storageBucket: "buysmartly-28aeb.appspot.com",
//     appId: "1:888452528083:android:2117432892cc1cbd1c6126"
// });

// firebase.auth().signInWithPhoneNumber('+917041077741')
// .then((confirmationResult) => {
//   console.log(confirmationResult)
// }).catch((error) => {
//  console.log(error)
// });

/*const confirmation = await firebase.auth().signInWithPhoneNumber('+91 7041077741');
console.log(confirmation)*/

const signin = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.countRecord(dbConstants.dbSchema.users, { social_id: requestParam.social_id});
            if(response == 0){
                await query.insertSingle(dbConstants.dbSchema.users, requestParam);
            }
            resolve(profile({ social_id: requestParam.social_id }, requestParam.code));
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


const profile = async(columnAndValues, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, columnAndValues, { _id: 0, created_at:0, updated_at:0, __v:0} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            resolve(response)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const getLottieAnimation = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, requestParam.code));
                return;
            }
            let joinArr = [{ 
                $sample : { size: 5 }
            }, { 
                $sort : {created_at:-1}
            }, {
                $project: {
                    _id: 0,
                    data: "$data",
                }
            }];
            let lotties = await query.joinWithAnd(dbConstants.dbSchema.lotties, joinArr);
            resolve(lotties)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};


module.exports = {
    signin,
    profile,
    getLottieAnimation
};