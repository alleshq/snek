let user;

fetch("/user").then(async res => {
    if (res.status === 200) {
        user = await res.json();
        document.querySelector(".signedIn span").innerText = user.nickname;
        document.querySelector(".signedIn").style.display = "block";
    } else {
        document.querySelector(".signedOut").style.display = "block";
    }
});

const setScreen = playing => {
    document.querySelector("main").style.display = playing ? "none" : "block";
    document.querySelector("canvas").style.display = playing ? "block" : "none";
};

document.querySelector("button").onclick = () => {
    setScreen(true);
};

const gameSize = Math.min(innerWidth, innerHeight);
const tileSize = gameSize / 21;
const canvas = document.querySelector("canvas");
canvas.width = gameSize;
canvas.height = gameSize;
const c = canvas.getContext("2d");
c.fillStyle = "black";

const render = tiles => {
    c.clearRect(0, 0, gameSize, gameSize);
    for (let x = 0; x < 21; x++) {
        for (let y = 0; y < 21; y++) {
            c.fillStyle = tiles[x][y];
            c.fillRect(tileSize * x, tileSize * y, tileSize, tileSize);
        }
    }
};