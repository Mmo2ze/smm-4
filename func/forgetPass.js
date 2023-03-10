const sendEmail = require("./sendEmail")
const user = require('../models/user')
const Op = require('sequelize').Op;

function getRandomArbitrary(min, max) { return Math.random() * (max - min) + min; }


const checkData = async (input) => {
    userFound = await user.findOne({
        where: {
        [Op.or] : {
            email: input,
            name :  input
        }
    }
    })
    console.log(userFound)
    if (!userFound.name){
        return { status: 404, msg: `User dose not exists` };
    }
    else{
            return {status : 200 ,email : userFound.email}
    }

}
const forgetPassword = async (req, res) => {
    userinfo = await checkData(req.body.email)
    if (userinfo.status === 404) {
        return checkData(req.body.email)
    }
    code = getRandomArbitrary(1000, 9999)
    req.session.code = Math.round(code);
    console.log(req.session)
    req.session.user_email = userinfo.email;
    req.session.forget = true;
    req.session.maxAge = 1000 * 60 * 10;
    sendEmail(userinfo.email, 'Reset Your Password', `your reset code is: ${req.session.code}
    code id valid for 10 minutes`)

    return true;
}

module.exports = {
    forgetPassword
}