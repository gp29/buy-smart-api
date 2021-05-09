'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let async = require('async');
let _ = require('underscore');
const User = require('./../../models/user');

const signin = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.countRecord(dbConstants.dbSchema.users, { social_id: requestParam.social_id});
            if(response == 0){
                await query.insertSingle(dbConstants.dbSchema.users, requestParam);
            }
            else{
                await query.updateSingle(dbConstants.dbSchema.users, requestParam, { social_id: requestParam.social_id});
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

const updateDeviceToken = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, created_at:0, updated_at:0, __v:0} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            await query.updateSingle(dbConstants.dbSchema.users, requestParam, { user_id: requestParam.user_id});
            resolve({});
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};

const logout = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            await query.updateSingle(dbConstants.dbSchema.users, {user_login_type: 'logout'}, { user_id: requestParam.user_id});
            resolve({});
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};

const contactus = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            await query.insertSingle(dbConstants.dbSchema.contact_us, requestParam);
            resolve({});
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
            response = JSON.parse(JSON.stringify(response))
            if(response.mobile_country_code !=='' && response.mobile !==''){
                response.is_mobile_exists = true;
            }
            else{
                response.is_mobile_exists = false;
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

const aboutus = async(req, requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, requestParam.code));
                return;
            }

            let fullUrl = req.protocol + '://' + req.get('host');
            let about = await query.selectWithAnd(dbConstants.dbSchema.about_us, {}, { _id: 0} );
            _.each(about, (elem) => {
                elem.image = fullUrl+'/about/'+elem.image;
            });
            resolve(about);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


module.exports = {
    signin,
    profile,
    getLottieAnimation,
    updateDeviceToken,
    logout,
    contactus,
    aboutus
};