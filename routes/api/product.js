'use strict';

const responseCodes = require('./../../helpers/response-codes');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors-api');
const express = require('express');
const router = express.Router();
const productHandler = require('./../../model_handlers/api/product-handler');

router.get('/get-results', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.img_urls) {
            let response = await productHandler.getResults(req.query);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.get('/get-image-key', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.Img_url) {
            let response = await productHandler.getImageKey(req.query);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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

router.get('/get-product-key', async(req, res) => {
    req.query.code = 'EN';
    try {
        if (req.query.user_id && req.query.Product_Url) {
            let response = await productHandler.getProductKey(req.query);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.query.code), null);
            return;
        }
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