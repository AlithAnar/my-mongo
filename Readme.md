Introduction
--------------
my_mongo handles MongoDb connections (via the connect function).
If a connection exist, use it, otherwise create a new connection.
You can define your own functions and redefine existing functions.

Installation
--------------
    npm install my-mongo

Work in progress, current implemented functions :
--------------
    mongo.setDebug
    mongo.doit
    mongo.connect        (uses MongoClient.connect)
    mongo.disconnect     (uses db.close)
    mongo.insert         (uses db.collection(c).insert)
    mongo.update         (uses db.collection(c).update)
    mongo.remove         (uses db.collection(c).remove)
    mongo.removeById     (uses mongo.remove)
    mongo.findOne        (uses db.collection(c).findOne)
    mongo.find           (uses db.collection(c).find)
    mongo.findById       (uses mongo.findOne)
    mongo.dropCollection (uses db.collection(c).drop)

Example :
--------------
    var my_mongo = require('my-mongo')
    var mongo = new my_mongo("mongodb://localhost:27017/db_name", "collection_name");
    mongo.setDebug(true);

    doc1 = { "name": "doc1", "text": "", "left": 10, "top": 10};
    doc2 = { "name": "doc2", "text": "", "left": 20, "top": 20};
    doc3 = { "name": "doc3", "text": "", "left": 30, "top": 30};

    mongo.insert([doc1, doc2, doc3], function(err, results){
      assert.equal(null, err);
      console.log(results);

      mongo.update({"name": "doc1"}, { "left": 11, "top": 11}, function(err, results){
        console.log(results.result);
      });

      mongo.remove({"name": "doc2"}, function(err, results){
        console.log(results.result);
      });

      mongo.find({}, {}, function(err, results){
        console.log(results);

        mongo.dropCollection(function(err, results){

          mongo.disconnect(function(err){
          })
        });
      });
    });

Results :
--------------
    Connecting to db
    Connecting to db
    { result: { ok: 1, n: 3 },
      ops:
       [ { name: 'doc1',
           text: '',
           left: 10,
           top: 10,
           _id: 568a95850e1ae43c1b4be215 },
         { name: 'doc2',
           text: '',
           left: 20,
           top: 20,
           _id: 568a95850e1ae43c1b4be216 },
         { name: 'doc3',
           text: '',
           left: 30,
           top: 30,
           _id: 568a95850e1ae43c1b4be217 } ],
      insertedCount: 3,
      insertedIds:
       [ 568a95850e1ae43c1b4be215,
         568a95850e1ae43c1b4be216,
         568a95850e1ae43c1b4be217 ] }
    { ok: 1, nModified: 1, n: 1 }
    { ok: 1, n: 1 }
    [ { _id: 568a95850e1ae43c1b4be215,
        name: 'doc1',
        text: '',
        left: 11,
        top: 11 },
      { _id: 568a95850e1ae43c1b4be217,
        name: 'doc3',
        text: '',
        left: 30,
        top: 30 } ]
    Closing connection to db

How-to redefine a function :
--------------
    mongo.insert = function (docs)
    {
      mongo.doit(
        function (db, c, criteria, update, options, callback) {
          db.collection(c).insert(docs, function(err, result) {});
        },    // the "real" function
        null, // selection criteria (inadequate here)
        docs, // update data
        null, // options
        null  // callback function
      );
    }
    /* No more callback needed for the insert function */
    mongo.insert ({"name": "doc4"})
