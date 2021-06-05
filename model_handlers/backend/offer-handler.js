'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const offer = require('./../../models/offer');
var fs = require('fs');
var mv = require('mv');

const get = function(req,done){
    let fullUrl = req.protocol + '://' + req.get('host');
    query.selectWithAndFilter(dbConstants.dbSchema.offers, {}, {
        _id: 0,
    }, {created_at:-1}, {}, (error, response) => {
        if(error){
            done(errors.internalServer(true));
            return;
        }
        _.each(response, (elem) => {
            elem.banner = fullUrl+'/banner/'+elem.banner;
        });
        done(null, response);
        return;
    });
};

const add = function(requestParam, req,done){
    mv(req.files.banner.path, './public/banner/'+req.files.banner.name, function(err) {
        if(err){
            done(errors.internalServer(true));
            return;
        }
        requestParam.banner = req.files.banner.name
        query.insertSingle(dbConstants.dbSchema.offers, requestParam, function (error, banner) {
            done(null, {})
        });
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.offers, {
            'offer_id': {
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
        done(null, data);  
    }
};



module.exports = {
	add,
    get,
    action
};