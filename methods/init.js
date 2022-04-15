const mongoose = require('mongoose');

const url = "mongodb://localhost:27017/InteriorDesign";


module.exports = function () {
    mongoose.connect(url).then(function () {
        console.log("DATABASE ONLINE");
    })
        .catch(function (error) {
            console.log(error)
        })
}