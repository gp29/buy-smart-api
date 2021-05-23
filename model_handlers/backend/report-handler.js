'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator');
const config = require('./../../config');
let async = require('async');
let _ = require('underscore');
const report_category = require('./../../models/report-category');
const FCM = require('fcm-node');

const get = function(req,done){
	let columnAndValue={}
	if(req.query.report_category_id){
		columnAndValue.report_category_id = req.query.report_category_id
	}
    if(req.query.status){
        columnAndValue.status = req.query.status
    }
	query.selectWithAndFilter(dbConstants.dbSchema.report_categories, columnAndValue, {
        _id: 0,
    }, {created_at:-1}, {}, (error, report_categories) => {
    	if (error) {
            logger('Error: can not get ', dbConstants.dbSchema.report_categories);
            done(errors.internalServer(true), null);
            return;
        }
        done(null,report_categories)
    });
};

const create = function(requestParam,done){
	query.insertSingle(dbConstants.dbSchema.report_categories,requestParam,function (error, language) {
		if (error) {
			logger('Error: can not create language');
			done(error, null);
			return;
		}
		done(null, language);
	});
};

const update = function(requestParam,done){
	query.updateSingle(dbConstants.dbSchema.report_categories,requestParam, { 'report_category_id':requestParam.report_category_id},function (error, language) {
		if (error) {
			logger('Error: can not update language');
			done(error, null);
			return;
		}
		done(null, language);
	});
};

const action  = (requestParam, done) => {
 	if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.report_categories, {
            'report_category_id': {
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
        done(null, {}); 
    }
};

const actionUserReported  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.reports, {
            'report_id': {
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
        done(null, {}); 
    }
};

const getUserReported = (req, done) => {
    let joinArr = [{
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'userDetails'
        }
    },  {
        $unwind: "$userDetails"
    },  {
        $lookup: {
            from: 'report_categories',
            localField: 'report_category_id',
            foreignField: 'report_category_id',
            as: 'catDetails'
        }
    },  { 
        $match : {}
    }, { 
        $sort : {created_at:-1}
    }, {
        $project: {
            _id: 0,
            report_id: "$report_id",
            message: "$message",
            name: "$userDetails.name",
            user_id: "$user_id",
            category:"$catDetails"
        }
    }];
    query.joinWithAnd(dbConstants.dbSchema.reports, joinArr, (error, response) => {
        if (error) {
            logger('Error: can not get record.');
            done(errors.internalServer(true), null);
            return;
        }
        _.each(response, (elem) => {
            let title = [];
            _.each(elem.category, (rec) => {
                title.push(rec.title)
            })
            elem.category = title.toString();
        })
        done(null, response)
    });
};


const sendNotification = (requestParam, done) => {
    query.selectWithAndOne(dbConstants.dbSchema.users, {user_id:requestParam.user_id}, {
        user_id: 1,
        device_token:1,
        _id: 0
    }, function(error, users) {
        if (error) {
            done(errors.internalServer(true));
            return;
        }
        const fcm = new FCM(config.push_server_key);
        const message = {
            registration_ids: [users.device_token],
            collapse_key: 'green',
            data: {
                title: 'Buy Smart',
                body: requestParam.message,
                type: 'report',
            }
        };
        fcm.send(message, function(error, response) {
            console.log(error);
            console.log(response);
        }) 
        done(null, {})
    });
};

module.exports = {
	get,
	create,
	action,
	update,
    actionUserReported,
    getUserReported,
    sendNotification
};