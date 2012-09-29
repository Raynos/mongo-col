var extend = require("xtend")
    , mongodb = require("mongodb")
    , CachedOperation = require("cached-operation")
    , Db = mongodb.Db
    , Server = mongodb.Server

var defaults = {
        host: process.env.MONGODB_HOST || "localhost"
        , port: +process.env.MONGODB_PORT || 27017
        , user: process.env.MONGODB_USER
        , password: process.env.MONGODB_PASSWORD
        , db: process.env.MONGODB_DB || "mongo-col-db"
        , serverOptions: {}
        , dbOptions: {}
        , createCollectionOptions: {}
        , collectionOptions: {}
        , authenticateOptions: {}
    }
    , slice = Array.prototype.slice
    , getDatabaseCached = CachedOperation(getDatabase)
    , getCollectionCached = CachedOperation(getCollection)

module.exports = collection

function collection (collectionName, database, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {}
    }

    options = options = extend({}, defaults, options || {})
    database = database || options.db

    var name = (database.databaseName || database) + "." + collectionName

    getCollectionCached(name, collectionName, database, options, callback)
}

/*
    getCollection

    Collection objects are cached in named emitters
*/
function getCollection(key, collectionName, database, options, callback) {
    getDatabaseCached(database, options, getOrCreateCollection)

    function getOrCreateCollection(err, db) {
        if (err) {
            return callback(err)
        }

        // get the collection
        db.collection(collectionName, extend({
            safe: true
        }, options.collectionOptions), createIfNotExist)

        function createIfNotExist(err, collection) {
            // if not exist create it
            if (err && err.message.indexOf(" does not exist") !== -1) {
                return db.createCollection(collectionName, extend({
                    safe: true
                }, options.createCollectionOptions), returnCollection)
            }

            if (err) {
                return callback(err)
            }

            callback(null, collection)
        }
    }

    function returnCollection(err, col) {
        if (err) {
            return callback(err)
        }

        callback(null, col)
    }
}

/*
    Gets the database connector once

    Then asks the databaseConnector for a db
*/
function getDatabase(database, options, callback) {
    getDatabaseConnector(database, options, returnDatabase)

    function returnDatabase(err, databaseConnector) {
        if (err) {
            return callback(err)
        }

        var db = databaseConnector.db(database)

        callback(null, db)
    }
}

/*
    Opens a Server and a Db

    Then opens the database connector and returns the Db instance
*/
function getDatabaseConnector(database, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {}
    }

    options = extend({}, defaults, options)

    var server = new Server(options.host, options.port, options.serverOptions)
        , databaseConnector = new Db(database, server, options.dbOptions)

    databaseConnector.open(authOrReturn)

    function authOrReturn(err, db) {
        if (err) {
            return callback(err)
        }

        if (options.user || options.password) {
            db.authenticate(options.user, options.password
                , options.authenticateOptions, returnDb)
        } else {
            callback(null, db)
        }

        function returnDb(err, success) {
            if (err) {
                return callback(err)
            }

            if (!success) {
                return callback(new Error("auth failed"))
            }

            callback(null, db)
        }
    }
}
