
function Logger(debug=false) {
  this.log = function(message) {
    if(debug) {
      console.log(`[MyMongo Info] ${message}`)
    }
  }
  this.error = function(message) {
    if(debug) {
      console.error(`[MyMongo Error] ${message}`)
    }
  }
}

module.exports = Logger