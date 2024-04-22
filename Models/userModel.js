"use strict";
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


module.exports = {
    addUser,
    getUserByEmail,
    getUserByUserID,
};
