const session = require('express-session')
const axios = require('axios')
const error = require('../models/error')
const order = require('../models/order')
const user = require('../models/user')
const { request } = require('http')
const passWords =
{
    smmfollows: '00c1a84a603852a6d26e604b9407548c',
    easysmmpanel: 'aa1c7c852fc8a05b674823868a2a2141',
    secsers: '49054bd5c60df9d171631712acb337f3'
}

const showEmail = (email) => {
    newEmail = ''
    for (i = 0; i < email.length; i++) {
        if (i < email.length - 10)
            newEmail += '*'
        else
            newEmail += email[i]
    }
    return newEmail
}












//! START Making order functions 
const accessData = (arr) => {
    let servicesData = []
    arr.map((item) => {
        let obj = {
            id: item.id,
            name: item.name,
            platform: item.platform,
            price: item.sellPrice,
            min: item.min,
            max: item.max,
        }
        servicesData.push(obj)
    })
    return servicesData;
}
const checkData = async (quantity, service, req, link) => {

    quantity = Number(quantity)
    charge = quantity * service.sellPrice / 1000;
    if (quantity <= service.max && quantity >= service.min) {
        if (charge <= req.session.user_balance) {
            return await orderService(link, quantity, service, req, charge)
        }
        else {
            return { status: false, msg: 'insufficient balance' }
        }
    }
    else {
        return { status: false, msg: "Invalid Quantity" }
    }
}


const orderService = async (link, quantity, service, req, charge) => {
    userData = {
        user_name: req.session.user_name,
        user_balance: req.session.user_balance
    }
    panel = (service.panel).slice(0, -4)
    data = await (axios.get(`https://${service.panel}/api/v2?key=${passWords[panel]}&action=add&service=${service.id2}&link=${link}&quantity=${quantity}`))
    if (data.data.order != null) {
        return await saveOrder(link, quantity, service, req, data.data, charge);
    }
    else {
        error.create({
            error: data.data,
            request: data.config,
            user_id: req.session.user_id
        })
        return { status: false, msg: 'Internal Server Error2' }
    }

}
const fixObj = (errors) => {
    newArr = []
    let obj = {}
    errors.map((item) => {
        obj.user_id = item.user_id,
            obj.request = (JSON.parse(item.request))
        obj.error = JSON.parse(item.error)

        newArr.push(obj)
    })
    // console.log(obj.request.url)
    // console.log(newArr)
    return newArr
}
const getErrors = async () => {
    errors = (await (error.findAll()))
    return await (fixObj(errors))
}
const saveOrder = async (link, quantity, service, req, data, charge) => {
    console.log('creating order')
    await order.create({
        service_id: service.id,
        link: link,
        quantity: quantity,
        time: new Date(),
        cost: charge,
        id2: data.order,
        user_id: req.session.user_id,
        name: service.name,
        panel: service.panel

    }).catch(error => {
        error.create({
            error: error,
            user_id: req.session.user_id
        })
        return { statue: false, msg: 'Internal Server Error' }
    })
    userinfo = await user.findAll({
        where: {
            id: req.session.user_id
        }
    })
    await user.update({
        balance: userinfo[0].balance - charge,
        account_spending: userinfo[0].account_spending + charge
    },
        {
            where: {
                id: req.session.user_id
            }
        }
    ).catch(err => {
        error.create({
            error: err,
            user_id: req.session.user_id,
            request: ''
        })
        return { status: false, mag: 'Internal Server Error1 ' }
    })
    req.session.user_balance = userinfo[0].balance - charge;
    req.session.user_account_spending = userinfo[0].account_spending + charge
    return {
        name: service.name,
        link: link,
        quantity: quantity,
        time: new Date(),
        cost: charge,
        order_id: data.order,
        panel: service.panel,
        user_id: req.session.user_id,
        status: true,
    }
}
//! END Making order functions



//! START Getting order data functions
const getOrders = async (req, res) => {
    let userOrders = await order.findAll({
        where: {
            user_id: req.session.user_id
        }
    })
    if (userOrders.length != 0) {
        ids1 = ''
        ids2 = ''
        ids3 = ''
        let x = 0, y = 0, j = 0;
        userOrders.map((item) => {
            console.log
            if (item.panel == 'secsers.com') {

                if (y)
                    ids1 += ','
                ids1 = ids1 + item.id2;

                y++;
            }
            if (item.panel == 'easysmmpanel.com') {
                if (j)
                    ids2 += ','
                ids2 = ids2 + item.id2;
                j++;
            }
            if (item.panel == 'smmfollows.com') {
                if (x)
                    ids3 += ','
                ids3 = ids3 + item.id2;
                x++

            }

        })
        data1 = { data: {} }, data2 = { data: {} }, data3 = { data: {} }
        if (ids1.length) {
            data1 = await (axios.get(`https://secsers.com/api/v2?key=${passWords.secsers}&action=status&orders=${ids1}`))
        }
        if (ids2.length) {
            data2 = (await (axios.get(`https://easysmmpanel.com/api/v2?key=${passWords.easysmmpanel}&action=status&orders=${ids2}`)))
        }

        if (ids3.length) {
            data3 = await (axios.get(`https://smmfollows.com/api/v2?key=${passWords.smmfollows}&action=status&orders=${ids3}`))
        }
        return (accessOrder(req, userOrders, data1.data, data2.data, data3.data))



    }


}
const accessOrder = async (req, mainArr, obj1, obj2, obj3) => {
    newArr = []
    mainArr.map(async (item, index) => {
        if (item.panel == "secsers.com") {
            obj = {
                id: item.id,
                link: item.link,
                quantity: item.quantity,
                time: item.time,
                cost: item.cost,
                name: item.name,
                status: obj1[item.id2].status,
                remains: obj1[item.id2].remains,
                start_count: obj1[item.id2].start_count,
            }
            if (item.status != 'Canceled' && obj1[item.id2].status == 'Canceled') {
                await order.update({
                    status: 'Canceled',
                    cost: 0
                }, {
                    where: {
                        id: item.id
                    }
                })
                userinfo = await user.findAll({
                    where: {
                        id: req.session.user_id
                    }
                })
                await user.update({
                    balance: userinfo[0].balance + item.cost,
                    account_spending: userinfo[0].account_spending - item.cost
                },
                    {
                        where: {
                            id: req.session.user_id
                        }
                    }
                ).catch(err => {
                    error.create({
                        error: err,
                        user_id: req.session.user_id,
                        request: ''
                    })
                    return { status: false, mag: 'Internal Server Error1 ' }
                })

                // console.log(obj2[item.id2].status)
            }
            newArr.push(obj)
        }
        if (item.panel == "easysmmpanel.com") {
            obj = {
                id: item.id,
                link: item.link,
                quantity: item.quantity,
                time: item.time,
                cost: item.cost,
                name: item.name,
                status: obj2[item.id2].status,
                remains: obj2[item.id2].remains,
                start_count: obj2[item.id2].start_count,
            }
            if (item.status != 'Canceled' && obj2[item.id2].status == 'Canceled') {
                await order.update({
                    status: 'Canceled',
                    cost: 0
                }, {
                    where: {
                        id: item.id
                    }
                })
                userinfo = await user.findAll({
                    where: {
                        id: req.session.user_id
                    }
                })
                await user.update({
                    balance: userinfo[0].balance + item.cost,
                    account_spending: userinfo[0].account_spending - item.cost
                },
                    {
                        where: {
                            id: req.session.user_id
                        }
                    }
                ).catch(err => {
                    error.create({
                        error: err,
                        user_id: req.session.user_id,
                        request: ''
                    })
                    return { status: false, mag: 'Internal Server Error1 ' }
                })

                // console.log(obj2[item.id2].status)
            }
            newArr.push(obj)
        }
        if (item.panel == "smmfollows.com") {
            obj = {
                id: item.id,
                link: item.link,
                quantity: item.quantity,
                time: item.time,
                cost: item.cost,
                name: item.name,
                status: obj3[item.id2].status,
                remains: obj3[item.id2].remains,
                start_count: obj3[item.id2].start_count,
            }

            if (item.status != 'canceled' && obj3[item.id2].status == 'canceled') {
                await order.update({
                    status: 'canceled',
                    cost: 0
                }, {
                    where: {
                        id: item.id
                    }
                })
                userinfo = await user.findAll({
                    where: {
                        id: req.session.user_id
                    }
                })
                await user.update({
                    balance: userinfo[0].balance + item.cost,
                    account_spending: userinfo[0].account_spending - item.cost
                },
                    {
                        where: {
                            id: req.session.user_id
                        }
                    }
                ).catch(err => {
                    error.create({
                        error: err,
                        user_id: req.session.user_id,
                        request: ''
                    })
                    return { status: false, mag: 'Internal Server Error1 ' }
                })
            }
            newArr.push(obj)
        }
    })
    return (newArr)
}
//! END Getting order data functions 

function validateUsername(str) {
    var error = "";
    var illegalChars = /\W/; // allow letters, numbers, and underscores

    if (str == "") {
        error = " Please enter Username";
    } else if ((str.length < 5) || (str.length > 15)) {
        error = " Username must have 5-15 characters";
    } else if (illegalChars.test(str)) {
        error = " Please enter valid Username. Use only numbers and alphabets";
    } else {
        error = "";
    }
    if(error){
    console.log(error)
        return {status : 1 ,msg: error};
    }
}
module.exports = {
    getOrders,
    checkData,
    accessData,
    getErrors,
    showEmail,
    validateUsername,
}