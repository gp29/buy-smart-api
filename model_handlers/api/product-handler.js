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
const moment = require('moment');
const { forEach } = require('p-iteration');

const redis = require("redis");
const util = require('util');

//FOR IMAGE/PRODUCT KEY
const client = redis.createClient("redis://127.0.0.1:6379/0");
client.get = util.promisify(client.get);

//FOR GET RESULTS
const client2 = redis.createClient("redis://127.0.0.1:6379/1");
client2.get = util.promisify(client2.get);

//FOR FEED CACHE
const client3 = redis.createClient("redis://127.0.0.1:6379/2");
client3.get = util.promisify(client3.get);

//FOR Ad CACHE
const client4 = redis.createClient("redis://127.0.0.1:6379/3");
client4.get = util.promisify(client4.get);

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
                updateQueryCountGetResult(indexArr)
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

const updateQueryCountGetResult = async(indexArr) => {
    return new Promise(async(resolve, reject) => {
        try {
            await forEach(indexArr, async(element) => {
                let res = await query.updateSingle(dbConstants.dbSchema.products, { $inc: { Query_count: 1 } }, { Index: element });
                await query.updateSingle(dbConstants.dbSchema.results, { $inc: { Query_count: 1 } }, { Index: element });
            });
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    })
}

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
                singleRec.Discount = 100 - ((parseFloat(singleRec.SellPrice) * 100) / parseFloat(singleRec.Mrp));
                singleRec.Price_arr = [{
                    date: moment(new Date()).format('YYYY-MM-DD'),
                    price: parseFloat((singleRec.SellPrice).match(/\d/g))
                }]
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

                if(!singleRec.Mrp){
                    singleRec.Mrp = singleRec.SellPrice
                }
                if(!singleRec.SellPrice){
                    singleRec.SellPrice = singleRec.Mrp
                }
                updateObj.Mrp = singleRec.Mrp;
                /*if(singleRec.Mrp && (singleRec.Mrp!='' || singleRec.Mrp!='null' || singleRec.Mrp!='NULL')){
                }*/
                updateObj.SellPrice = singleRec.SellPrice;
                /*if(singleRec.SellPrice && (singleRec.SellPrice!='' || singleRec.SellPrice!='null' || singleRec.SellPrice!='NULL')){
                }*/
                updateObj.Discount = 100 - ((parseFloat((singleRec.SellPrice).match(/\d/g)) * 100) / parseFloat((singleRec.Mrp).match(/\d/g)));
                /*if(singleRec.Discount && (singleRec.Discount!='' || singleRec.Discount!='null' || singleRec.Discount!='NULL')){
                }*/
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
                if(singleRec.SS_update){
                    updateObj['$inc'] = { SS_update: 1 }
                }
                if(singleRec.CS_update){
                    updateObj['$inc'] = { CS_update: 1 }
                }
                updateObj.Time_stamp = new Date();

                // FOR PRICE ARRAY
                let product = await query.selectWithAndOne(dbConstants.dbSchema.products, { Index: parseFloat(res) }, { _id: 0, Price_arr:1} );
                let price_arr = product ? product.Price_arr : [];

                let today_date = moment(new Date()).format('YYYY-MM-DD')
                let rec = price_arr.slice(-1)[0]
                if(rec.price != parseFloat((singleRec.SellPrice).match(/\d/g))){
                    price_arr.push({
                        date: today_date,
                        price: parseFloat((singleRec.SellPrice).match(/\d/g))
                    })
                    var a = moment(new Date(today_date));
                    var b = moment(new Date(rec.date));
                    let days = a.diff(b, 'days')
                    if(days >= 20){
                        if(price_arr.length > 0){
                            price_arr.splice(0, 1)
                        }
                    }
                }

                /*let val = _.where(price_arr, {date: today_date})
                if(val.length > 0){
                    _.each(price_arr, (elem) => {
                        if(elem.date == today_date){
                            if(parseFloat(singleRec.SellPrice) != elem.price){
                                elem.price = parseFloat(singleRec.SellPrice)
                            }
                        }
                    });
                }
                else{
                    price_arr.push({
                        date: today_date,
                        price: parseFloat(singleRec.SellPrice)
                    })
                    var a = moment(new Date(today_date));
                    var b = moment(new Date(price_arr[0].date));
                    let days = a.diff(b, 'days')
                    if(days >= 20){
                        if(price_arr.length == 20){
                            price_arr.splice(0, 1)
                        }
                    }
                }*/
                updateObj.Price_arr = price_arr
                // DONE FOR ARRAY

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
            updateQueryCount(arr)
            resolve(arr)
            return
        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const updateQueryCount = async(arr) => {
    return new Promise(async(resolve, reject) => {
        try {
            let indexArr = _.pluck(arr, 'Index');
            await forEach(indexArr, async(element) => {
                let res = await query.updateSingle(dbConstants.dbSchema.products, { $inc: { Query_count: 1 } }, { Index: element });
                await query.updateSingle(dbConstants.dbSchema.results, { $inc: { Query_count: 1 } }, { Index: element });
            });
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    })
}

const getAds = async(requestParam, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let adArr = [];
            //let key = await productHandler.getProductKeyExtract(requestParam.Product_Url);
            //let res = await client2.get(key);
            //if(res){
                let product = await query.selectWithAndOne(dbConstants.dbSchema.products, {Product_Url: requestParam.Product_Url}, { _id: 0, category_id:1} );
                let getAdColumn = {};
                if(product.category_id !=''){
                    getAdColumn.category_id = product.category_id
                }
                let ads = await query.selectWithAndFilter(dbConstants.dbSchema.ads, getAdColumn, {
                    _id: 0,
                    Index:1
                }, {created_at:-1}, {});
                let displayProducts = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: _.pluck(ads, 'Index')}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
                
                let cateArr = [];
                let adRes = await client4.get(product.category_id);
                if(adRes){
                    cateArr = JSON.parse(adRes)
                }
                //let settings = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0} );
                // let remain = settings.display_ad - displayProducts.length
                
                // let skip = 0;
                // let limit = remain
                // let cateArr = await query.selectWithAndFilter(dbConstants.dbSchema.products, {category_id: {$in: [product.category_id]}}, {
                //     _id: 0,
                //     created_at: 0,
                //     updated_at: 0,
                //     __v: 0,
                // }, {Query_count: -1, created_at:-1}, {
                //     skip,
                //     limit
                // });
                displayProducts.push(cateArr)
                adArr = _.flatten(displayProducts);
                if(adArr.length == 0){
                    let defaultads = await query.selectWithAndFilter(dbConstants.dbSchema.default_ads, {}, {
                        _id: 0,
                        Index:1
                    }, {created_at:-1}, {});
                    adArr = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: _.pluck(defaultads, 'Index')}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
                }
            //}
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
            let settings = await query.selectWithAndOne(dbConstants.dbSchema.settings, {}, { _id: 0} );

            let response = await query.selectWithAndOne(dbConstants.dbSchema.users, {user_id: requestParam.user_id}, { _id: 0, user_id:1} );
            if(!response){
                reject(errors.userNotFound(true, code));
                return;
            }
            requestParam.page = parseFloat(requestParam.page);
            let res = await client3.get(requestParam.page);
            if(res){
                resolve(JSON.parse(res));
                return;
            }
            else{
                let arr = [];
                // let feeds = await query.selectWithAnd(dbConstants.dbSchema.feeds, {}, { _id: 0, Index:1} );
                // arr = await query.selectWithAnd(dbConstants.dbSchema.products, {Index: {$in: _.pluck(feeds, 'Index')}}, { _id: 0, created_at:0, updated_at:0, __v:0} );
                // let limit = settings.product_feed ? settings.product_feed : 15;
                // let page = requestParam.page - 1;
                // let skip = page * limit;
                // let data = await query.selectWithAndFilter(dbConstants.dbSchema.products, {Index: {$nin: _.pluck(feeds, 'Index')}}, {
                //     _id: 0,
                //     created_at: 0,
                //     updated_at: 0,
                //     __v: 0,
                // }, {Query_count: -1}, {
                //     skip,
                //     limit
                // });
                // arr.push(data);
                // arr = _.flatten(arr);
                // setDataCacheFeed(arr, requestParam.page)
                resolve(arr);
                return;
            }

        } catch (error) {
            console.log(error);
            reject(error)
            return
        }
    })
};

const setDataCacheFeed = (arr, page) => {
    return new Promise(async(resolve, reject) => {
        try {
            arr = JSON.stringify(arr)
            client3.set(page, arr);
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    })
};


const trandingFeed = async(requestParam, code) =>{
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
    getAds,
    trandingFeed
};