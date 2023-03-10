const Sequelize =require ('sequelize')
const db= require('../config/database')

const platform = db.define('platforms',{

  name:{
    type: Sequelize.STRING
  },

  kinds: {
    type: Sequelize.JSON
}

}
  ,
  {
    timestamps: false
  }) 

module.exports = platform


