'use strict';

const logger = require('./../../utils/logger');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors');
const dbConstants = require('./../../constants/db-constants');
const query = require('./../../utils/query-creator');
let async = require('async');
let _ = require('underscore');
const Setting = require('./../../models/settings');


const get = function(req,done){
	query.selectWithAndFilterOne(dbConstants.dbSchema.settings, {}, {
        _id: 0,
    }, {}, {}, (error, settings) => {
    	if (error) {
            logger('Error: can not get ', dbConstants.dbSchema.settings);
            done(errors.internalServer(true), null);
            return;
        }
        done(null,settings ? settings : {})
    });
};


const update = function(requestParam,done){
	query.selectWithAndFilterOne(dbConstants.dbSchema.settings, {}, {
        _id: 0,
        settings_id:1
    }, {}, {}, (error, settings) => {
        if (error) {
            logger('Error: can not get ', dbConstants.dbSchema.settings);
            done(errors.internalServer(true), null);
            return;
        }
        if(settings){
            query.updateSingle(dbConstants.dbSchema.settings,requestParam, { 'settings_id':settings.settings_id},function (error, settings) {
                if (error) {
                    logger('Error: can not update settings');
                    done(error, null);
                    return;
                }
                done(null, {});
            });
        }
        else{
            query.insertSingle(dbConstants.dbSchema.settings,requestParam,function (error, settings) {
                if (error) {
                    logger('Error: can not create settings');
                    done(error, null);
                    return;
                }
                done(null, {});
            });
        }
    });
};

module.exports = {
	get,
	update
};