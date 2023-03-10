const express = require('express');
const router = express();
const session = require("../config/session");
const user = require('../models/user')
const { render } = require('ejs');
const order = require('../models/order')
const {getOrders} = require('../func/fun')
const {sendMsg} = require('../func/sendEmail')

router.set("view-engine", "ejs");
router.use(express.urlencoded({ extended: false }))


router.get('/', async (req, res) => {
    x = await user.findAll({
        where: {
            name: req.session.user_name
        }
    })
    req.session.balance = x.balance;
    // console.log(x)
    let userData = {
        user_name: req.session.user_name,
        user_balance: req.session.user_balance
    }

    res.render('newOrder.ejs', { userData: userData })
})

router.get('/orders', async (req, res) => {
    let userData = {
        user_name: req.session.user_name,
        user_balance: req.session.user_balance
    }
    orders = await getOrders(req,res)
    // console.log(orders)
    res.render('orders.ejs', { userData: userData, orders: orders })
})
    router.get('/:url', (req, res) => {
        let userData = {
            user_name: req.session.user_name,
            user_balance: req.session.user_balance
        }
        res.render(`${(req.params.url)}.ejs`, { userData: userData, url: req.params.url })
    })











    module.exports = router;