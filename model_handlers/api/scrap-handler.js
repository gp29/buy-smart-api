'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let asyncLoop = require('async');
let _ = require('underscore');
const scrap = require('./../../models/scrap');
const temp_scraps = require('./../../models/temp-scrap');
let fs = require('fs');

const { Entropy } = require('entropy-string')
const entropy = new Entropy()

const list = async(req, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let settings = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0} );
            let skip = 0;
            let limit = settings.display_background_scrap || 10
            let response = await query.selectWithAndFilter(dbConstants.dbSchema.scraps, {}, {
                _id: 0,
                scrap_id:1,
                url:1
            }, {created_at:-1}, {
                skip,
                limit
            });
            if(response.length > 0){
                insertTempRecord(response);
                response = _.pluck(response, 'url')
                await query.removeMultiple(dbConstants.dbSchema.scraps, {'url': {$in: response}}); 
            }
            resolve(response);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


const insertTempRecord = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            asyncLoop.forEachSeries(requestParam, async function(singleRec, callbackSingleRec) {
                await query.insertSingle(dbConstants.dbSchema.temp_scraps, singleRec);
                callbackSingleRec();
            }, function(){
                return false;
            });
        } catch (error) {
            console.log(error)
            return false;
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

const scrapDoneOrNot = async(requestParam) => {
    return new Promise(async(resolve, reject) => {
        try {
            await query.removeMultiple(dbConstants.dbSchema.temp_scraps, {'url': {$in: [requestParam.url]}}); 
            if(requestParam.done == 'no'){
                await query.insertSingle(dbConstants.dbSchema.scraps, {url: requestParam.url});
            }
            if(requestParam.html_string && requestParam.html_string!=''){
                let fileName = entropy.smallID()+'.txt'
                fs.writeFile('./public/files/'+fileName, requestParam.html_string, function(err) {
                    if(err) {
                        console.log('Error: can not write file ');
                        reject(errors.internalServer(true, requestParam.code));
                        return;
                    }
                    resolve({})
                }); 
            }
            else{
                resolve({})
            }
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


module.exports = {
    list,
    insert,
    scrapDoneOrNot
};