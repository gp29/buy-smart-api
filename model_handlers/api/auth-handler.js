'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let async = require('async');
const User = require('./../../models/user');

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


module.exports = {
    signin,
    profile,
};