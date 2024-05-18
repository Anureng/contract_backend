const mongoose = require("mongoose");

const Course = new mongoose.Schema({
    Name: String,
    Level: String,
    Description: String,
    StarterCode : String,
    Output : String
})

const question = mongoose.model('question', Course);

module.exports = question
