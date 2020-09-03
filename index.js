require("dotenv").config();

// web server and stuff
const express = require("express");
const app = express();
app.listen(8080, () => console.log("server do be listening"));

// who tf r u
const quickauth = require("@alleshq/quickauth");
app.get("/auth", (_req, res) => res.redirect(quickauth.url(process.env.QUICKAUTH_CALLBACK)));
app.get("/auth/cb", (req, res) => {
    const {token} = req.query;
    if (typeof token !== "string") return res.status(400).send("gimme token pls");

    // get teh usr id from token
    quickauth(token, process.env.QUICKAUTH_CALLBACK)
        .then(id => {
            res.send(`u r user ${id}`);
        })
        .catch(() => res.status(401).send("dat not real token"));
});