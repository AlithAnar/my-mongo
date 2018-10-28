
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Logger = require('./Logger')

const DEFAULT_CONFIG = {
  debug: false,
  dbName: null,
  collection: null,
}

function mongo (url, config = {}) {
  this.config = Object.assign({}, DEFAULT_CONFIG, config);
  this.setDebug(this.config.debug);
  this.url = url
  this.connect(onConnect)
}

mongo.prototype.setDebug = function (debug) {
  mongo.debug = debug;
  this.logger = new Logger(debug);
}

mongo.prototype.connect = function(callback) {
  if(this.db) {
    return callback(this.db)
  }
  this.logger.log(`Connecting to client ${this.url} ...`);

  MongoClient.connect(this.url, { useNewUrlParser: true }, function(err, client) {
    if (err) { 
      this.logger.error(err)
      return callback(err)
    }
    this.client = client
    this.logger.log(`Connected to mongodb client: ${this.url}`)
    this.db = client.db(this.config.dbName)
    this.logger.log(`Connected to mongodb ${this.config.dbName}`)
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
  var c = this.config.collection;
  var db = this.db;

  if (db != null) {
    f(db, c, criteria, update, options, callback);
  }
  else {
    this.connect(function(error, db) {
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
mongo.prototype.insertMany = function (docs, callback)
{
  this.doit(function (db, c, criteria, update, options, callback) {
    db.collection(c).insertMany(update, function(err, result) {
      if (err) { 
        this.logger.log(err); 
      }
      callback(err, result);
    });
  }, null, docs, null, callback);
}

mongo.prototype.updateOne = function (criteria, update, callback)
{
  this.doit(function (db, c, criteria, update, options, callback) {
    db.collection(c).updateOne(criteria, {$set: update}, options, function(err, docs) {
      if (mongo.debug && err) { this.logger.log(err); }
      callback(err, docs);
    });
  }, criteria, update, null, callback);
}

mongo.prototype.removeOne = function (criteria, callback)
{
  this.doit(function (db, c, criteria, update, doc, callback) {
    db.collection(c).removeOne(criteria, function(err, result) {
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
