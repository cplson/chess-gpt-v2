const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
// require("dotenv").config();

app.use(cors());

const gameStateRouter = require("./routes/gameState.router.js");
const chatRouter = require("./routes/chat.router.js");
const movesetRouter = require("./routes/moveset.router.js");
app.use("/api/gameState", gameStateRouter);
app.use("/api/chat", chatRouter);
app.use("/api/moveset", movesetRouter);

// Serve static files
app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
