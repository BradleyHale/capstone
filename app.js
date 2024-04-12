"use strict";
require("dotenv").config();
const path = require('path');
const express = require("express");
const argon2 = require("argon2");
const bodyParser = require("body-parser");
const app = express();
app.use(express.static("public", {
   index: "index.html",
   extensions: ['html']
}));

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());

// validator
const planController = require("./Controllers/planController");
const userController = require("./Controllers/userController");
const userModel = require("./Models/userModel");

// controller

//
app.get("/", (req, res) => {
    console.log("this is a test");
});

app.get("/api/search", planController.searchByOperations);
app.get("/results/:planID",planController.renderSingleResult);
app.post("/api/add",planController.addToDatabase);
app.post("/api/edit",planController.editPlan);
app.post("/api/delete", planController.deletePlan);

app.post('/register', async (req, res) => {
   let { email, password } = req.body;
 
   try {
     // Check if user already contro
     const existingUser = await userModel.getUserByEmail(email);
     if (existingUser) {
       return res.status(400).send('User already exists');
     }
 
     // Add user to the database
     const userID = await userModel.addUser(email, password);
     if (!userID) {
       return res.status(500).send('Error registering user');
     }
 
     console.log('User registered successfully');
     res.status(201).json({ userID });
   } catch (error) {
     console.error('Error registering user:', error);
     res.status(500).send('Internal Server Error');
   }
 });
 
 // Login endpoint
 app.post('/login', async (req, res) => {
   const { email, password } = req.body;
   console.log(req.body);
 
   try {
     // Find user by email
     const user = await userModel.getUserByEmail(email);
     if (!user) {
       return res.status(404).send('User not found');
     }
     console.log("user", user);
 
     // Compare passwords
     const {passwordHash} = user;
     console.log("password", password);
    //  let temp = argon2.hash(password, {salt :"7Qa3WjSsxQG8CJOtJ2zgQQ"});
    //  console.log("hash of given password", temp);
    //  console.log("hash of password in database",passwordHash);
    //  console.log("stored hash", passwordHash);
     if (await argon2.verify(passwordHash, password)) {
       console.log('Login successful');
       res.status(200).send('Login successful');
     } else {
        console.log(passwordHash);
        console.log(password);
       res.status(401).send('Invalid password');
     }
   } catch (error) {
     console.error('Error logging in:', error);
     res.status(500).send('Internal Server Error');
   }
 });
 
 app.post("/register", userController.createNewUser);

const {PORT} = process.env;
app.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`)
})
module.exports = {
   app
};