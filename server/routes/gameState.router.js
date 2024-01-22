const express = require("express");
const router = express.Router();
const gameState = [
  ["wr", "e", "e", "e", "e", "e", "bp", "br"],
  ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  ["wq", "wp", "e", "e", "e", "e", "e", "bq"],
  ["wk", "wp", "e", "e", "e", "bp", "bp", "bk"],
  ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wr", "wp", "e", "e", "e", "e", "bp", "br"],
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
