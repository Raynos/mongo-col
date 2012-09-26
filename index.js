var getCollection = require("./lib/getCollection")
    , collectionMethods = require("./lib/collectionMethods")
    , cursorMethods = require("./lib/cursorMethods")
    , Replay = require("replaying")

module.exports = collection

function collection(collectionName, database, options) {
    var col = Replay(collectionMethods, withCollection)

    // With cursors
    col.find = find

    // Close db
    col.close = $close

    return col

    function withCollection(callback) {
        getCollection(collectionName, database, options, callback)
    }

    function find() {
        var args = arguments
            , cb = args[args.length - 1]
            , replay = Replay(cursorMethods, getCursor)

        return replay

        function getCursor(callback) {
            withCollection(callOnCollection)

            function callOnCollection(err, collection) {
                if (err) {
                    cb && cb(err)
                    return callback(err)
                }

                col.find = collectionMethod

                var cursor = collection.find.apply(collection, args)
                callback(null, cursor)
                cb && cb(null, cursor)

                function collectionMethod() {
                    return collection.find.apply(collection, arguments)
                }
            }
        }
    }

    function $close() {
        var args = arguments
            , cb = args[args.length -1]

        withCollection(closeDb)

        function closeDb(err, collection) {
            if (err) {
                return cb && cb(err)
            }

            var db = collection.db

            db.close.apply(db, args)
        }
    }
}
