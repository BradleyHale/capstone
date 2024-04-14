"use strict";
require("dotenv").config();
const session = require("express-session");
const express = require("express");
const redis = require("redis");
const RedisStore = require("connect-redis").default;
// app libraries
const bodyParser = require("body-parser");
const app = express();
// initializing render engine
app.use(express.static("public", {
   index: "index.html",
   extensions: ['html']
}));
// session management configuration
const sessionConfig = {
  store: new RedisStore({ client: redis.createClient()}),
  port: 6379,
  host: 'localhost',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "session",
  cookie: {
      httpOnly: true,
      maxAge: 60000 * 1, // exactly 10 minutes, using this to test sessions
  }
};

// initializing session parser
const sessionParser = session(sessionConfig);
app.use(sessionParser);
// initializing view engine and JSON parsings
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());

// requiring controllers
const planController = require("./Controllers/planController");
const userController = require("./Controllers/userController");
// requiring models
const userModel = require("./Models/userModel");
// endpoints
app.get("/", (req, res) => {
  res.render("index", {"loggedIn": req.session?.user?.isLoggedIn});
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
 app.post('/login', userController.logIn);
 app.post("/register", userController.createNewUser);

 app.post("/logout", (req, res) => {
  console.log(req.session);
  if(req.session.key) {
    req.session.destroy(function() {
      res.redirect("/")
    });
  }
});

const {PORT} = process.env;
app.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`)
})
module.exports = {
   app,
   sessionParser
};