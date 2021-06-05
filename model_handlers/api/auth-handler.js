'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let async = require('async');
let _ = require('underscore');
const User = require('./../../models/user');
var mv = require('mv');

const signin = async(requestParam, req) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.countRecord(dbConstants.dbSchema.users, { social_id: requestParam.social_id});
            if(req.files){
                if(req.files.profile_picture){
                    requestParam.profile_picture = await new Promise((solve, reject) => {
                        mv(req.files.profile_picture.path, './public/profile_picture/'+req.files.profile_picture.name, function(err) {
                            if(err){
                                reject(errors.internalServer(true, requestParam.code));
                                return;
                            }
                            solve(req.files.profile_picture.name)
                        });
                    });
                }
            }
            if(response == 0){
                await query.insertSingle(dbConstants.dbSchema.users, requestParam);
            }
            else{
                await query.updateSingle(dbConstants.dbSchema.users, requestParam, { social_id: requestParam.social_id});
            }
            resolve(profile({ social_id: requestParam.social_id }, req, requestParam.code));
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
            let response = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0, email:1, mobile:1, address:1} );
            resolve(response);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


const profile = async(columnAndValues, req, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let fullUrl = req.protocol + '://' + req.get('host');
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, columnAndValues, { _id: 0, created_at:0, updated_at:0, __v:0} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            response = JSON.parse(JSON.stringify(response))
            if(response.profile_picture && response.profile_picture!=''){
                response.profile_picture = fullUrl+'/profile_picture/'+response.profile_picture;
            }
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

const offer = async(requestParam, req) => {
    let fullUrl = req.protocol + '://' + req.get('host');
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, requestParam.code));
                return;
            }
            let columnAndValues = {};
            if(requestParam.host){
                columnAndValues.host = requestParam.host
            }
            let obj = {}
            let offers = await query.selectWithAnd(dbConstants.dbSchema.offers, columnAndValues, { _id: 0, created_at:0, updated_at:0, __v:0} );
            _.each(offers, (elem) => {
                elem.banner = fullUrl+'/banner/'+elem.banner;
                let keys = Object.keys(obj)
                if(keys.includes(elem.host) == true){
                    let arr = obj[elem.host]
                    arr.push(elem);
                    arr = _.flatten(arr)
                    obj[elem.host] = arr
                }
                else{
                    obj[elem.host] = [elem]
                }
            })
            resolve(obj);
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
    aboutus,
    offer
};