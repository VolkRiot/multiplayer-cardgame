module.exports = function(io, db) {
  require('./chat')(io, db)
};