const express = require("express");
const user_router = express.Router();
const UserSchema = require("../Schema/UserSchema.js");
const bc = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const FetchUser = require("../Find_user_in_database.js");
require("dotenv").config();
user_router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body
        // Checking user data
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Please fill the details" })
        }
        // Checking if user already exists or not
        const find_user_by_email = await UserSchema.findOne({ email });
        const find_user_by_username = await UserSchema.findOne({ username });
        if (find_user_by_email || find_user_by_username) {
            return res.status(400).json({ error: "User already exisit" })
        }
        // hashing/Encrypting the password
        const salt = bc.genSaltSync(10);
        const hash_password = bc.hashSync(password, salt);
        // Creating New user
        const Newuser = await UserSchema.create({
            username,
            email,
            password: hash_password
        })
        // Creating jwt Token
        const secret = process.env.secretkey
        const sign = jwt.sign({ token: Newuser._id }, secret);
        res.json({ sign })
    } catch (error) {
        if (error) {
            return res.status(500).json({
                error: "Internal Server Error"
            })
        }
    }
})
user_router.post("/login", async (req, res) => {
    try {
        
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: "Please fill the details" })
        }
        // Find the user in the database
        const find_user = await UserSchema.findOne({ username });
        if (!find_user) {
            return res.status(404).json({ error: "User does not exisit" })
        }
        // Comparing password in the database with the password user inputed
        const comparePass = bc.compareSync(password, find_user.password)
        if (!comparePass) {
            return res.status(400).json({ error: "Invalid Password" })
        }
        // If the password is correct then 
        const secret = process.env.secretkey
        const sign = jwt.sign({ token: find_user._id }, secret)
        res.json({ sign })
    } catch (error) {
        if(error){
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
})
user_router.post("/forgot/password", async (req, res) => {
    try {
        
        const { email } = req.body;
        if (!email) {
            return res.status(404).json({ error: "Enter the valid email" })
        }
        const find_user = await UserSchema.findOne({ email: email });
        if (!find_user) {
            return res.status(404).json({ error: "User not found" });
        }
        const transport = nodemailer.createTransport({
            service: "hotmail",
            port: 587,
            secure: false,
            auth: {
                user: process.env.email,
                pass: process.env.password
            }
        })
        const forget_token = randomstring.generate();
        const setToken = await UserSchema.findOneAndUpdate({ email: email }, { $set: { forgot_password_token: forget_token } }, { new: true });
        const options = {
            from: `'Anshal Patel' ${process.env.email}`,
            to: find_user.email,
            subject: "Reset Password",
            html: `<h1>Reset your password <br/> <a href='${`https://atg-backend-s-frontend.vercel.app/reset/password/token=${forget_token.toString()}`}' target='_blank'>Click Here</a></h1>`
        }
        transport.sendMail(options, (err, info) => {
            if (err) {
                return console.log(err)
            } else {
                if (info.response) {
                    return res.json({ msg: "Please check your Inbox or Spam" });
                }
            }
        })
    } catch (error) {
        if(error){
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
})
user_router.post("/reset/password/:token", async (req, res) => {
    try {
        
        const { password } = req.body;
        const forgot_password_token = req.params.token;
        const auth_from_token = forgot_password_token.split("=");
        if(!password){
            return res.status(400).json({error:"Password required"});
        }
        if (!forgot_password_token) {
            return res.status(400).json({ error: "Unauthorized action1" })
        }
        const find_user = await UserSchema.findOne({ forgot_password_token: auth_from_token[1] });
        if (!find_user) {
            return res.status(400).json({ error: "Unauthorized action2" })
        }
        const salt = bc.genSaltSync(10);
        const hash_password = bc.hashSync(password, salt);
        const change_password = await UserSchema.findOneAndUpdate({ username: find_user.username }, { $set: { password: hash_password } }, { new: true });
        const remove_token = await UserSchema.findOneAndUpdate({ username: find_user.username }, { $set: { forgot_password_token: "null" } }, { new: true });
        res.json({ msg:"Password reset successfully" });
    } catch (error) {
        if(error){
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
})
user_router.post("/get/user", FetchUser, async(req, res)=>{
    try {
        res.json(user);
        
    } catch (error) {
        if(error){
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
})
module.exports = user_router;