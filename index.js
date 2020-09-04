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
app.use("/", express.static(`${__dirname}/client`));
app.use(require("cookie-parser")());
app.use((_err, _req, res, _next) => res.status(500).send("oh fuck it broke"));
app.listen(8080, () => console.log("server do be listening"));

// knock knock who der
const auth = async (req, res, next) => {
    try {
        req.user = await getUser((await jwt.verify(req.headers.authorization, process.env.SESSION_SECRET)).user);
    } catch (err) {
        return res.status(401).send("idk who u r");
    }
    next();
};

// who r u
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
app.get("/user", auth, async (req, res) => res.json(req.user));

// who r any of us, rly
const getUser = async id => (await axios.get(`https://horizon.alles.cc/users/${encodeURIComponent(id)}`)).data;

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
        });
    }
}, 1000 / tickSpeed);

// lemme play
app.post("/join", auth, (req, res) => {
    const x = randomPosition();
    const y = randomPosition();
    players[req.user.id] = {
        color: "#000000",
        direction: "up",
        segments: [
            {x, y},
            {x, y: y - 1},
            {x, y: y - 2}
        ]
    };
    res.send("ok u can play :)");
});

// what r u ppl doing
app.get("/game", auth, (req, res) => {
    if (!players[req.user.id]) return res.status(400).send("but u no playing");
    res.json({
        user: req.user,
        tiles: render(req.user.id, players, food),
        x: players[req.user.id].segments[0].x,
        y: players[req.user.id].segments[0].y
    })
});

// nothing here
app.use((_req, res) => res.status(404).send("nothing here"));