'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
const idGenerator = require('./../../utils/id-generator');
let _ = require('underscore');
let asyncLoop = require('async');
const result = require('./../../models/result');
const Product = require('./../../models/product');
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
                await query.updateMultiple(dbConstants.dbSchema.products, { $inc: { Query_count: 1 } }, { Index: {$in: indexArr} });
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
                let updateObj = {};
                if(singleRec.category_id && (singleRec.category_id!='' || singleRec.category_id!='null' || singleRec.category_id!='NULL')){
                    updateObj.category_id = singleRec.category_id
                }
                if(singleRec.Host && (singleRec.Host!='' || singleRec.Host!='null' || singleRec.Host!='NULL')){
                    updateObj.Host = singleRec.Host
                }
                if(singleRec.Img_key && (singleRec.Img_key!='' || singleRec.Img_key!='null' || singleRec.Img_key!='NULL')){
                    updateObj.Img_key = singleRec.Img_key
                }
                if(singleRec.Product_key && (singleRec.Product_key!='' || singleRec.Product_key!='null' || singleRec.Product_key!='NULL')){
                    updateObj.Product_key = singleRec.Product_key
                }
                if(singleRec.Brand_name && (singleRec.Brand_name!='' || singleRec.Brand_name!='null' || singleRec.Brand_name!='NULL')){
                    updateObj.Brand_name = singleRec.Brand_name
                }
                if(singleRec.Product_Title && (singleRec.Product_Title!='' || singleRec.Product_Title!='null' || singleRec.Product_Title!='NULL')){
                    updateObj.Product_Title = singleRec.Product_Title
                }
                if(singleRec.Product_Url && (singleRec.Product_Url!='' || singleRec.Product_Url!='null' || singleRec.Product_Url!='NULL')){
                    updateObj.Product_Url = singleRec.Product_Url
                }
                if(singleRec.Img_url && (singleRec.Img_url!='' || singleRec.Img_url!='null' || singleRec.Img_url!='NULL')){
                    updateObj.Img_url = singleRec.Img_url
                }
                if(singleRec.Mrp && (singleRec.Mrp!='' || singleRec.Mrp!='null' || singleRec.Mrp!='NULL')){
                    updateObj.Mrp = singleRec.Mrp
                }
                if(singleRec.SellPrice && (singleRec.SellPrice!='' || singleRec.SellPrice!='null' || singleRec.SellPrice!='NULL')){
                    updateObj.SellPrice = singleRec.SellPrice
                }
                if(singleRec.Discount && (singleRec.Discount!='' || singleRec.Discount!='null' || singleRec.Discount!='NULL')){
                    updateObj.Discount = singleRec.Discount
                }
                if(singleRec.Colour && (singleRec.Colour!='' || singleRec.Colour!='null' || singleRec.Colour!='NULL')){
                    updateObj.Colour = singleRec.Colour
                }
                if(singleRec.Rating_Count && (singleRec.Rating_Count!='' || singleRec.Rating_Count!='null' || singleRec.Rating_Count!='NULL')){
                    updateObj.Rating_Count = singleRec.Rating_Count
                }
                if(singleRec.Review_Count && (singleRec.Review_Count!='' || singleRec.Review_Count!='null' || singleRec.Review_Count!='NULL')){
                    updateObj.Review_Count = singleRec.Review_Count
                }
                if(singleRec.Rating_Star && (singleRec.Rating_Star!='' || singleRec.Rating_Star!='null' || singleRec.Rating_Star!='NULL')){
                    updateObj.Rating_Star = singleRec.Rating_Star
                }
                if(singleRec.Time_stamp){
                    updateObj.Time_stamp = new Date()
                }
                if(singleRec.SS_update){
                    updateObj['$inc'] = { SS_update: 1 }
                }
                if(singleRec.CS_update){
                    updateObj['$inc'] = { CS_update: 1 }
                }
                await query.updateSingle(dbConstants.dbSchema.products, updateObj, { Index: parseFloat(res) });
                await query.updateMultiple(dbConstants.dbSchema.results, updateObj, { Index: parseFloat(res) });
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

const dataInsertAndroid = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            requestParam.data = JSON.parse(requestParam.data)
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

const getAds = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let adArr = [];
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            let key = await productHandler.getProductKeyExtract(requestParam.Product_Url);
            let res = await client2.get(key);
            if(res){
                let settings = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0} );
                let ads = await query.selectWithAndFilter(dbConstants.dbSchema.ads, {}, {
                    _id: 0,
                    Index:1
                }, {created_at:-1}, {});
                let displayProducts = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: _.pluck(ads, 'Index')}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
                
                let remain = settings.display_ad - displayProducts.length
                
                let skip = 0;
                let limit = remain
                let product = await query.selectWithAndOne(dbConstants.dbSchema.products, {Product_key: key}, { _id: 0, category_id:1} );
                let cateArr = await query.selectWithAndFilter(dbConstants.dbSchema.products, {category_id: {$in: [product.category_id]}}, {
                    _id: 0,
                    created_at: 0,
                    updated_at: 0,
                    __v: 0,
                }, {Query_count: -1, created_at:-1}, {
                    skip,
                    limit
                });
                displayProducts.push(cateArr)
                adArr = _.flatten(displayProducts);
            }
            resolve(adArr)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const feed = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }

            let arr = [];
            let feeds = await query.selectWithAnd(dbConstants.dbSchema.feeds, {}, { _id: 0, Index:1} );
            arr = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: _.pluck(feeds, 'Index')}}, { _id: 0, created_at:0, updated_at:0, __v:0} );

            let limit = 20;
            let page = parseFloat(requestParam.page) - 1;
            let skip = page * limit;
            let data = await query.selectWithAndFilter(dbConstants.dbSchema.products, {Index: {$nin: _.pluck(feeds, 'Index')}}, {
                _id: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
            }, {Query_count: -1, created_at:-1}, {
                skip,
                limit
            });
            arr.push(data);
            arr = _.flatten(arr)
            resolve(arr);
            return;
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
    dataInsertPost,
    getCacheResults,
    feed,
    dataInsertAndroid,
    getAds
};