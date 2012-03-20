var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    N = 200,
    Col = require("../")("Collection"),
    assert = require('assert'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema

mongoose.connect('mongodb://localhost/my_database')

var db = new Db('integration_tests', 
    new Server("127.0.0.1", 27017, {
       auto_reconnect: false, 
       poolSize: 4
    }), {native_parser: false}),
    UserSchema = new Schema({
        hello: String
    }),
    User = mongoose.model('UserZ', UserSchema)

var db_open_start = Date.now()
new Db('integration_tests', 
    new Server("127.0.0.1", 27017, {
       auto_reconnect: false, 
       poolSize: 4
    }), {native_parser: false}
).open(function (err, global_db) {
    var db_open_time = Date.now() - db_open_start
    runNTimes(N, globalDatabaseBench.bind(null, global_db), function (time) {
        console.log("global native benchmark took ", time + db_open_time)
        global_db.close()
    })

    runNTimes(N, naiveMongooseBench, function (time) {
        console.log("mongoose benchmark took ", time)
    })

    runNTimes(N, naiveNativeBench, function (time) {
        console.log("naive native benchmark took ", time)
    })

    runNTimes(N, collectionBench, function (time) {
        console.log("collection benchmark took ", time)
        Col.collection.db.close()
    })    
})

function globalDatabaseBench(db, callback) {
    var native_start = Date.now()
    db.collection("CollectionN", function(err, col) {
        col.drop(function () {
            col.insert({hello:'world_no_safe'}, function () {
                col.findOne({hello:'world_no_safe'}, function(err, item) {
                    var time_taken = Date.now()
                    callback('world_no_safe' === (item && item.hello),
                        time_taken - native_start)
                })
            })
        })
    })    
}


function naiveMongooseBench(callback) {
    var mongoose_start = Date.now()
    User.collection.drop(function () {
        User.create({ hello: "world_no_safe"}, function () {
            User.findOne({ hello: "world_no_safe"}, function (err, doc) {
                var time_taken = Date.now()
                callback("world_no_safe" === (doc && doc.hello), 
                    time_taken - mongoose_start)
            })
        })
    })
}

function naiveNativeBench(callback) {
    var native_start = Date.now()
    db.open(function (err, db) {
        db.collection("CollectionName", function(err, col) {
            col.drop(function () {
                col.insert({hello:'world_no_safe'}, function () {
                    col.findOne({hello:'world_no_safe'}, function(err, item) {
                        var time_taken = Date.now()
                        db.close()
                        callback('world_no_safe' === (item && item.hello),
                            time_taken - native_start)
                    })
                })
            })
        })    
    })
}

function collectionBench(callback) {
    var collection_start = Date.now()
    Col.drop(function () {
        Col.insert({ hello: 'world_no_safe' }, function () {
            Col.findOne({hello:'world_no_safe'}, function(err, item) {
                var time_taken = Date.now()
                callback('world_no_safe' === (item && item.hello),
                        time_taken - collection_start)
            })
        })    
    })
}

function runNTimes(counter, program, cb) {
    var time = 0

    ;(function loop() {
        if (counter === 0) {
            return cb(time)
        }
        program(function (success, timeTaken) {
            //console.log(success, timeTaken)
            time += timeTaken
            if (success) {
                counter--    
            }
            loop()
        })
    })()
}