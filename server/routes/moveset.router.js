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
  "/gameState/:gameState/piece/:piece/userColorWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    const SQUARES_PER_SIDE = 8;
    const gameState = String(req.params.gameState).split(",");
    const gameStateTwoD = [];

    for (let i = 0; i < SQUARES_PER_SIDE; i++) {
      // gameStateTwoD[].push(gameState);
      const row = gameState.slice(i * 8, (i + 1) * 8);
      gameStateTwoD.push(row);
    }

    moveset.forEach((element) => {
      if (element.symbol == req.params.piece.slice(1)) {
        res.send(
          getMoveset(
            element,
            req.params.isUserWhite,
            req.params.x,
            req.params.y,
            gameStateTwoD
          )
        );
      }
    });
  }
);

const getMoveset = (piece, isUserWhite, x, y, gameState) => {
  const thisMoveset = [];
  console.log("inside getMoveset");
  if (!piece.extender) {
    nonExtenderLogic(piece, isUserWhite, x, y, gameState, thisMoveset);
  } else {
    extenderLogic(piece, isUserWhite, x, y, gameState, thisMoveset);
  }

  return thisMoveset;
};

const isMoveValid = (x, y, isUserWhite, gameState) => {
  const IS_ON_BOARD = x >= 0 && x < 8 && y >= 0 && y < 8;
  if (IS_ON_BOARD) {
    const OCCUPIED_PIECE_COLOR = gameState[x][y].slice(0, 1);
    const SQUARE_OCCUPIED_BY_FRIENDLY =
      (isUserWhite === "true" && OCCUPIED_PIECE_COLOR === "w") ||
      (isUserWhite === "false" && OCCUPIED_PIECE_COLOR === "b");
    const MOVE_IS_VALID = !SQUARE_OCCUPIED_BY_FRIENDLY;
    return MOVE_IS_VALID;
  }
};

const nonExtenderLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  piece.moveset.forEach((element) => {
    if (isUserWhite === "false") {
      if (
        isMoveValid(
          Number(x) + element[0],
          Number(y) - element[1],
          isUserWhite,
          gameState
        )
      ) {
        thisMoveset.push([Number(x) + element[0], Number(y) - element[1]]);
      }
    } else {
      if (
        isMoveValid(
          Number(x) + element[0],
          Number(y) + element[1],
          isUserWhite,
          gameState
        )
      ) {
        thisMoveset.push([Number(x) + element[0], Number(y) + element[1]]);
      }
    }
  });
};

const extenderLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  console.log(piece);
  piece.moveset.forEach((element) => {
    // console.log(element)
    let pathIsClear = true;
    if (isUserWhite === "false") {
      let i = 1;
      while (pathIsClear) {
        console.log("i is: ", i);
        console.log("x: ", x, "  y: ", y);
        console.log("pathIsClear", pathIsClear);
        console.log(Number(x) + element[0] * i, Number(y) - element[1] * i);
        if (
          isMoveValid(
            Number(x) + element[0] * i,
            Number(y) - element[1] * i,
            isUserWhite,
            gameState
          )
        ) {
          thisMoveset.push([
            Number(x) + element[0] * i,
            Number(y) - element[1] * i,
          ]);
          if (
            gameState[Number(x) + element[0] * i][
              Number(y) - element[1] * i
            ].slice(0, 1) === "w"
          ) {
            pathIsClear = false;
          }
          console.log("moveset[i]", thisMoveset[i - 1]);
        } else {
          pathIsClear = false;
        }
        i++;
      }
    } else {
      let i = 1;
      while (pathIsClear) {
        console.log("i is: ", i);
        console.log("x: ", x, "  y: ", y);
        console.log("pathIsClear", pathIsClear);
        console.log(Number(x) + element[0] * i, Number(y) + element[1] * i);
        if (
          isMoveValid(
            Number(x) + element[0] * i,
            Number(y) + element[1] * i,
            isUserWhite,
            gameState
          )
        ) {
          thisMoveset.push([
            Number(x) + element[0] * i,
            Number(y) + element[1] * i,
          ]);
          if (
            gameState[Number(x) + element[0] * i][
              Number(y) + element[1] * i
            ].slice(0, 1) === "b"
          ) {
            pathIsClear = false;
          }

          console.log("moveset[i]", thisMoveset[i - 1]);
        } else {
          pathIsClear = false;
        }
        i++;
      }
    }
  });
};

module.exports = router;
