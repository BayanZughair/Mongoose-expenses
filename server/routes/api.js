const express = require("express")
const router = express.Router()
const Expence = require("../../model/Expense")
const moment = require("moment")

// router.get("/expenses", function (req, res) {
//     // Expence.find({}).sort({ date: -1 }).then( function (expence) {
//     //     res.send(expence)
//     // })
// let d1 = moment(req.query.d1, "YYYY-MM-DD");

router.get("/expenses", function (req, res) {

    let d1 = req.query.d1
    let d2 = req.query.d2

    if (d1 && d2) {
        d1 = moment(d1).format("LLLL")
        d2 = moment(d2).format("LLLL")

        Expence.find({ date: { $gt: d1, $lt: d2 } })
            .sort({ date: -1 })
            .then(function (expence) {
                res.send(expence)
            })
    }
    // else if (d1 === undefined) 
    else if (d1 || d2) {
        let d = d1 || d2
        d = moment(d).format("LLLL")

        Expence.find({ date: { $gt: d } })
            .sort({ date: -1 })
            .then(function (expence) {
                res.send(expence)
            })

    } else {
        Expence.find({})
            .sort({ date: -1 })
            .then(function (expence) {
                res.send(expence)
            })

    }
})

router.post("/expenses", function (req, res) {

    const item = req.body.item
    const amount = req.body.amount
    const group = req.body.group

    let date = req.body.date
    date = date ? moment(date).format("LLLL") : moment().format("LLLL")

    const expense = new Expence({
        item: item, amount: amount, group: group, date: date
    })

    expense.save().then(function () {
        console.log(`you spent ${amount} on ${item}`);
    })
    res.send(expense)
})

router.put("/expenses", function (req, res) {

    let group1 = req.body.group1
    let group2 = req.body.group2

    Expence.findOneAndUpdate({ group: group1 }, { group: group2 }, { new: true }
    )
        .then(function (expense) {
            res.send(expense)
        })
})

router.get("/expenses/:group", function (req, res) {
    
    let group = req.params.group
    let total = req.query.total

    if (total == "true") {
        Expence.aggregate([
            { $match: { group: group } },
            { $group: { _id: "$group", total: { $sum: "$amount" } } }
        ])
            .then(function (expenses) {
                res.send(expenses)
            })
    }
});

module.exports = router