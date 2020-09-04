require("dotenv").config();
const tickSpeed = 10;
const gridSize = 1000;
const foodCount = 50;

let ticks = 0;
const players = {};
const food = [];

const jwt = require("jsonwebtoken");
const axios = require("axios");
const render = require("./render");

// web server and stuff
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use("/", express.static(`${__dirname}/client`));
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
            const token = jwt.sign({user: id}, process.env.SESSION_SECRET, {expiresIn: "1 day"});

            // set yummy cookie
            res.cookie("token", token);
            res.redirect("/");
        })
        .catch(() => res.status(401).send("dat not real token"));
});

// who am i
app.get("/user", async (req, res) => {
    const user = await auth(req.cookies.token);
    if (!user) return res.status(401).send("idk who u r");
    res.json(user);
});

// who r any of us, rly
const getUser = async id => (await axios.get(`https://horizon.alles.cc/users/${encodeURIComponent(id)}`)).data;

// deep, ikr
const auth = async token => {
    try {
        return await getUser((await jwt.verify(token, process.env.SESSION_SECRET)).user);
    } catch (err) {
        return null;
    }
};

// go somewhere
const randomPosition = () => Math.floor(Math.random() * gridSize);

// make yum yums
for (let i = 0; i < foodCount; i++) {
    food.push({
        x: randomPosition(),
        y: randomPosition()
    });
}

// game does stuff
setInterval(() => {
    ticks++;

    // make more yum yums
    if (Math.floor(Math.random() * 20) === 0) {
        food.shift();
        food.push({
            x: randomPosition(),
            y: randomPosition()
        })
    }
}, 1000 / tickSpeed);