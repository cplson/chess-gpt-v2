const express = require("express");
const router = express.Router();
let gameStatus = "no threat";
const gameMoves = [];
const gameState =
  // [
  //   ["wr", "wp", "e", "e", "e", "e", "bp", "br"],
  //   ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  //   ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  //   ["wq", "wp", "e", "e", "e", "e", "bp", "bq"],
  //   ["wk", "wp", "e", "e", "e", "e", "bp", "bk"],
  //   ["wb", "wp", "e", "e", "e", "e", "bp", "bb"],
  //   ["wn", "wp", "e", "e", "e", "e", "bp", "bn"],
  //   ["wr", "wp", "e", "e", "e", "e", "bp", "br"],
  // ];

  [
    ["wrq", "e", "wp", "e", "e", "e", "bp", "brq"],
    ["e", "e", "e", "e", "br", "e", "e", "e"],
    ["wb", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "bq", "e", "e"],
    ["wku", "e", "e", "e", "e", "e", "e", "bku"],
    ["e", "e", "e", "bp", "e", "e", "e", "e"],
    ["e", "wp", "e", "e", "bn", "e", "e", "e"],
    ["wrk", "wp", "e", "e", "e", "wq", "e", "brk"],
  ];

router.use(express.json());

router.post("/", (req, res) => {
  gameStatus = req.body.gameStatus;

  // the first time a rook is moved, remove its q/k specification,
  // this specifation needs to be tracked to check if castling is a valid move
  if (
    (req.body.fromX == 0 || req.body.fromX == 7) &&
    (req.body.fromY == 0 || req.body.fromY == 7)
  ) {
    gameState[req.body.fromX][req.body.fromY] = gameState[req.body.fromX][
      req.body.fromY
    ].slice(0, 2);
  }

  // the first time a king is moved remove is unmoved ('u') specification,
  // this specifation needs to be tracked to check if castling is a valid move
  if (req.body.fromX == 4 && (req.body.fromY == 0 || req.body.fromY == 7)) {
    gameState[req.body.fromX][req.body.fromY] = gameState[req.body.fromX][
      req.body.fromY
    ].slice(0, 2);
  }
  gameMoves.push({
    fromX: req.body.fromX,
    fromY: req.body.fromY,
    toX: req.body.toX,
    toY: req.body.toY,
  });

  const selectedPiece = [req.body.fromX, req.body.fromY];
  const moveLocation = [req.body.toX, req.body.toY];
  // console.log("selectedPiece: ", selectedPiece);
  // console.log("move location: ", moveLocation);
  const piece = gameState[selectedPiece[0]][selectedPiece[1]];
  // console.log("selectedPiece is", piece);

  gameState[moveLocation[0]][moveLocation[1]] = piece;
  gameState[selectedPiece[0]][selectedPiece[1]] = "e";

  res.sendStatus(201);
});

router.get("/", (req, res) => {
  // console.log("gameMoves is: ", gameMoves);
  res.send({
    gameState: gameState,
    gameStatus: gameStatus,
    gameMoves: gameMoves.length != 0 ? gameMoves[gameMoves.length - 1] : {},
  });
});

module.exports = router;
