
const { Sequelize } = require('sequelize');

module.exports = new Sequelize('database', 'root', '', {
  host: 'localhost',
  dialect:  'mysql' 

});

module.exports