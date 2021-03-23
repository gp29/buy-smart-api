'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const lottie = require('./../../models/lottie');
var fs = require('fs');



const get = function(req,done){
    query.selectWithAndFilter(dbConstants.dbSchema.lotties, {}, {
        _id: 0,
    }, {created_at:-1}, {}, (error, response) => {
        if(error){
            done(errors.internalServer(true));
            return;
        }
        done(null, response);
        return;
    });
};

const upload = function(requestParam, req, done){
    let rawdata = fs.readFileSync(req.files.lottie.path);
    requestParam.data = JSON.parse(rawdata);
    query.insertSingle(dbConstants.dbSchema.lotties, requestParam, function (error, banner) {
        done(null, {})
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.lotties, {
            'lottie_id': {
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
	upload,
    get,
    action
};