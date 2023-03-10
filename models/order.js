const Sequelize = require('sequelize')
const db = require('../config/database')

const orders = db.define('orders', {


    service_id: {
        type: Sequelize.STRING
    },
    link: {
        type: Sequelize.STRING
    },
    quantity: {
        type: Sequelize.INTEGER
    },
    time: {
        type: Sequelize.TIME
    },
    cost: {
        type: Sequelize.FLOAT
    },
    start_count: {
        type: Sequelize.INTEGER
    },
    id2: {
        type: Sequelize.INTEGER
    },
    name : {
        type : Sequelize.STRING
    },
    user_id: {
        type: Sequelize.INTEGER
    },
    panel : {
        type : Sequelize.STRING
    },
    status : {
        type : Sequelize.STRING
    },
    

}
,
    {
        timestamps: false
  })

module.exports = orders
