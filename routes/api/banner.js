'use strict';

const responseCodes = require('./../../helpers/response-codes');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors-api');
const express = require('express');
const router = express.Router();
const bannerHandler = require('./../../model_handlers/api/banner-handler');
var middleAuth = require("../../utils/middleware");
var middleware = [middleAuth.CheckUrl];

router.get('/list', middleware, async(req, res) => {
    req.query.code = 'EN';
    try {
        let response = await bannerHandler.list(req, req.query.code);
        jsonResponse(res, responseCodes.OK, errors.noError(), response);
    } catch (error) {
        try {
            jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
            return;
        } catch (error) {
            jsonResponse(res, responseCodes.InternalServer, errors.internalServer(true, req.query.code), null);
            return;
        }
    }
});


module.exports = router;