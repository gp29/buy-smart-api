'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const report_category = require('./../../models/report-category');

/*
 * Used to get report_categories
 * @param {Function} done - Callback function with error, data params
 */
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

/*
 * Used to create language 
 * @param {requestParam} - request parameters from body
 * @param {Function} done - Callback function with error, data params
 */
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


/*
 * Used to update language by id 
 * @param {requestParam} - Object
 * @param {Function} done - Callback function with error, data params
 */
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

/*
 * Used to action update by id
 * @param {requestParam} - Object
 * @param {Function} done - Callback function with error, data params
 */
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
        $match : {}
    }, { 
        $sort : {created_at:-1}
    }, {
        $project: {
            _id: 0,
            report_id: "$report_id",
            message: "$message",
            user: "$userDetails.name",
            user_id: "$user_id",
        }
    }];
    query.joinWithAnd(dbConstants.dbSchema.reports, joinArr, (error, response) => {
        if (error) {
            logger('Error: can not get record.');
            done(errors.internalServer(true), null);
            return;
        }
        done(null, response)
    });
};


module.exports = {
	get,
	create,
	action,
	update,
    actionUserReported,
    getUserReported
};