'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const Admin = require('./../../models/admin');
const passwordHandler = require('./../../utils/password');

const get = function(req,done){
	let columnAndValue={}
	if(req.query.admin_id){
        columnAndValue.admin_id = req.query.admin_id;
        query.selectWithAndFilter(dbConstants.dbSchema.admins, columnAndValue, {
            _id: 0,
        }, {created_at:-1}, {}, (error, response) => {
            if (error) {
                logger('Error: can not get ', dbConstants.dbSchema.admins);
                done(errors.internalServer(true), null);
                return;
            }
            if(req.query.status){
                done(null,response)
            }
            else{
                response = response[0]
                done(null,response)
            }
        });
	}
    else{
    	query.selectWithAndFilter(dbConstants.dbSchema.admins, columnAndValue, {
            _id: 0,
        }, {created_at:-1}, {}, (error, response) => {
        	if (error) {
                logger('Error: can not get ', dbConstants.dbSchema.admins);
                done(errors.internalServer(true), null);
                return;
            }
            done(null,response)
        });
    }
};

const create = async function(requestParam, req, done){
    requestParam.email = requestParam.email.trim();
    let regexEmail = new RegExp(['^', requestParam.email, '$'].join(''), 'i');
    let compareColumnAndValues = {
        $or: [{
            email: regexEmail
        }, {
            mobile: requestParam.mobile,
            mobile_country_code: requestParam.mobile_country_code,
        }]
    };
    query.selectWithAndOne(dbConstants.dbSchema.admins, compareColumnAndValues, {
        admin_id: 1
    }, async(error, exists) => {
        if (error) {
            done(errors.internalServer(true));
            return;
        }
        if (exists) {
            done(errors.duplicateUser(true), null);
            return;
        }
        let encryptPassword = await passwordHandler.encrypt(requestParam.password.toString());
        requestParam.password = encryptPassword;
        query.insertSingle(dbConstants.dbSchema.admins, requestParam, function(error, user) {
            if (error) {
                logger('Error: can not create user');
                done(error, null);
                return;
            }
            done(null, user);
        });
    });
};

const update = function(requestParam, req, done){
    requestParam.email = requestParam.email.trim();
    let regexEmail = new RegExp(['^', requestParam.email, '$'].join(''), 'i');
    let compareColumnAndValues = {
        $and: [{
            $or: [{
                email: regexEmail
            }, {
                mobile: requestParam.mobile,
                mobile_country_code: requestParam.mobile_country_code,
            }]
        }, {
            admin_id: {
                $ne: requestParam.admin_id
            }
        }]

    };
    query.selectWithAndOne(dbConstants.dbSchema.admins, compareColumnAndValues, {
        admin_id: 1,
    }, async(error, exists) => {
        if (error) {
            done(errors.internalServer(true));
            return;
        }
        if (exists) {
            done(errors.duplicateUser(true), null);
            return;
        }
    	query.updateSingle(dbConstants.dbSchema.admins, requestParam, {
            'admin_id': requestParam.admin_id
        }, function(error, user) {
            if (error) {
                logger('Error: can not update push Notification');
                done(error, null);
                return;
            }
            done(null, user);
        });
    });
};


const action  = (requestParam, done) => {
 	if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.admins, {
            'admin_id': {
                $in: requestParam['ids']
            }
        }, function(error, data) {
            if (error) {
                logger('Error: can not delete ');
                done(error, null);
                return;
            }
            done(null, data);
        });       
    }
    else
    {
        let columnsToUpdate = {
            status: requestParam['type']
        };
       query.updateMultiple(dbConstants.dbSchema.admins, columnsToUpdate, {
            'admin_id': {
                $in: requestParam['ids']
            }
        }, function(error, data) {
            if (error) {
                logger('Error: can not update ');
                done(error, null);
                return;
            }
            done(null, data);
        });  
    }
};


module.exports = {
	get,
	create,
	action,
	update,
};