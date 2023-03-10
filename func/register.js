const error = require('../models/error')
const order = require('../models/order')
const user = require('../models/user')
const { request } = require('http')
const sendEmail = require('./sendEmail')
const {validateUsername} = require('../func/fun')


function getRandomArbitrary(min, max) { return Math.random() * (max - min) + min; }


const checkInput = async(username ,password ,email,rePassword) =>{
    if(validateUsername (username) ){
        return validateUsername(username);
    }
    const emailFound = (await user.findAll({
        where: {
            email: email,
        }
    })).length;
    const userFound = (await user.findAll({
        where: {
            name: username,
        }
    })).length
    if (userFound) {
        return { status: 1, msg: 'User already exists' };
    }
    if (emailFound) {
        return { status: 1, msg: 'Email already exists' };
    }
    if(password.length < 8){
        return { status: 1, msg: 'password must be at least 8 characters' };
    }
    if (password !== rePassword) {
        return { status: 1, msg: 'password dose not match' };
    }
    return true;
}
const checkData = async (req, res) => {
    email = req.body.email.toLowerCase().split(" ").join("");
    username = req.body.name.toLowerCase().split(" ").join("");
    try {
        inputValid = await checkInput(username, req.body.password, email,req.body.rePassword)
        if (inputValid !== true)
            return inputValid;
            
        code = getRandomArbitrary(1000, 9999)
        // console.log(username)
        subject = 'Verify Your Email';
        msg = `hi Your verification code is:  ${Math.round(code)}
        it is valid for 15 minutes 
        `;
        req.session.code = Math.round(code);
        req.session.user_email = email;
        req.session.user_name = username;

        req.session.password = req.body.password
        req.session.login = false;
        req.session.try = 0;
        req.session.cookie.maxAge = 1000*60*15;
        sendEmail(email, subject, msg);
        return { status: 2, email: email }
    } catch (err) {
        console.log(err)
        return { status: 0 };
    }

}
module.exports = { checkData }