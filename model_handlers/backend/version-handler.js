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


const upload = function(req, done){
    let rawdata = fs.readFileSync(req.files.version.path);
    let data = JSON.parse(rawdata);
    config.firebase.versionRef.set(data);
    done(null, {})
};


module.exports = {
	upload,
};