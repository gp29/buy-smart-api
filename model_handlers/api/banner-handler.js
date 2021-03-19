'use strict';

const config = require('./../../config');
const logger = require('./../../utils/logger');
const errors = require('./../../utils/dz-errors-api');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator-api');
let async = require('async');
let _ = require('underscore');

const list = async(req, code) => {
    return new Promise(async(resolve, reject) => {
        try {
            let fullUrl = req.protocol + '://' + req.get('host');
            let response = await query.selectWithAnd(dbConstants.dbSchema.banners, {}, { _id: 0, image:1} );
            _.each(response, (elem) => {
                elem.image = fullUrl+'/banner/'+elem.image;
            });
            resolve(response);
            return;
        } catch (error) {
            console.log(error)
            reject(error)
            return
        }
    })
};


module.exports = {
    list
};