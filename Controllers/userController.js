"use strict";
const argon2 = require("argon2");
const userModel = require("../Models/userModel");

async function createNewUser(req, res) {
    const {email, password} = req.body;
    const userID = await userModel.addUser(email, password);
    if (!userID) {
        return res.sendStatus(409); // Conflict
    }
    res.json({"userID": userID}); // Return generated userID
}

async function logIn(req, res) {
  console.log("the website is getting to the login function");
  const { email, password } = req.body;
  console.log("req.body", req.body);
  try {
    // Find user by email
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).send('User not found');
    }
    console.log("user", user);

    // Compare passwords
    const {passwordHash} = user;
    console.log(" this is the password: ", password);
    if (await argon2.verify(passwordHash, password)) {
      req.session.regenerate((err) => {
          if (err) {
              console.error('Error regenerating session:', err);
              return res.sendStatus(500);
          }
          console.log("req.session", req.session);
          req.session.user = {
              email: email,
              isLoggedIn: true
          };
          console.log(req.session.user);
          return res.redirect("/add");
      })
    } else {
      console.log(passwordHash);
      console.log(password);
      res.status(401).send('Invalid password');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
 };
module.exports = {
    createNewUser,
    logIn,
    
};
