require("dotenv").config();
const tickSpeed = 10;
const gridSize = 1000;
const foodCount = 2000;

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
    if (food.length < foodCount && Math.floor(Math.random() * 10) === 0)
        food.push({
            x: randomPosition(),
            y: randomPosition()
        });

    // sneks
    Object.keys(players).forEach(id => {
        const p = players[id];

        // mv teh sneks
        if (ticks % 2 === 0) {
            const {x: oldX, y: oldY} = p.segments[0];
            p.segments.unshift({
                x: p.direction === "left" ? oldX + 1 : p.direction === "right" ? oldX - 1 : oldX,
                y: p.direction === "up" ? oldY + 1 : p.direction === "down" ? oldY - 1 : oldY
            });
            p.segments.pop();
        }

        const {x, y} = p.segments[0];

        // snek go outside
        if (x < 0 || y < 0 || x > gridSize || y > gridSize) return delete players[id];

        // snek eat yum yum
        food.forEach((f, i) => {
            if (x === f.x && y === f.y) {
                p.segments.unshift({x, y});
                food.splice(i, 1);
            }
        });
    });
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
        y: players[req.user.id].segments[0].y,
        length: players[req.user.id].segments.length
    })
});

// i wanna go here now
app.post("/direction/:d", auth, (req, res) => {
    if (!players[req.user.id]) return res.status(400).send("but u no playing");
    if (!["up", "down", "left", "right"].includes(req.params.d)) return res.status(400).send("that thing bad");
    players[req.user.id].direction = req.params.d;
    res.send("yay it werk");
});

// nothing here
app.use((_req, res) => res.status(404).send("nothing here"));