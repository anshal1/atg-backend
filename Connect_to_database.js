const { urlencoded } = require("express");
const mongoose = require("mongoose");
require("dotenv").config()
const URI = process.env.Mongo_URI;
const Connect =()=>{
    try {
        mongoose.connect(URI, ()=>{
            console.log("Connected to Database");
        });
    } catch (error) {
        if(error){
            console.log("Internal server error")
        }
    }
}
module.exports = Connect;