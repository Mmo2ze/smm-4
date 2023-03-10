const Sequelize =require ('sequelize')
const db= require('../config/database')

const user = db.define('users',{

  name:{
    type: Sequelize.STRING
  },
  password:{
    type: Sequelize.STRING
  },
  email:{ 
    type: Sequelize.STRING
  },
  balance:{
    type : Sequelize.FLOAT
  }
  ,
  account_spending : {
    type :Sequelize.FLOAT
  }
})

module.exports = user


 