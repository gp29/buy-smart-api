'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator');
const queryApi = require('./../../utils/query-creator-api');
let asyncLoop = require('async');
let _ = require('underscore');
const Setting = require('./../../models/settings');

const redis = require("redis");
const util = require('util');
//FOR FEED CACHE
const client3 = redis.createClient("redis://127.0.0.1:6379/2");
client3.get = util.promisify(client3.get);

const get = function(req,done){
	query.selectWithAndFilterOne(dbConstants.dbSchema.settings, {}, {
        _id: 0,
    }, {}, {}, (error, settings) => {
    	if (error) {
            logger('Error: can not get ', dbConstants.dbSchema.settings);
            done(errors.internalServer(true), null);
            return;
        }
        done(null,settings ? settings : {})
    });
};


const update = function(requestParam,done){
	query.selectWithAndFilterOne(dbConstants.dbSchema.settings, {}, {
        _id: 0,
        settings_id:1
    }, {}, {}, (error, settings) => {
        if (error) {
            logger('Error: can not get ', dbConstants.dbSchema.settings);
            done(errors.internalServer(true), null);
            return;
        }
        if(settings){
            query.updateSingle(dbConstants.dbSchema.settings,requestParam, { 'settings_id':settings.settings_id},function (error, settings) {
                if (error) {
                    logger('Error: can not update settings');
                    done(error, null);
                    return;
                }
                done(null, {});
            });
        }
        else{
            query.insertSingle(dbConstants.dbSchema.settings,requestParam,function (error, settings) {
                if (error) {
                    logger('Error: can not create settings');
                    done(error, null);
                    return;
                }
                done(null, {});
            });
        }
    });
};

const setFeed = (requestParam, done) => {
    client3.flushdb( function (err, succeeded) {
        console.log(succeeded);
        query.selectWithAndFilterOne(dbConstants.dbSchema.settings, {}, {
            _id: 0,
            product_feed:1
        }, {}, {}, async (error, settings) => {
            let product_feed = settings.product_feed ? parseFloat(settings.product_feed) : 20;
            let skip = 0;
            let limit = product_feed * product_feed;
            let data = await queryApi.selectWithAndFilter(dbConstants.dbSchema.products, {}, {
                _id: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
            }, {Query_count: -1}, {
                skip,
                limit
            });
            let range = _.pluck(data, 'Index')
            asyncLoop.forEachSeries(_.range(1, (product_feed + 1)), async function(element, callbackSingleRec) {
                let arr = _.first(range, product_feed);
                let setData = [];
                _.each(arr, (num) => {
                    range = _.without(range, num);
                    let val = _.where(data, {Index: num})
                    setData.push(val[0])
                })
                client3.set(element, JSON.stringify(setData));
                callbackSingleRec();
            }, function(){
                return false;
            });
        });
    });
};

module.exports = {
	get,
	update,
    setFeed
};