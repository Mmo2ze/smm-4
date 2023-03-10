const express = require('express')
const nodemailer = require('nodemailer')

function getRandomArbitrary(min, max) { return Math.random() * (max - min) + min; }

function sendEmail(email, subject,msg) {

    return new Promise((resolve, reject) => {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'smmzigzag@gmail.com',
                pass: 'ahpbdtfjntdsayje'
            }
        })

        const mail_config = {
            from: 'smmzigzag@gmail.com',
            to: email,
            subject: subject,
            text: msg
        }
        transporter.sendMail(mail_config, (error ,info)=>{
            if(error){
                console.log(error)
                return reject({message : 'error'})
            }
            console.log('Message sent:'+ info.response)
            return resolve({message : 'email sent'})
        })

    })

}


module.exports = sendEmail