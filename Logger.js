
function Logger(debug=false) {
  this.debug = debug

  this.log = function(message) {
    if(this.debug) {
      console.log(`[MyMongo Info] ${message}`)
    }
  }
  this.error = function(message) {
    if(this.debug) {
      console.error(`[MyMongo Error] ${message}`)
    }
  }
}

module.exports = Logger