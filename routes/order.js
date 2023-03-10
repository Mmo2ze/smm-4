const express = require("express");
const router = express();
const session = require("../config/session");
const platform = require("../models/platform");
const service = require("../models/service");
const Sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const services = require("../models/service");

const { checkData, accessData, order, getErrors } = require("../func/fun.js") 
router.set("view-engine", "ejs");
router.use(express.urlencoded({ extended: false }));



router.get("/:url", async (req, res) => {
    var rows = await platform.findAll({
        where: {
            name: req.params.url,
        },
    });
    kinds = JSON.parse(rows[0].kinds);
    // data.kinds = JSON.parse(data.kinds)
    userData = {
        user_name: req.session.user_name,
        user_balance: req.session.user_balance
    }
    res.render(`serviceKind.ejs`, {
        userData: userData,
        platform: req.params.url,
        kinds: kinds,
        msg: "",
    });
});

router.get("/:platform/:kind", async (req, res) => {
    let services = await service.findAll({
        where: {
            [Op.and]: {
                platform: {
                    [Op.like]: `%${req.params.platform}%`,
                },
                kind: req.params.kind,
            },
        },
    });
    userData = {
        user_name: req.session.user_name,
        user_balance: req.session.user_balance
    }
    servicesData = accessData(services);
    res.render("services.ejs", {
        platform: req.params.platform,
        kind: req.params.kind,
        userData: userData,
        services: servicesData,
        msg: "",
    });
});

router.post("/:platform/:kind", async (req, res) => {
    console.log(req.body);
    let quantity = req.body.quantity,
        id = req.body.id,
        link = req.body.link;
    let services = await service.findAll({
        where: {
            [Op.and]: {
                platform: {
                    [Op.like]: `%${req.params.platform}%`,
                },
                kind: req.params.kind,
            },
        },
    });
    selectedService = await service.findAll({
        where: {
            id: id
        }
    })
    servicesData = accessData(services);
    try {
        check = await checkData(quantity, selectedService[0], req,link)      
        // console.log(check)
        if  (check.status == true) {
            let userData = {
                user_name: req.session.user_name,
                user_balance: req.session.user_balance
            }
            console.log(userData)
            res.render("services.ejs", {
                msg: `Order successfully placed 
                service : ${check.name}
                link: ${link}    cost:${check.cost}$`,
                services: servicesData,
                platform: req.params.platform,
                kind: req.params.kind,
                userData : userData
            });
        }
        else {
            res.render("services.ejs", {
                msg: check.msg,
                services: servicesData,
                platform: req.params.platform,
                kind: req.params.kind,
            });
        }
    } catch (err) {
        console.log(err)
        res.redirect("/"); }
});

module.exports = router;
