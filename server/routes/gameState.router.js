const express = require("express");
const router = express.Router();
const gameState = [
  ["wr", "e", "e", "e", "wp", "e", "bp", "br"],
  ["e", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wb", "wp", "wn", "e", "e", "e", "bp", "bb"],
  ["wq", "wp", "e", "e", "e", "e", "bp", "bq"],
  ["wk", "wp", "e", "e", "e", "e", "bp", "bk"],
  ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wr", "wp", "e", "e", "bp", "e", "e", "br"],
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
