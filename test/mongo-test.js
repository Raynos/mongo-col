var collection = require("../")
    , test = require("tap").test
    , Users = collection("Users", "mongo-col-test-db")
    , UsersTwo = collection("Users", "mongo-col-test-db-2")

Users.drop(function () {
    console.log("drop result #1")
    UsersTwo.drop(function () {
        console.log("drop result #2")
        Users.insert({ name: "foo" }, startTest)
    })
})

function startTest() {
    test("mongo-col findOne", function (t) {
        Users.findOne({ name: "foo" }, function (err, data) {
            console.log("findOne result")
            t.equal(err, null)
            t.equal(data.name, "foo", "data name is incorrect")
            t.end()
        })
    })

    test("mongo-col cursor", function (t) {
        Users.find().toArray(function (err, list) {
            t.equal(err, null)
            t.equal(list[0].name, "foo", "data name is incorrect")
            t.end()
        })
    })

    test("mongo-col second db is empty", function (t) {
        UsersTwo.count(function (err, count) {
            t.equal(err, null)
            t.equal(count, 0)
            t.end()
        })
    })

    .on("end", function () {
        Users.close()
        UsersTwo.close()
    })
}
