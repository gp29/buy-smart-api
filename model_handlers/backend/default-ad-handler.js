'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const default_ad = require('./../../models/default-ad');
const productHandler = require('./../../model_handlers/backend/product-handler');


const get = function(req,done){
    query.selectWithAndFilter(dbConstants.dbSchema.default_ads, {}, {
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
    console.log(requestParam)
    requestParam.Product_Url = requestParam.Product_Url.split('|');
    async.forEachSeries(requestParam.Product_Url, async function(singleRec, callbackSingleRec) {
        let Product_key = await productHandler.getProductKeyExtract(singleRec)
        console.log(Product_key)
        query.selectWithAndFilterOne(dbConstants.dbSchema.products, {Product_key: Product_key}, {
            _id: 0,
            Product_key:1,
            category_id:1,
            Index:1
        }, {created_at:-1}, {}, (error, response) => {
            console.log(response)
            if(error || !response){
                callbackSingleRec();
            }
            else{
                let obj = {
                    Index: response.Index,
                    Product_key: response.Product_key,
                    Product_Url: singleRec,
                    category_id: response.category_id,
                }
                query.insertSingle(dbConstants.dbSchema.default_ads, obj, function(error, user) {
                    callbackSingleRec();
                });
            }
        });
    }, function(){
        done(null, {});
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.default_ads, {
            'default_ad_id': {
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