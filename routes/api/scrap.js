'use strict';

const responseCodes = require('./../../helpers/response-codes');
const jsonResponse = require('./../../utils/json-response');
const errors = require('./../../utils/dz-errors-api');
const express = require('express');
const router = express.Router();
const scrapHandler = require('./../../model_handlers/api/scrap-handler');

router.get('/get-background-scrap-list', async(req, res) => {
    req.query.code = 'EN';
    try {
        let response = await scrapHandler.list(req, req.query.code);
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

router.post('/insert-background-scrap-url', async(req, res) => {
    req.body.code = 'EN';
    try {
        if (req.body.url) {
            let response = await scrapHandler.insert(req.body);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.body.code), null);
            return;
        }
    } catch (error) {
        try {
            jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
            return;
        } catch (error) {
            jsonResponse(res, responseCodes.InternalServer, errors.internalServer(true, req.body.code), null);
            return;
        }
    }
});

router.post('/scrap-done-or-not', async(req, res) => {
    req.body.code = 'EN';
    try {
        if (req.body.url && req.body.url_type && req.body.done) {
            let response = await scrapHandler.scrapDoneOrNot(req.body);
            jsonResponse(res, responseCodes.OK, errors.noError(), response);
        } else {
            jsonResponse(res, responseCodes.BadRequest, errors.missingParameters(true, req.body.code), null);
            return;
        }
    } catch (error) {
        try {
            jsonResponse(res, error.code, errors.formatErrorForWire(error), null);
            return;
        } catch (error) {
            jsonResponse(res, responseCodes.InternalServer, errors.internalServer(true, req.body.code), null);
            return;
        }
    }
});


module.exports = router;