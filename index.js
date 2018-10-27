
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Logger = require('./Logger')

function mongo (url, dbName, collection) {
  mongo.debug = false;
  this.url = url;
  this.dbName = dbName;
  this.logger = new Logger(true)
  this.collection = collection;
  this.connect(url, dbName, onConnect)
}

mongo.prototype.setDebug = function (bool) {
  mongo.debug = bool;
}

mongo.prototype.connect = function(url, dbName, callback) {
  if(this.db) {
    return callback(this.db)
  }
  this.logger.log(`Connecting to client ${url} ...`);

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) { 
      this.logger.error(err)
      return callback(err)
    }
    this.client = client
    this.logger.log(`Connected to mongodb client: ${url}`)
    this.db = client.db(dbName)
    this.logger.log(`Connected to mongodb ${dbName}`)
    return callback(null, this.db);
  }.bind(this));
}

function onConnect(error, db) {
  if(error) {
    throw error
  }
}

mongo.prototype.disconnect = function(callback) {
  var client = this.client;
  this.logger.log(`Closing connection to client ${this.url} ...`);

  client.close(true, function(err){
    if (err) { 
      this.logger.error(err); 
      return callback(err);
    }
    this.db = null;
    callback()
  }.bind(this));
}

/*
 * Function to define other functions (manage connections to mongo database)
 * f        : the real function to execute
 * criteria : for selection
 * update   : for insert / update
 */
mongo.prototype.doit = function (f, criteria, update, options, callback)
{
  var c = this.collection;
  var db = this.db;

  if (db != null) {
    f(db, c, criteria, update, options, callback);
  }
  else {
    this.connect(this.url, this.dbName, function(error, db) {
      if(error) {
        return this.logger.error(error)
      } 
      f(db, c, criteria, update, options, callback);
    });
  }
}

/*
 * There you see how the doit function is used
 * It's the same for the other functions
 */
mongo.prototype.insert = function (docs, callback)
{
  this.doit(function (db, c, criteria, update, options, callback) {
    db.collection(c).insert(update, function(err, result) {
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, result);
    });
  }, null, docs, null, callback);
}

mongo.prototype.update = function (criteria, update, callback)
{
  this.doit(function (db, c, criteria, update, options, callback) {
              db.collection(c).update(criteria, {$set: update}, options, function(err, docs) {
                if (mongo.debug && err) { this.logger.log(err); }
                callback(err, docs);
              });
            }, criteria, update, null, callback);
}

mongo.prototype.remove = function (criteria, callback)
{
  this.doit(function (db, c, criteria, update, doc, callback) {
    db.collection(c).remove(criteria, function(err, result) {
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, result);
    });
  }, criteria, null, null, callback);
}

mongo.prototype.removeById = function (id, callback)
{
  this.remove ({ _id: ObjectId(id) }, callback);
}

mongo.prototype.findOne = function (query, callback)
{
  this.doit(function (db, c, query, update, options, callback) {
    db.collection(c).findOne(query, function(err, docs) {
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, docs);
    });
  }, query, null, null, callback);
}

mongo.prototype.find = function (query, projection, callback)
{
  this.doit(function (db, c, query, update, options, callback) {
    db.collection(c).find(query, projection).toArray(function(err, docs) {
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, docs);
    });
  }, query, null, null, callback);
}

mongo.prototype.findById = function (id, callback)
{
  this.findOne ({ _id: ObjectId(id) }, callback);
}

mongo.prototype.dropCollection = function (callback)
{
  this.doit(function (db, c, query, update, doc, callback) {
    db.collection(c).drop(function(err, results){
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, results);
    });
  }, null, null, null, callback);
}


module.exports = mongo;
