'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const config = require('./../../config');
const passwordHandler = require('./../../utils/password');
const Admin = require('./../../models/admin');

const login = function(requestParam, done){
	query.selectWithAndOne(dbConstants.dbSchema.admins, {email: requestParam.email}, {
        admin_id: 1,
        password:1,
        name:1,
        mobile_country_code:1,
        mobile:1,
        profile_picture:1,
        status:1
    }, async (error, response) => {
        if (error) {
            done(errors.internalServer(true));
            return;
        }
        if (!response) {
            done(errors.resourceNotFound(true), null);
            return;
        }
        if (response.status == 'inactive') {
            done(errors.duplicateUser(true), null);
            return;
        }
        let encryptPassword = await passwordHandler.encrypt(requestParam.password.toString());
        if(encryptPassword != response.password){
            done(errors.invalidPassword(true), null);
            return;
        }
        done(null, response);
        return;
    });
};

const forgot = function(requestParam, done){
    query.selectWithAndOne(dbConstants.dbSchema.admins, {email: requestParam.email}, {
        admin_id: 1,
        name:1,
        status:1
    }, async (error, response) => {
        if (error) {
            done(errors.internalServer(true));
            return;
        }
        if (!response) {
            done(errors.resourceNotFound(true), null);
            return;
        }
        if (response.status == 'inactive') {
            done(errors.duplicateUser(true), null);
            return;
        }
        const code = 'USE'+Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1);
        query.updateSingle(dbConstants.dbSchema.admins, {reset_code:code}, {
            admin_id: response.admin_id
        }, (error) => {
            done(null, response);
            return;
        });
    });
};

const reset = async function(requestParam, done) {
    let subId = requestParam.code.substring(0, 3);
    let encryptPassword = await passwordHandler.encrypt(requestParam.password.toString());
    let columnAndValuesUpdate = {
        reset_code: '',
        password: encryptPassword
    }
    query.selectWithAndOne(dbConstants.dbSchema.admins, {
        reset_code: requestParam.code
    }, {
        admin_id: 1,
        _id: 0
    }, function(error, user) {
        if (!user) {
            done(errors.resourceNotFound(true), null);
            return;
        } else {
            query.updateSingle(dbConstants.dbSchema.admins, columnAndValuesUpdate, {
                admin_id: user.admin_id
            }, function(error, updateConsumer) {
                if (error) {
                    done(errors.resourceNotFound(true), null);
                    return;
                } else {
                    done(null, {});
                }
            });
        }
    }); 
};

module.exports = {
	login,
    forgot,
    reset
};