const Sequelize =require ('sequelize')
const db= require('../config/database')

const services = db.define('services',{
  createdAt: false, // don't add createdAt attribute
  updatedAt: false,
  
  name:{
    type: Sequelize.STRING
  },  
  speed:{
    type: Sequelize.STRING
  },
  min:{
    type: Sequelize.INTEGER
  },
  max:{
    type: Sequelize.INTEGER
  },
  buyPrice:{
    type: Sequelize.FLOAT
  },
  id2:{
    type: Sequelize.INTEGER
  },
  platform:{
    type: Sequelize.STRING
  },
  kind:{
    type: Sequelize.STRING
  },
  refill:{
    type: Sequelize.BOOLEAN
  },
  sellPrice:{
    type: Sequelize.FLOAT
  },
  resellPrice:{
    type: Sequelize.FLOAT
  },
  panel:{
    type: Sequelize.STRING
  },
  quality:{
    type: Sequelize.STRING
  },
  dropRate:{
    type: Sequelize.STRING
  },
  startTime:{
    type: Sequelize.STRING
  },

  
})
 
module.exports = services
