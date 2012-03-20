var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    Col = require("../")("Collection"),
    assert = require('assert')

var db = new Db('integration_tests', 
    new Server("127.0.0.1", 27017, {
       auto_reconnect: false, 
       poolSize: 4
    }), {native_parser: false})


runTwentyTimes(naiveNativeBench, function (time) {
    console.log("naive native benchmark took ", time)
})

runTwentyTimes(collectionBench, function (time) {
    console.log("collection benchmark took ", time)
})

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

function runTwentyTimes(program, cb) {
    var counter = 20,
        time = 0

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