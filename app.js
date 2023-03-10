const express = require("express");
const PORT = 7000;
const db = require("./config/dbConnection");
const { promisify } = require("util");
const session = require("./config/session");
const bcrypt = require("bcryptjs");
const user = require("./models/user");
const { checkData } = require('./func/register')
const { where } = require("sequelize");
const { forgetPassword } = require("./func/forgetPass");


var nodemailer = require('nodemailer');


let query = promisify(db);


const app = express();
app.set("view-engine", "ejs");
const { resolve } = require("path");
const { emitWarning } = require("process");
app.use(express.urlencoded({ extended: false }));
app.use(session);
app.get('/api',(req,res)=>{
  res.json(req.session)
})
app.use("/public", express.static(__dirname + "/public"));
app.use(express.static("views"));

// app.post('/send', async (req, res) => {
//   console.log(true)
//   SendMsg()

// })
// Start Login System
const isLogin = async (req, res, next) => {
  // IF User Not Login He Will be directed to login
  if (!req.session.login) return res.redirect("/login");
  next();
};
const isNotLogin = (req, res, next) => {
  if (req.session.login) return res.redirect("/");
  next();
};
const refreshSession = async (req, res, next) => {
  ret = await user.findAll({
    where: {
      email: req.session.user_email }
  })
  req.session.user_balance = (ret[0].balance);
  req.session.account_spending = (ret[0].account_spending)
  next();
}
app.get("/login", isNotLogin, (req, res) => {
  res.render("login.ejs", { msg: "" });
});
app.get("/register", isNotLogin, (req, res) => {
  res.render("register.ejs", { msg: "" });
});

app.get("/getCode", async (req, res) => {
  if(req.session.code){
    res.render('getCode.ejs', { msg:`enter verification code we send to  ${req.session.user_email}`});
  } else {
    res.redirect('/');
  }
})
app.get('/forgetPass',(req,res)=>{
  res.render('forgetPass.ejs', { msg:''});
})
app.post('/forgetPass', async (req, res) => {

  ret = await forgetPassword(req,res)
  if(ret){
    console.log(req.session)
    res.render('getCode.ejs', { msg:'Enter Code Sent to your email pls'});
  }
  else {
    res.render('forgetPass.ejs', { msg:'user dose not exist'});
  }
})
app.post("/getCode", async (req, res) => {
  if(req.session.code == req.body.code){
    if(req.session.forget){
      console.log(req.session)
      delete req.session.code;
      delete req.session.forget;
      req.session.reset= true;
      res.redirect('/reset')
    }
    else{
    req.session.login = true;
    delete req.session.code;
    const hashedPassword = await bcrypt.hash(req.session.password, 10);
    let userinfo = await user
      .create({
        name: req.session.user_name,
        password: hashedPassword,
        email: req.session.user_email,
        balance : 0 ,
        amount_spending: 0
      })
      req.session.user_id = userinfo.id
      console.log(userinfo.id)
      delete req.session.password;
      res.redirect('/')
  }
}
  else{
    if(req.session.try < 5){
    req.session.try +=1;
    res.render('getCode.ejs', { msg:`Incorrect Code !!   ${req.session.user_email}`});
    }
    else if(req.session.try >= 5){
      req.session.destroy();
    res.render('register.ejs',{msg : `You have tried too many times!`})
    }
    else (res.render('register.ejs', { msg:'Sorry  code expired Try again' }));
  }
})

app.post("/login", async (req, res) => {
    try {
    let ret = await query("SELECT * FROM `users` WHERE email = ? or name = ?", [
      (req.body.username.toLowerCase()).split(" ").join(""), // 'foo,
      req.body.username.toLowerCase().split(" ").join(""), 
    ]);
    if (ret.length) {
      if (await bcrypt.compare(req.body.password, ret[0].password)) {
        // req.session.cookie.maxAge = 1000 ;
        req.session.login = true;
        req.session.user_id = ret[0].id;
        req.session.user_balance = ret[0].balance;
        req.session.user_name = ret[0].name;
        req.session.user_email = ret[0].email;
        res.redirect("/");
      } else {
        res.render("login.ejs", { msg: "password incorrect" });
      }
    } else {
      res.render("login.ejs", { msg: "Username / Email Not Found" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/register", async (req, res) => {
  // req.session.destroy()
  req.session.code = false;
  req.session.forget = false;
  obj = await (checkData(req, res))
  if(obj.status == 1 ){
  res.render('register.ejs', {msg : obj.msg});
  }
  if(obj.status == 2){
    res.redirect('/getCode')
  }
  if(obj.status == 0){
    res.redirect('/');
  }
});
app.get('/reset', async(req,res)=>{
  res.render('reset.ejs',{msg : 'Reset Password'});
})
app.post('/reset', async(req,res)=>{
  if (req.body.password.length < 8) {
      res.render( 'reset.ejs',{msg: 'password must be at least 8 characters' })
  }
  if (req.body.password !== req.body.rePassword) {
    res.render('reset.ejs', { msg: 'password dose not match' })
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  console.log(hashedPassword)
  console.log(req.session.user_email)
  userinfo = await user.update({
    password: hashedPassword,
  },
   {
    where: {
      email: req.session.user_email
    }
   }
  )
  req.session.user_name = userinfo.name;

   delete req.session.password;
  delete req.session.forget;
delete req.session.reset;
req.session.login = true
  ret = await user.findAll({
    where: {
      email: req.session.user_email
    }
  })
  req.session.user_id = (ret[0].id);
  req.session.user_name = (ret[0].name);
  req.session.user_balance = (ret[0].balance);
  req.session.account_spending = (ret[0].account_spending)
  res.redirect('/')
})
app.post("/destroy", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use(isLogin)
// End Login System
app.use(refreshSession)
app.use("/", require("./routes/main"));
app.use("/order", require("./routes/order"));



app.listen(PORT, (req, res) => {
  console.log(`server started on port ${PORT} `);
});

