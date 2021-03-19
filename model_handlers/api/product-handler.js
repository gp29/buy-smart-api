'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let asyncLoop = require('async');
const productHandler = require('./../../model_handlers/backend/product-handler');

const redis = require("redis");

//FOR IMAGE/PRODUCT KEY
const client = redis.createClient("redis://127.0.0.1:6379/0");
client.on("error", function(error) {
    console.error("redis err: ",error);
});

//FOR GET RESULTS
const client2 = redis.createClient("redis://127.0.0.1:6379/1");
client2.on("error", function(error) {
    console.error("redis err: ",error);
});

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
                client.get(Img_key, function(err, res) {
                    if(res){
                        indexArr.push(parseFloat(res))
                    }
                    callbackSingleRec();
                });
            }, async function(){
                let products = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: indexArr}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
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
            client.get(singleRec.Img_key, async function(err, res) {
                if(!res){
                    let product = await query.insertSingle(dbConstants.dbSchema.products, singleRec);
                    client.set(singleRec.Img_key, product.Index);
                    resolve({});
                    return;
                }
                else{
                    res = parseFloat(res)
                    await query.updateSingle(dbConstants.dbSchema.products, singleRec, { Index: res });
                    resolve({});
                    return;
                }
            });
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
    dataInsert
};