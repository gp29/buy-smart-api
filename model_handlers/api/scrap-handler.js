'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let asyncLoop = require('async');
let _ = require('underscore');
const scrap = require('./../../models/scrap');

const list = async(req, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let settings = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0} );
            let skip = 0;
            let limit = settings.display_background_scrap || 10
            let response = await query.selectWithAndFilter(dbConstants.dbSchema.scraps, {}, {
                _id: 0,
                url:1
            }, {created_at:-1}, {
                skip,
                limit
            });
            response = _.pluck(response, 'url')
            resolve(response);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


const insert = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            requestParam.url = requestParam.url.split(',');
            asyncLoop.forEachSeries(requestParam.url, async function(singleRec, callbackSingleRec) {
                await query.insertSingle(dbConstants.dbSchema.scraps, {url:singleRec});
                callbackSingleRec();
            }, function(){
                resolve({});
                return;
            });
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


module.exports = {
    list,
    insert
};