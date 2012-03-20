var mongodb = require("mongodb"),
    // Grab the database HOST, PORT, USER and PASSWORD from the environment
    HOST = process.env["MONGODB_HOST"] || "localhost",
    PORT = +process.env["MONGODB_PORT"] || 27017,
    USER = process.env["MONGODB_USER"],
    PASSWORD = process.env["MONGODB_PASSWORD"],
    Db = mongodb.Db,
    Server = mongodb.Server,
    cachedResults,
    callbackQueue

var Collection = {
    constructor: function (collection) {
        this.collection = collection
        return this
    }
}

Object.keys(mongodb.Collection.prototype).forEach(addToCollection)
    
module.exports = collection

function mongo(collectionName, databaseName) {
    return getCollection

    function getCollection(callback) {
        openDatabase(databaseName || "DATABASE", openCollection)

        function openCollection(err, db) {
            if (err) {
                return callback(err)
            }
            getCollection.db = db
            db.collection(collectionName, callCallback)
        }

        function callCallback(err, collection) {
            callback.call(collection, err, collection)
        }
    }
}

function openDatabase(databaseName, callback) {
    if (cachedResults) {
        return callback.apply(cachedResults[1], cachedResults)
    } else if (callbackQueue) {
        return callbackQueue.push(callback)
    }

    callbackQueue = [callback]

    if (typeof databaseName === "object" && databaseName !== null) {
        db = databaseName
    } else {
        var db = new Db(databaseName, new Server(HOST, PORT, {
            auto_reconnect: true,
            poolSize: 4
        }), {})    
    }
    db.open(authenticateDatabase)

    function authenticateDatabase(err, db) {
        if (err) {
            return invokeCallbacks(err)
        }

        if (USER || PASSWORD) {
            db.authenticate(USER, PASSWORD, saveDatabase)    
        } else {
            invokeCallbacks(err, db)
        }
        
        function saveDatabase(err, success) {
            if (success) {
                return invokeCallbacks(err, db)
            }
            return invokeCallbacks(new Error("auth failed"))
        }
    }

    function invokeCallbacks(err, data) {
        var callbackList = callbackQueue
        cachedResults = arguments
        callbackQueue = null
        for (var i = 0, len = callbackList.length; i < len; i++) {
            callbackList[i].apply(arguments[1], arguments)
        }
    }
}

function collection (collectionName) {
    return Object.create(Collection).constructor(mongo(collectionName))
}

function addToCollection(methodName) {
    if (typeof mongodb.Collection.prototype[methodName] === "function") {
        Collection[methodName] = tunnel(methodName)    
    }
}

function tunnel (methodName) {
    return proxy

    function proxy() {
        var args = arguments,
            callback = args[args.length - 1]

        this.collection(invokeMethod)

        function invokeMethod(err, collection) {
            if (err) {
                if (callback.call) {
                    callback(err)
                }
                return 
            }
            collection[methodName].apply(collection, args)
        }
    }
}