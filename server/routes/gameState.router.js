const express = require("express");
const router = express.Router();
const gameState = [
  ["wr", "wp", "e", "e", "e", "e", "bp", "br"],
  ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  ["wq", "wp", "e", "e", "e", "e", "bp", "bq"],
  ["wk", "wp", "e", "e", "e", "e", "bp", "bk"],
  ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  ["wr", "wp", "e", "e", "e", "e", "bp", "br"],
];

router.use(express.json());

router.post("/", (req, res) => {
  console.log("req.body: ", req.body);
  const selectedPiece = [req.body.currentX, req.body.currentY];
  const moveLocation = [req.body.toX, req.body.toY];
  console.log("selectedPiece: ", selectedPiece);
  console.log("move location: ", moveLocation);
  const piece = gameState[selectedPiece[0]][selectedPiece[1]];
  console.log("selectedPiece is", piece);

  gameState[moveLocation[0]][moveLocation[1]] = piece;
  gameState[selectedPiece[0]][selectedPiece[1]] = "e";

  res.sendStatus(201);
});

router.get("/", (req, res) => {
  res.send(gameState);
});

module.exports = router;
