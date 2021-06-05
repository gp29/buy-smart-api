"use strict";

var jwt = require("jsonwebtoken");
const config = require("../config");
let _ = require("underscore");
const responseCodes = require("../helpers/response-codes");
const jsonResponse = require("./json-response");

function CheckUrl(req, res, next) {
    var is_free_auth =
        req.path.split("/f/").length > 1 ?
        req.headers["Authorization"] ||
        req.headers["authorization"] ?
        false :
        true :
        false;
    if (!is_free_auth) {
        ensureAuthorized(req, res, next);
    } else {
        next();
    }
}

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader =
        req.headers["Authorization"] ||
        req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        jwt.verify(bearerToken, config.jwtSecret, function(err, decoded) {
            req.user = decoded;
            if (err) {
                let obj = {
                    "name": "Access Token Error!",
                    "message": "You have entered invalid access toekn",
                    "code": responseCodes.EntryCreated
                }
                return jsonResponse(res, responseCodes.EntryCreated, obj, null);
            }
            next();
        });
    } else {
        let obj = {
            "name": "Access Token Error!",
            "message": "Header must be pass",
            "code": responseCodes.EntryCreated
        }
        return jsonResponse(res, responseCodes.EntryCreated, obj, null);
    }
}

module.exports = {
    CheckUrl,
    ensureAuthorized,
};