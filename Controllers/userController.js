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

    // Compare passwords
    const {passwordHash} = user;
    console.log(" this is the password: ", password);
    if (await argon2.verify(passwordHash, password)) {
      console.log("this is a test to see if the function has gotten to the session part of the code");
      req.session.regenerate(function (err) {
    
        req.session.email = req.body.email;
        req.session.isLoggedIn = true;
        console.log(req.session);
    
        // save the session before redirection to ensure page
        // load does not happen before session is saved
        req.session.save(function (err) {
          res.redirect('/');
        })
      })
      // req.session.regenerate((err) => {
      //     if (err) {
      //         console.error('Error regenerating session:', err);
      //         return res.sendStatus(500);
      //     }
      //     req.session.user = {};
      //     req.session.user.email = email;
      //     req.session.user.isLoggedIn = true;
      //     console.log("this is the user object", user);
      //     console.log("this is the session object", req.session);
      //     console.log("session id:", req.session.id);
      //     console.log("cookie associated with session", req.session.cookie);
      //     return res.redirect("/add");
      // });
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
