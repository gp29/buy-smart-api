'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
const idGenerator = require('./../../utils/id-generator');
let asyncLoop = require('async');
const result = require('./../../models/result');
const productHandler = require('./../../model_handlers/backend/product-handler');

const redis = require("redis");
const util = require('util');

//FOR IMAGE/PRODUCT KEY
const client = redis.createClient("redis://127.0.0.1:6379/0");
client.get = util.promisify(client.get);

//FOR GET RESULTS
const client2 = redis.createClient("redis://127.0.0.1:6379/1");
client2.get = util.promisify(client2.get);

const getResults = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            let indexArr = []
            let urls = requestParam.img_urls.split('|');

            asyncLoop.forEachSeries(urls, async function(singleRec, callbackSingleRec) {
                let Img_key = await productHandler.getImageKeyExtract(singleRec);
                let res = await client.get(Img_key);
                if(res){
                    indexArr.push(parseFloat(res))
                }
                callbackSingleRec();
            }, async function(){
                let products = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: indexArr}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
                insertResultData(products);
                resolve(products)
                return
            });
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const insertResultData = async(products) => {
    return new Promise(async(resolve, reject) => {
        try {
            idGenerator.generateId('results', 'result_id', 'RES', (err, ID) => {
                asyncLoop.forEachSeries(products, async function(singleRec, callbackSingleRec) {
                    singleRec = JSON.parse(JSON.stringify(singleRec));
                    singleRec.result_id = ID;
                    let result = await query.insertSingle(dbConstants.dbSchema.results, singleRec);
                    client2.set(singleRec.Product_key, ID);
                    callbackSingleRec();
                }, function(){
                    return false;
                });
            });
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};


const getImageKey = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            let Img_key = await productHandler.getImageKeyExtract(requestParam.Img_url);
            resolve(Img_key)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const getProductKey = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            let key = await productHandler.getProductKeyExtract(requestParam.Product_Url);
            resolve(key)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const dataInsert = async(singleRec, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            delete singleRec.Index;
            singleRec.Product_key = await productHandler.getProductKeyExtract(singleRec.Product_Url)

            singleRec.Img_key = await productHandler.getImageKeyExtract(singleRec.Img_url)
            let res = await client.get(singleRec.Img_key);
            if(!res){
                let product = await query.insertSingle(dbConstants.dbSchema.products, singleRec);
                client.set(singleRec.Img_key, product.Index);
                resolve({});
                return;
            }
            else{
                console.log("UPDATE RECORD")
                await query.updateSingle(dbConstants.dbSchema.products, singleRec, { Index: parseFloat(res) });
                await query.updateMultiple(dbConstants.dbSchema.results, singleRec, { Index: parseFloat(res) });
                resolve({});
                return;
            }
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const dataInsertPost = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            console.log(requestParam.data.length)
            asyncLoop.forEachSeries(requestParam.data, async function(singleRec, callbackSingleRec) {
                let res = await dataInsert(singleRec);
                callbackSingleRec();
            }, function(){
            });
            resolve({});
            return;
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const getCacheResults = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let arr = [];
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            let key = await productHandler.getProductKeyExtract(requestParam.Product_Url);
            let res = await client2.get(key);
            if(res){
                arr = await query.selectWithAnd(dbConstants.dbSchema.results, {result_id: {$in: res}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
            }
            resolve(arr)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};


module.exports = {
    getResults,
    getImageKey,
    getProductKey,
    dataInsert,
    dataInsertPost
};