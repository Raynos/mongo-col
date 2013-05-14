var test = require("tape")
var uuid = require("uuid")

var collection = require("../")
var Users = collection("Userz")
var id = uuid()

test("insert a random user", function (assert) {
    Users.drop(function (err) {
        assert.ifError(err)

        Users.insert([{ name: id }], function (err, records) {
            assert.ifError(err)
            assert.equal(records.length, 1)

            Users.findOne({ name: id }, function (err, data) {
                assert.ifError(err)
                assert.equal(data.name, id)

                Users.find({}, function (err, cursor) {
                    cursor.toArray(function (err, data) {
                        assert.equal(data[0].name, id)
                        assert.equal(data.length, 1)

                        assert.end()
                    })
                })
            })
        })
    })
})

test("should have ObjectID", function (assert) {
    assert.ok(collection.ObjectID)
    assert.end()
})

test("close db", function (assert) {
    collection.close(function (err) {
        assert.ifError(err)

        assert.end()
    })
})
