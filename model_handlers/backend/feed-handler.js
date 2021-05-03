'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const feed = require('./../../models/feed');
const productHandler = require('./../../model_handlers/backend/product-handler');
const productAPIHandler = require('./../../model_handlers/api/product-handler');

const redis = require("redis");

//FOR IMAGE/PRODUCT KEY
const client = redis.createClient("redis://127.0.0.1:6379/0");
client.on("error", function(error) {
    console.error("redis err: ",error);
});

const get = function(req,done){
    query.selectWithAndFilter(dbConstants.dbSchema.feeds, {}, {
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

const add = function(requestParam,done){
    requestParam.Img_url = requestParam.Img_url.split('|');
    async.forEachSeries(requestParam.Img_url, async function(singleRec, callbackSingleRec) {
        let Img_key = await productHandler.getImageKeyExtract(singleRec)
        client.get(Img_key, function(err, res) {
            if(res){
                let obj = {
                    Index: parseFloat(res),
                    Img_key: Img_key,
                    Img_url: singleRec,
                }
                query.insertSingle(dbConstants.dbSchema.feeds, obj, function(error, user) {
                    callbackSingleRec();
                });
            }
            else{
                callbackSingleRec();
            }
        });
    }, function(){
        done(null, {});
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.feeds, {
            'feed_id': {
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

const createProduct = (requestParam,done) => {
    return new Promise(async(resolve, reject) => {
        try {
            let res = await productAPIHandler.dataInsert(requestParam);
            done(null, {});
            return;
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};


module.exports = {
	add,
    get,
    action,
    createProduct
};