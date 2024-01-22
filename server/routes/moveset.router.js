const express = require("express");
const router = express.Router();

const moveset = {
  pawn: {
    symbol: "p",
    moveset: [0, 1],
    extender: false,
  },
  rook: {
    symbol: "r",
    moveset: [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ],
    extender: true,
  },
  knight: {
    symbol: "n",
    moveset: [
      [-2, 1],
      [-2, -1],
      [2, 1],
      [2, -1],
      [1, 2],
      [-1, 2],
      [1, -2],
      [-1, -2],
    ],
    extender: false,
  },
  bishop: {
    symbol: "b",
    moveset: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
    extender: true,
  },
  queen: {
    symbol: "q",
    moveset: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ],
    extender: true,
  },
  king: {
    symbol: "k",
    moveset: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ],
    extender: false,
  },
};
router.use(express.json());

router.get("/", (req, res) => {
  console.log("yay", req.body);
  res.send("yay");
});

module.exports = router;
