const express = require("express");
const router = express.Router();

router.use(express.json());

const moveset = [
  {
    symbol: "p",
    moveset: [
      [0, 1],
      [0, 2],
    ],
    extender: false,
  },
  {
    symbol: "r",
    moveset: [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ],
    extender: true,
  },
  {
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
  {
    symbol: "b",
    moveset: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
    extender: true,
  },
  {
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
  {
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
];

router.get(
  "/piece/:piece/userColorWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    console.log(req.params);

    moveset.forEach((element) => {
      if (element.symbol == req.params.piece.slice(1)) {
        res.send(
          getMoveset(
            element,
            req.params.isUserWhite,
            req.params.x,
            req.params.y
          )
        );
      }
    });
  }
);

const getMoveset = (piece, isUserWhite, x, y) => {
  const thisMoveset = [];
  if (!piece.extender) {
    piece.moveset.forEach((element) => {
      if (!isUserWhite === true && piece.symbol == "p") {
        thisMoveset.push([Number(x) + element[0], Number(y) - element[1]]);
      } else {
        thisMoveset.push([Number(x) + element[0], Number(y) + element[1]]);
      }
    });
  }
  return thisMoveset;
};

module.exports = router;
