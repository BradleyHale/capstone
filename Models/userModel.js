"use strict";
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require("crypto");
const argon2 = require("argon2");

//const dbPath = path.resolve(__dirname, 'database.db');
//const db = new sqlite3.Database(dbPath);
const db = require("./db")

// Function to initialize the Users table if not exists

async function addUser(email, password) {
    const userID = crypto.randomUUID();
    const hash = await argon2.hash(password);
    const sql = `INSERT INTO Users (userID, email, passwordHash) VALUES (@userID, @email, @hash)`;
    const stmt = db.prepare(sql);
    try {
        stmt.run({
            "userID":userID,
            "email":email,
            "hash":hash,
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

function getUserByEmail(email) {
    console.log("this is the email being fed to the get user model function", email);
    const sql = `SELECT * FROM Users WHERE email=@email`;
    const stmt = db.prepare(sql);
    const userEmail = stmt.get({
        "email": email
    });
    return userEmail;
}

function getUserByUserID(userID) {
    const sql = `SELECT * FROM Users WHERE userID=@username`;
    const stmt = db.prepare(sql);
    const user = stmt.get({
        "userID": userID
    });
    return user;
}

function setEmail(email, userID) {
    const updateUserQuery = 'UPDATE Users SET email = ? WHERE userID = ?';
    return new Promise((resolve, reject) => {
        db.run(updateUserQuery, [email, userID], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    addUser,
    getUserByEmail,
    getUserByUserID,
    setEmail
};
