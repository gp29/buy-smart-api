'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const config = require('./../../config');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
var fs = require('fs');
var mv = require('mv');


const get = function(req,done){
    let fullUrl = req.protocol + '://' + req.get('host');
    query.selectWithAndFilter(dbConstants.dbSchema.about_us, {}, {
        _id: 0,
    }, {created_at:-1}, {}, (error, response) => {
        if(error){
            done(errors.internalServer(true));
            return;
        }
        _.each(response, (elem) => {
            elem.image = fullUrl+'/about/'+elem.image;
        });
        done(null, response);
        return;
    });
};

const upload = function(requestParam, req,done){
    mv(req.files.about.path, './public/about/'+req.files.about.name, function(err) {
        if(err){
            done(errors.internalServer(true));
            return;
        }
        console.log(requestParam)
        query.insertSingle(dbConstants.dbSchema.about_us, {image: req.files.about.name, paragraph2: requestParam.paragraph2, paragraph1: requestParam.paragraph1}, function (error, about) {
            done(null, {})
        });
    });
};

const action  = (requestParam, done) => {
    if (requestParam['type']=="delete") {
        query.selectWithAndFilterOne(dbConstants.dbSchema.about_us, {about_id: requestParam['ids'][0]}, {
            _id: 0,
            image:1,
            about_id:1
        }, {created_at:-1}, {}, (error, response) => {
            fs.unlinkSync('./public/about/'+response.image)
            query.removeMultiple(dbConstants.dbSchema.about_us, {
                'about_id': {
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