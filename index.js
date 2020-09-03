require("dotenv").config();

// web server and stuff
const express = require("express");
const app = express();
app.listen(8080, () => console.log("server do be listening"));