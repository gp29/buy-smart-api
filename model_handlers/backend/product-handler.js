'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
let fs = require('fs');
const product = require('./../../models/product');

const get = function(requestParam, done){
	let page = requestParam.page ? requestParam.page : 0;
    let limit = requestParam.sizePerPage ? requestParam.sizePerPage : 50;
    var obj = {};
    let skip = page * limit;
    query.countRecord(dbConstants.dbSchema.products, {}, function(error, count) {
        query.selectWithAndFilter(dbConstants.dbSchema.products, {}, {
            _id: 0,
        }, {created_at:-1}, {
            skip,
            limit
        }, (error, response) => {
            if (error) {
                logger('Error: can not get ', dbConstants.dbSchema.products);
                done(errors.internalServer(true), null);
                return;
            }
            obj.product = response;
            obj.count = count;
            done(null, obj);
        });
    });
};

const importFile = function(req, done){
    let requestParam = fs.readFileSync(req.files.json_file.path, "utf8");
    requestParam = JSON.parse(requestParam);
    async.forEachSeries(requestParam, async function(singleRec, callbackSingleRec) {
        query.insertSingle(dbConstants.dbSchema.products, singleRec, function (error, product) {
            callbackSingleRec();
        });
    },function(){
        done(null, {});
    });
};

module.exports = {
	get,
    importFile
};