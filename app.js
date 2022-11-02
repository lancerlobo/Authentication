//jshint esversion:6

require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(mongooseFieldEncryption, {secret: process.env.SECRET, fields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res) {
  res.render("home");
});

app.get("/register", function(req,res) {
  res.render("register");
});

app.get("/login", function(req,res) {
  res.render("login", {errMsg: "", username: "", password: ""});
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      // only able to render the secrets, if the user is logged in through the post route
      res.render("secrets");
    }
  });

});

app.post("/login", function(req,res) {
  const userName = req.body.username;
  const passWord = req.body.password;

  User.findOne({email: userName}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        if(foundUser.password === passWord) {
          res.render("secrets");
        } else {
           res.render("login", {errMsg: "Password is incorrect", username: userName, password: passWord});
        }

      } else {
         res.render("login", {errMsg: "Email does not exist", username: userName, password: passWord});
      }
    }
  });

});










app.listen(3000, function() {
  console.log("Server started running on port 3000");
});
