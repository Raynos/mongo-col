var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    CollectionName = require("../")("CollectionName"),
    assert = require('assert')

var db = new Db('integration_tests', 
    new Server("127.0.0.1", 27017, {
       auto_reconnect: false, 
       poolSize: 4
    }), {native_parser: false})

// Establish connection to db
var native_start = Date.now()
db.open(function(err, db) {

    // Fetch a collection to insert document into
    db.collection("CollectionName", function(err, collection) {
        collection.drop()

        // Insert a single document
        collection.insert({hello:'world_no_safe'})

        // Wait for a second before finishing up, to ensure we have written the item to disk
        setTimeout(function() {

            // Fetch the document
            collection.findOne({hello:'world_no_safe'}, function(err, item) {
                assert.equal(null, err)
                assert.equal('world_no_safe', item.hello)
                var time_taken = Date.now()
                console.log("native time taken", )
                db.close();
            })
        }, 1000)
    })
})

CollectionName.insert({ hello: 'world_no_safe' })

setTimeout(function () {
    // Fetch the document
    CollectionName.findOne({hello:'world_no_safe'}, function(err, item) {
        assert.equal(null, err);
        assert.equal('world_no_safe', item.hello);
        // db.close(); can't close db
    })
})