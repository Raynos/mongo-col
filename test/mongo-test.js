var collection = require("../"),
    assert = require("assert"),
    Users = collection("Users")

Users.drop()

describe("mongo-collection", function () {
    it("should allow inserting", function (done) {
        Users.insert({ name: "foo" })
        Users.findOne({ name: "foo" }, function (err, data) {
            assert(data.name === "foo",
                "data name incorrect")
            done()
        })
    })
})