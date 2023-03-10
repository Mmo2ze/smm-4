const Sequelize = require('sequelize')
const db = require('../config/database')

const error = db.define('errors', {

    error: {
        type: Sequelize.JSON
    },

    request: {
        type: Sequelize.JSON
    },
    user_id:{
        type: Sequelize.INTEGER
    }

}
    ,
    {
        timestamps: false
    })

module.exports = error


