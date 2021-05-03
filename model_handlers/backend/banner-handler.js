'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const banner = require('./../../models/banner');
var fs = require('fs');
var mv = require('mv');


const get = function(req,done){
    let fullUrl = req.protocol + '://' + req.get('host');
    query.selectWithAndFilter(dbConstants.dbSchema.banners, {}, {
        _id: 0,
    }, {created_at:-1}, {}, (error, response) => {
        if(error){
            done(errors.internalServer(true));
            return;
        }
        _.each(response, (elem) => {
            elem.image = fullUrl+'/banner/'+elem.image;
        });
        done(null, response);
        return;
    });
};

const upload = function(requestParam, req,done){
    mv(req.files.banner.path, './public/banner/'+req.files.banner.name, function(err) {
        if(err){
            done(errors.internalServer(true));
            return;
        }
        console.log(requestParam)
        query.insertSingle(dbConstants.dbSchema.banners, {image: req.files.banner.name, url: requestParam.url}, function (error, banner) {
            done(null, {})
        });
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.selectWithAndFilterOne(dbConstants.dbSchema.banners, {banner_id: requestParam['ids'][0]}, {
            _id: 0,
            image:1,
            banner_id:1
        }, {created_at:-1}, {}, (error, response) => {
            fs.unlinkSync('./public/banner/'+response.image)
            query.removeMultiple(dbConstants.dbSchema.banners, {
                'banner_id': {
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
    else
    {
        done(null, data);  
    }
};



module.exports = {
	upload,
    get,
    action
};