const express = require("express");
const router = express.Router();
const gameState = [
  ["br", "bp", "e", "e", "e", "e", "wp", "wr"],
  ["bn", "bp", "e", "e", "e", "e", "wp", "wn"],
  ["bb", "bp", "e", "e", "e", "e", "wp", "wb"],
  ["bq", "bp", "e", "e", "e", "e", "wp", "wq"],
  ["bk", "bp", "e", "e", "e", "e", "wp", "wk"],
  ["bb", "bp", "e", "e", "e", "e", "wp", "wb"],
  ["bn", "bp", "e", "e", "e", "e", "wp", "wn"],
  ["br", "bp", "e", "e", "e", "e", "wp", "wr"],
];

router.use(express.json());

router.post("/", (req, res) => {
  const move = req.body;
  console.log(move);
});

router.get("/", (req, res) => {
  res.send(gameState);
});

module.exports = router;
