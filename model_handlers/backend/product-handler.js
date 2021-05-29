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

//FOR IMAGE/PRODUCT KEY
const client = redis.createClient("redis://127.0.0.1:6379/0");
client.on("error", function(error) {
    console.error("redis err: ",error);
});

const get = function(requestParam, done){
	let page = requestParam.page ? requestParam.page : 0;
    let limit = requestParam.sizePerPage ? requestParam.sizePerPage : 50;
    let skipData = page * limit;
    query.countRecord(dbConstants.dbSchema.products, {}, function(error, count) {
        let range = _.range(1, (count + 1))
        if(skipData > 0){
            _.each(_.range(1, (skipData + 1)), (elem) =>{
                range.splice(-1, 1)
            });
        }
        let arr = _.last(range, limit);
        query.selectWithAndFilter(dbConstants.dbSchema.products, {Index:{$in: arr}}, {
            _id: 0,
        }, {created_at:-1}, {}, (error, response) => {
            if (error) {
                logger('Error: can not get ', dbConstants.dbSchema.products);
                done(errors.internalServer(true), null);
                return;
            }
            done(null, {
                product: response,
                count: count
            });
        });
    });
};

const importFile = function(req, done){
    let requestParam = fs.readFileSync(req.files.json_file.path, "utf8");
    requestParam = JSON.parse(requestParam);
    async.forEachSeries(requestParam, async function(singleRec, callbackSingleRec) {

        singleRec.Product_key = await getProductKeyExtract(singleRec.Product_Url)

        singleRec.Img_key = await getImageKeyExtract(singleRec.Img_url)

        client.get(singleRec.Img_key, function(err, res) {
            if(!res){
                query.insertSingle(dbConstants.dbSchema.products, singleRec, function (error, product) {
                    client.set(singleRec.Img_key, product.Index);
                    callbackSingleRec();
                });
            }
            else{
                delete singleRec.Index;
                query.updateSingle(dbConstants.dbSchema.products, singleRec, {
                    'Index': parseFloat(res)
                }, function(error, product) {
                    callbackSingleRec();
                });
            }
        });

    },function(){
        done(null, {});
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
            else if(url.includes('flixcart.com') == true || url.includes('flipkart.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('?')[0].replace(".jpeg","")
            }
            else if(url.includes('netmeds.com') == true ){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('.',1)[0];
            }
            else if(url.includes('zivame.com') == true ){
                finalString = url.split('/')[6]
            }
            else if(url.includes('ajio.com') == true ){
                finalString = url.split('/')[8]
            }
            else if(url.includes('jiomart.com') == true ){
                finalString = url.split('/')[6]
            }
            else if(url.includes('shopclues.com') == true ){
                finalString = url.split('/')[8].replace(".jpg","")
            }
            else if(url.includes('pharmeasy.in') == true ){
                finalString = url.split('/')[5]
            }
            else if(url.includes('paytm.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
               finalString = url.split('_',1)[0];
            }
            else if(url.includes('sdlcdn.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-')
                finalString = url.slice(-3)[0]
            }
            else if(url.includes('reliancedigital.in') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('-i-',1)[0]
            }
            else if(url.includes('tatacliq.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = url.split('_')[0]
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
                finalString = "AM" + url.split('/')[5].split('?')[0]
            }
            else if(url.includes('flipkart.com') == true){
                if(url.split('/')[6] == undefined){
                    finalString = "FL" + url.split('/')[5].split('?')[0]
                }
                else{
                    finalString = "FL" + url.split('/')[6].split('?')[0]
                }
            }
            else if(url.includes('shopclues.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = 'SC' + url.split('.',1)[0];
            }
            else if(url.includes('1mg.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-');
                finalString = "1M" + url.slice(-1)[0]
            }
            else if(url.includes('vijaysales.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-');
                finalString = "VS" + url.slice(-1)[0]
            }
            else if(url.includes('pharmeasy.in') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-');
                finalString = "PH" + url.slice(-1)[0]
            }
            else if(url.includes('nykaafashion.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('-');
                finalString = "NF" + url.slice(-1)[0]
            }
            else if(url.includes('netmeds.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = "NT" + url.split('.',1)[0];
            }
            else if(url.includes('nykaa.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0];
                finalString = "NY" + url.split('.',1)[0].split('?')[0];
            }
            else if(url.includes('nykaaman.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0];
                finalString = "NYM" + url.split('.',1)[0].split('?')[0];
            }
            else if(url.includes('snapdeal.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('.',1)[0].split('#');
                finalString = "SD" + url[0]
            }
            else if(url.includes('myntra.com') == true){
                finalString = "MY" + url.split('/')[6]
            }
            else if(url.includes('bigbasket.com') == true){
                finalString = "BB" + url.split('/')[4]
            }
            else if(url.includes('paytmmall.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('?');
                url = url[0].split('-')
                finalString = "PM" + url.slice(-2, -1)[0];
            }
            else if(url.includes('croma.com') == true){
                finalString = "CR" + url.substring(url.lastIndexOf("/") + 1, url.length);
            }
            else if(url.includes('reliancedigital.in') == true){
                finalString = "RD" + url.substring(url.lastIndexOf("/") + 1, url.length);
            }
            else if(url.includes('ajio.com') == true){
                finalString = "AJ" + url.substring(url.lastIndexOf("/") + 1, url.length);
            }
            else if(url.includes('jiomart.com') == true){
                finalString = "JM" + url.substring(url.lastIndexOf("/") + 1, url.length);
            }
            else if(url.includes('zivame.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                finalString = "ZV" + url.split('?')[0].split('.',1)[0];
            }
            else if(url.includes('tatacliq.com') == true){
                url = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url.split('-')
                finalString = "TQ" + url[1]
            }
            else if(url.includes('firstcry.com') == true){
                url = url.split('/')
                finalString = "FC" + url.slice(-2, -1)[0]
                finalString = finalString.split('?')[0]
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

const action = (requestParam, done) =>{
    if (requestParam['type']=="delete") {
        removeKeyFromRedis(requestParam)
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
            query.removeMultiple(dbConstants.dbSchema.results, {
                'product_id': {
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
            client.del(singleRec.Img_key, function(err, res) {
                callbackSingleRec();
            });
        }, function(){
            return false;
        });
    });
};

module.exports = {
	get,
    importFile,
    action,
    getImageKeyExtract,
    getProductKeyExtract,
};