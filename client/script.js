const getCookie = name => {
    match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
};

const token = getCookie("token");
let user;
let playing = false;

// who am i
fetch("/user", {
    headers: {
        Authorization: token
    }
}).then(async res => {
    if (res.status === 200) {
        user = await res.json();
        document.querySelector(".signedIn span").innerText = user.nickname;
        document.querySelector(".signedIn").style.display = "block";
    } else {
        document.querySelector(".signedOut").style.display = "block";
    }
}).catch(() => {
    document.querySelector(".signedOut").style.display = "block"
});

// show the right thing
const setScreen = () => {
    document.querySelector("main").style.display = playing ? "none" : "block";
    document.querySelector("canvas").style.display = playing ? "block" : "none";
};

// can i play now
document.querySelector("button").onclick = () => {
    fetch("/join", {
        method: "POST",
        headers: {
            Authorization: token
        }
    }).then(res => {
        if (res.status === 200) {
            playing = true;
            setScreen();
        }
    }).catch(() => {});
};

// what does it look like
const gameSize = Math.min(innerWidth, innerHeight);
const tileSize = gameSize / 21;
const canvas = document.querySelector("canvas");
canvas.width = gameSize;
canvas.height = gameSize;
const c = canvas.getContext("2d");
c.fillStyle = "black";

// let there be squares
const render = ({tiles}) => {
    c.clearRect(0, 0, gameSize, gameSize);
    for (let x = 0; x < 21; x++) {
        for (let y = 0; y < 21; y++) {
            c.fillStyle = tiles[x][y];
            c.fillRect(tileSize * x, tileSize * y, tileSize, tileSize);
        }
    }
};

// ask server what iz happening
setInterval(() => {
    if (playing) {
        fetch("/game", {
            headers: {
                Authorization: token
            }
        }).then(async res => {
            if (res.status === 200) render(await res.json());
        }).catch(() => {});
    }
}, 100);