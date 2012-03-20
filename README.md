# mongo-col [![Build Status][1]][2]

mongoDB collection wrapper

## Status: production ready

## Example

    var collection = require("mongo-col"),
        Users = collection("Users")

    Users.insert({
        name: "foo",
        password: "bar"
    })

## Motivation

Setting up a mongodb database connection requires too much callback soup, remove it.

## Documentation

### <a name="colleciton" href="#collection">collection(collectionName)</a>

`collection` takes a collection name and returns a collection object. This collection object has all the mongodb collection methods and sets up a database connection internally

See the [MongoDB collection API][3]

    var collection = require("mongo-col"),
        Users = collection("Users")

    Users.insert({
        name: "foo",
        password: "bar"
    })

## Installation

`npm install mongo-col`

## Tests

`make test`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/mongo-col.png
  [2]: http://travis-ci.org/Raynos/mongo-col
  [3]: http://christkv.github.com/node-mongodb-native/api-generated/collection.html