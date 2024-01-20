const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;
// require("dotenv").config();

app.use(cors());

const chatRouter = require("./routes/chat.router.js");
app.use("/api/chat", chatRouter);

// Serve static files
app.use(express.static("build"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
