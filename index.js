require("dotenv").config();

const jwt = require("jsonwebtoken");

// web server and stuff
const express = require("express");
const app = express();
app.use(require("cookie-parser")());
app.use((_err, _req, res, _next) => res.status(500).send("oh fuck it broke"));
app.listen(8080, () => console.log("server do be listening"));

// who tf r u
const quickauth = require("@alleshq/quickauth");
app.get("/auth", (_req, res) => res.redirect(quickauth.url(process.env.QUICKAUTH_CALLBACK)));
app.get("/auth/cb", (req, res) => {
    const {token} = req.query;
    if (typeof token !== "string") return res.status(400).send("gimme token pls");

    // get teh usr id from quickauth token
    quickauth(token, process.env.QUICKAUTH_CALLBACK)
        .then(id => {
            // sign dat session token
            const token = jwt.sign({user: id}, process.env.SESSION_SECRET);

            // set yummy cookie
            res.cookie("token", token);
            res.redirect("/");
        })
        .catch(() => res.status(401).send("dat not real token"));
});