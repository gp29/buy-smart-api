'use strict';

const _ = require('underscore');
const mongoose = require('mongoose');
const logger = require('./../utils/logger');
const dbConnection = require('./../utils/db-connection');

module.exports = {
    selectWithAggregationFilter: function(collectionName, params, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.aggregate(params).exec(function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        })
    },

    /**
     * Select query where comparison is done by unique columns and values and sorting by page.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */
    selectWithAndSortLimit: function(collectionName, comparisonColumnsAndValues, columnsToSelect, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        }).sort({
            _id: -1
        });
    },

    /**
     * Select join query where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {array} - JSON array of objects
     */
    joinWithAnd: function(collectionName, params, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.aggregate(params).exec(function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    joinWithAndPromise: function(collectionName, params) {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.aggregate(params).exec(function(error, data) {
                if (error) {
                    logger('Error: making async main query');
                    reject(error);
                    return;
                }
                resolve(data);
                return
            });
        })
    },


    /**
     * Select query where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */
    selectWithAnd: function(collectionName, comparisonColumnsAndValues, columnsToSelect, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.find(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Count how many records in table and comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */

    countRecord: function(collectionName, comparisonColumnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.count(comparisonColumnsAndValues, function(error, numOfDocs) {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, numOfDocs);
        });
    },

    /**
     * Select query where comparison is done by unique columns and values and sorting by page.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */
    selectWithAndSort: function(collectionName, comparisonColumnsAndValues, columnsToSelect, columnToSort, sizePerPage, page, callback) {
        const dbCollection = mongoose.model(collectionName);
        page = parseInt(page);
        sizePerPage = parseInt(sizePerPage);
        dbCollection.find(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        }).sort(columnToSort).limit(sizePerPage).skip(sizePerPage * page);
    },

    /**
     * Compate month from iso date
     *
     * @collectionName {string} collectionName to select from
     * @returns {array} - JSON array of objects
     */
    selectWithAggregation: function(collectionName, month, year, callback) {
        const dbCollection = mongoose.model(collectionName);

        dbCollection.aggregate([{
            $addFields: {
                "month": {
                    $month: '$delivery_time'
                },
                "year": {
                    $year: '$delivery_time'
                }
            }
        }, {
            $match: {
                month: parseInt(month),
                year: parseInt(year),
                status: 'confirmed'
            }
        }]).exec(function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        })
    },

    /**
     * Select query with sorting where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {array} - JSON array of objects
     */
    selectWithAndFilter: function(collectionName, comparisonColumnsAndValues, columnsToSelect, columnToSort, columnsToPagination, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.find(comparisonColumnsAndValues, columnsToSelect, columnsToPagination, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        }).sort(columnToSort);
    },

    /**
     * Select query with sorting where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {array} - JSON array of objects
     */
    selectWithAndFilterOne: function(collectionName, comparisonColumnsAndValues, columnsToSelect, columnToSort, columnsToPagination, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, columnsToPagination, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        }).sort(columnToSort);
    },

    /**
     * Select query where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */
    selectWithAndOnePromise: (collectionName, comparisonColumnsAndValues, columnsToSelect) => {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                
                resolve(data);
                return
            });
        })
    },

    /**
     * Select query where comparison is done by unique columns and values.
     *
     * @collectionName {string} collectionName to select from
     * @returns {object} - JSON object
     */
    selectWithAndOne: function(collectionName, comparisonColumnsAndValues, columnsToSelect, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Inserts single record
     *
     * @collectionName {string} collectionName to select from
     * @param {object} columnsAndValues Values and column
     *     to insert
     * @returns {object} - JSON object
     */
    insertSingle: function(collectionName, columnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.create(columnsAndValues, function(error, data) {
            if (error) {
                logger(error);
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Inserts Multiple records
     *
     * @collectionName {string} table Name of table to select from
     * @columnsAndValues {Array} columns to insert
     * @returns {object} - JSON object
     */

    insertMultiple: function(collectionName, columnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.insertMany(columnsAndValues, function(error, data) {
            if (error) {
                logger('Error: can not create Multiple entries');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Updates a single record
     *
     * @collectionName {string}collectionName to update
     * @columnsToUpdate {Object}  Columns and values to update
     * @targetColumnsAndValues {Object} targetColumnsAndValues to identify the update record
     *
     * @returns {object} - JSON object
     */

    updateSingle: function(collectionName, columnsToUpdate, targetColumnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        var options = {
            multi: true
        };
        dbCollection.update(targetColumnsAndValues, columnsToUpdate, options, function(error, data) {
            if (error) {
                console.log(error);
                return false;
                logger('Error: can not update document');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Updates a multiple record
     *
     * @collectionName {string}collectionName to update
     * @columnsToUpdate {Object}  Columns and values to update
     * @targetColumnsAndValues {Object} targetColumnsAndValues to identify the update record
     *
     * @returns {object} - JSON object
     */

    updateMultiple: function(collectionName, columnsToUpdate, targetColumnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        var options = {
            multi: true
        };
        dbCollection.updateMany(targetColumnsAndValues, {
            $set: columnsToUpdate
        }, options, function(error, data) {
            if (error) {
                console.log(error);
                return false;
                logger('Error: can not update document');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * deletes a multiple record
     *
     * @collectionName {string}collectionName to update
     * @columnsToUpdate {Object}  Columns and values to update
     * @targetColumnsAndValues {Object} targetColumnsAndValues to identify the update record
     *
     * @returns {object} - JSON object 
     */

    removeMultiple: function(collectionName, targetColumnsAndValues, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.remove(targetColumnsAndValues, function(error, data) {
            if (error) {
                logger('Error: can not update document');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    /**
     * Updates a single get updated recode
     *
     * @collectionName {string}collectionName to update
     * @columnsToUpdate {Object}  Columns and values to update
     * @targetColumnsAndValues {Object} targetColumnsAndValues to identify the update record
     *
     * @returns {object} - JSON object
     */

    updateAndFindSingle: function(collectionName, columnsToUpdate, targetColumnsAndValues, columnToSelect, callback) {
        const dbCollection = mongoose.model(collectionName);
        dbCollection.findOneAndUpdate(targetColumnsAndValues, columnsToUpdate, {
            new: true,
            projection: columnToSelect
        }, function(error, data) {
            if (error) {
                logger('Error: making async main query');
                callback(error, null);
                return;
            }
            callback(null, data);
        });
    },

    selectWithAndOnePromiseModified: function(collectionName, comparisonColumnsAndValues, columnsToSelect, key) {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
                if (error) {
                    logger('Error: making async main query');
                    reject(error, null);
                    return;
                }
                if (!data) {
                    reject(errors.customError(`${key} ${labels.LBL_NOT_FOUND["EN"]}`, 404, `${key} ${labels.LBL_NOT_FOUND["EN"]}`, true))
                    return
                }
                resolve(data)
                return

            });
        })

    },

    selectWithAndOnePromise: function(collectionName, comparisonColumnsAndValues, columnsToSelect) {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.findOne(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
                if (error) {
                    logger('Error: making async main query');
                    reject(error, null);
                    return;
                }
                resolve(data)
                return

            });
        })
    },


    selectWithAndPromise: function(collectionName, comparisonColumnsAndValues, columnsToSelect) {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.find(comparisonColumnsAndValues, columnsToSelect, function(error, data) {
                if (error) {
                    logger('Error: making async main query');
                    reject(error);
                    return;
                }
                // if (!data) {
                //     reject(errors.resourceNotFoundModified(true, key))
                //     return
                // }
                resolve(data);
                return
            });
        })


    },

    updateSinglWithUpdateRecodePromise: function(collectionName, columnsToUpdate, targetColumnsAndValues, columnToSelect) {
        return new Promise((resolve, reject) => {
            const dbCollection = mongoose.model(collectionName);
            dbCollection.findOneAndUpdate(targetColumnsAndValues, columnsToUpdate, {
                new: true,
                projection: columnToSelect
            }, function(error, data) {
                if (error) {
                    console.log("errpr=>" + error)
                    logger('Error: making async main query');
                    reject(error);
                    return;
                }
                resolve(data);
                return
            });
        })
    },

};