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

const redis = require("redis");
const client = redis.createClient();
client.on("error", function(error) {
    console.error("redis err: ",error);
});

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
    query.selectWithAndFilterOne(dbConstants.dbSchema.products, {}, {
        _id: 0,
        Index:1
    }, {_id:-1}, {}, (error, response) => {
        let cnt = 1;
        if (!response) {
            cnt = 1
        }
        else{
            cnt = parseFloat(response.Index) + 1
        }
        let requestParam = fs.readFileSync(req.files.json_file.path, "utf8");
        requestParam = JSON.parse(requestParam);
        async.forEachSeries(requestParam, async function(singleRec, callbackSingleRec) {

            singleRec.Product_key = await getProductKeyExtract(singleRec.Product_Url)

            singleRec.Img_key = await getImageKeyExtract(singleRec.Img_url)

            client.get(singleRec.Img_key, function(err, res) {
                if(!res){
                    client.set(singleRec.Img_key, cnt);
                    singleRec.Index = cnt;
                    query.insertSingle(dbConstants.dbSchema.products, singleRec, function (error, product) {
                        cnt++;
                        callbackSingleRec();
                    });
                }
                else{
                    res = parseFloat(res)
                    delete singleRec.Index;
                    query.updateSingle(dbConstants.dbSchema.products, singleRec, {
                        'Index': res
                    }, function(error, product) {
                        callbackSingleRec();
                    });
                }
            });

        },function(){
            done(null, {});
        });
    });
};

const getImageKeyExtract = async (url) => {
    return new Promise(async(resolve, reject) => {
        try {
            let finalString;
            if(url.includes('amazon.com') == true || url.includes('myntassets.com') == true || url.includes('nykaa.com') == true || url.includes('cloudfront.net') == true || url.includes('croma.com') == true || url.includes('fcglcdn.com') == true){
               url = url.substring(url.lastIndexOf("/") + 1, url.length);
               finalString = url.split('.',1)[0];
            }
            else if(url.includes('flixcart.com') == true || url.includes('flipkart.com') == true || url.includes('netmeds.com') == true || url.includes('zivame.com') == true || url.includes('ajio.com') == true || url.includes('jiomart.com') == true){
                finalString = url.split('/')[6]
            }
            else if(url.includes('shopclues.com') == true || url.includes('pharmeasy.in') == true){
                finalString = url.split('/')[5]
            }
            else if(url.includes('paytm.com') == true){
                finalString = url.split('/')[8]
            }
            else if(url.includes('sdlcdn.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-')
                finalString = url.slice(-3)[0]
            }
            else if(url.includes('reliancedigital.in') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('.',1)[0].split('?')[0]
            }
            else if(url.includes('tatacliq.com') == true){
                finalString = url.split('/')[6].split('_')[0]
            }
            else{
                finalString = /[^\\\/:*?"<>|\r\n]+$/i.exec(url)[0]
            }
            resolve(finalString);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};

const getProductKeyExtract = async (url) => {
    return new Promise(async(resolve, reject) => {
        try {
            let finalString;
            if(url.includes('amazon.in') == true){
                finalString = url.split('/')[5]
            }
            else if(url.includes('flipkart.com') == true){
                if(url.split('/')[6] == undefined){
                    finalString = url.split('/')[5].split('?')[0]
                }
                else{
                    finalString = url.split('/')[6].split('?')[0]
                }
            }
            else if(url.includes('shopclues.com') == true || url.includes('pharmeasy.in') == true || url.includes('nykaafashion.com') == true || url.includes('vijaysales.com') == true || url.includes('1mg.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-');
                finalString = url.slice(-1)[0]
            }
            else if(url.includes('netmeds.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('.',1)[0];
            }
            else if(url.includes('nykaa.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0];
                finalString = url.split('.',1)[0].split('?')[0];
            }
            else if(url.includes('snapdeal.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('#');
                finalString = url[0]
            }
            else if(url.includes('myntra.com') == true){
                finalString = url.split('/')[6]
            }
            else if(url.includes('bigbasket.com') == true){
                finalString = url.split('/')[4]
            }
            else if(url.includes('paytmmall.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('?');
                url = url[0].split('-')
                finalString = url.slice(-2, -1)[0];
            }
            else if(url.includes('croma.com') == true || url.includes('reliancedigital.in') == true || url.includes('ajio.com') == true || url.includes('jiomart.com') == true){
                finalString = url.substring(url.lastIndexOf("/") + 1, url.length);
            }
            else if(url.includes('zivame.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('?')[0].split('.',1)[0];
            }
            else if(url.includes('tatacliq.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('-')
                finalString = url[1]
            }
            else if(url.includes('firstcry.com') == true){
                url = url.split('/')
                finalString = url.slice(-2, -1)[0]
            }
            else{
                finalString = /[^\\\/:*?"<>|\r\n]+$/i.exec(singleRec.Product_Url)[0]
            }
            resolve(finalString);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};

const dataInsert = async (singleRec, done) => {
    query.selectWithAndFilterOne(dbConstants.dbSchema.products, {}, {
        _id: 0,
        Index:1
    }, {_id:-1}, {}, async (error, response) => {
        let cnt = 1;
        if (!response) {
            cnt = 1
        }
        else{
            cnt = parseFloat(response.Index) + 1
        }
        singleRec.Product_key = await getProductKeyExtract(singleRec.Product_Url)

        singleRec.Img_key = await getImageKeyExtract(singleRec.Img_url)
        client.get(singleRec.Img_key, function(err, res) {
            if(!res){
                client.set(singleRec.Img_key, cnt);
                singleRec.Index = cnt;
                query.insertSingle(dbConstants.dbSchema.products, singleRec, function (error, product) {
                    cnt++;
                    done(null, {})
                });
            }
            else{
                res = parseFloat(res)
                delete singleRec.Index;
                query.updateSingle(dbConstants.dbSchema.products, singleRec, {
                    'Index': res
                }, function(error, product) {
                    done(null, {})
                });
            }
        });
    });
};

const action = (requestParam, done) =>{
    if (requestParam['type']=="delete") {
        query.removeMultiple(dbConstants.dbSchema.products, {
            'product_id': {
                $in: requestParam['ids']
            }
        }, function(error, data) {
            if (error) {
                logger('Error: can not delete ');
                done(error, null);
                return;
            }
            removeKeyFromRedis(requestParam)
            done(null, data);
        });        
    }
    else{
        don(null, {})
    }
};

const removeKeyFromRedis = (requestParam,done) => {
    query.selectWithAndFilter(dbConstants.dbSchema.products, {
        'product_id': {
            $in: requestParam['ids']
        }
    }, {
        _id: 0,
        Img_key:1
    }, {_id:-1}, {}, async (error, response) => {
        async.forEachSeries(response, async function(singleRec, callbackSingleRec) {
            client.del(singleRec.Img_key);
            callbackSingleRec();
        }, function(){
            return false;
        });
    });
};

module.exports = {
	get,
    importFile,
    dataInsert,
    action,
    getImageKeyExtract,
    getProductKeyExtract
};