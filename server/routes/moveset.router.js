const express = require("express");
const router = express.Router();

router.use(express.json());

const moveset = [
  {
    symbol: "p",
    moveset: [[0, 1]],
    moveType: "pawn",
  },
  {
    symbol: "r",
    moveset: [
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ],
    moveType: "extender",
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
    moveType: "non-extender",
  },
  {
    symbol: "b",
    moveset: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
    moveType: "extender",
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
    moveType: "extender",
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
    moveType: "non-extender",
  },
];

router.get(
  "/check/gameState/:gameState/piece/:piece/userColorWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    console.log("inside check");

    const SQUARES_PER_SIDE = 8;
    const gameState = String(req.params.gameState).split(",");
    const gameStateTwoD = [];
    for (let i = 0; i < SQUARES_PER_SIDE; i++) {
      // gameStateTwoD[].push(gameState);
      const row = gameState.slice(i * 8, (i + 1) * 8);
      gameStateTwoD.push(row);
    }

    moveset.forEach((element) => {
      // GET AGGRESSOR MOVESET TO SEE IF MOVE IS CHECK
      if (element.symbol == req.params.piece.slice(1)) {
        const aggressorMoveset = getMoveset(
          element,
          req.params.isUserWhite,
          Number(req.params.x),
          Number(req.params.y),
          gameStateTwoD
        );
        console.log("aggressorMoveset is: ", aggressorMoveset);
      }
    });

    res.send("sheesh");
  }
);

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
            Number(req.params.x),
            Number(req.params.y),
            gameStateTwoD
          )
        );
      }
    });
  }
);

const getMoveset = (piece, isUserWhite, x, y, gameState) => {
  const thisMoveset = [];
  // console.log("inside getMoveset");
  if (piece.moveType == "non-extender") {
    nonextenderLogic(piece, isUserWhite, x, y, gameState, thisMoveset);
  } else if (piece.moveType == "extender") {
    extenderLogic(piece, isUserWhite, x, y, gameState, thisMoveset);
  } else {
    pawnLogic(piece, isUserWhite, x, y, gameState, thisMoveset);
  }

  return thisMoveset;
};

const isPawnMoveValid = (
  x,
  y,
  isUserWhite,
  gameState,
  IN_POSITION_TO_TAKE = false,
  thisMoveset
) => {
  const IS_ON_BOARD = x >= 0 && x < 8 && y >= 0 && y < 8;
  // console.log(IN_POSITION_TO_TAKE);
  if (IS_ON_BOARD) {
    const OCCUPIED_PIECE_COLOR = gameState[x][y].slice(0, 1);

    if (IN_POSITION_TO_TAKE) {
      checkForTakes(x, y, gameState, thisMoveset, isUserWhite);
    }
    const SQUARE_OCCUPIED_BY_OPPONENT =
      (isUserWhite === "true" && OCCUPIED_PIECE_COLOR === "b") ||
      (isUserWhite === "false" && OCCUPIED_PIECE_COLOR === "w");
    const MOVE_IS_VALID = !SQUARE_OCCUPIED_BY_OPPONENT;
    return MOVE_IS_VALID;
  }
};

const checkForTakes = (x, y, gameState, thisMoveset, isUserWhite) => {
  const OCCUPIED_LEFT_PIECE_COLOR =
    x > 0 ? gameState[x - 1][y].slice(0, 1) : false;
  const OCCUPIED_RIGHT_PIECE_COLOR =
    x < 7 ? gameState[x + 1][y].slice(0, 1) : false;
  // console.log("check for takes");
  const LEFT_SQUARE_OCCUPIED_BY_OPPONENT =
    (isUserWhite === "true" && OCCUPIED_LEFT_PIECE_COLOR === "b") ||
    (isUserWhite === "false" && OCCUPIED_LEFT_PIECE_COLOR === "w");
  if (LEFT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x - 1, y]);
  }

  const RIGHT_SQUARE_OCCUPIED_BY_OPPONENT =
    (isUserWhite === "true" && OCCUPIED_RIGHT_PIECE_COLOR === "b") ||
    (isUserWhite === "false" && OCCUPIED_RIGHT_PIECE_COLOR === "w");
  if (RIGHT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x + 1, y]);
  }
};

const pawnLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  const WHITE_PAWN_HOME_ROW = 1;
  const BLACK_PAWN_HOME_ROW = 6;
  const IN_POSITION_TO_TAKE = true;

  if (isUserWhite === "false") {
    const IS_FIRST_MOVE = y == BLACK_PAWN_HOME_ROW;
    if (
      isPawnMoveValid(
        x,
        y - 1,
        isUserWhite,
        gameState,
        IN_POSITION_TO_TAKE,
        thisMoveset
      )
    ) {
      thisMoveset.push([x, y - 1]);
      if (IS_FIRST_MOVE && isPawnMoveValid(x, y - 2, isUserWhite, gameState)) {
        thisMoveset.push([x, y - 2]);
      }
    }
  } else {
    const IS_FIRST_MOVE = y == WHITE_PAWN_HOME_ROW;
    if (
      isPawnMoveValid(
        x,
        y + 1,
        isUserWhite,
        gameState,
        IN_POSITION_TO_TAKE,
        thisMoveset
      )
    ) {
      thisMoveset.push([x, y + 1]);
      if (IS_FIRST_MOVE && isPawnMoveValid(x, y + 2, isUserWhite, gameState)) {
        thisMoveset.push([x, y + 2]);
      }
    }
  }
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

const nonextenderLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  piece.moveset.forEach((element) => {
    if (isUserWhite === "false") {
      if (isMoveValid(x + element[0], y - element[1], isUserWhite, gameState)) {
        thisMoveset.push([x + element[0], y - element[1]]);
      }
      // FINISH PAWN LOGIC HERE
    } else {
      if (isMoveValid(x + element[0], y + element[1], isUserWhite, gameState)) {
        thisMoveset.push([x + element[0], y + element[1]]);
      }
    }
  });
};

const extenderLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  // console.log(piece);
  piece.moveset.forEach((element) => {
    // console.log(element)
    let pathIsClear = true;
    if (isUserWhite === "false") {
      let i = 1;
      while (pathIsClear) {
        // console.log("i is: ", i);
        // console.log("x: ", x, "  y: ", y);
        // console.log("pathIsClear", pathIsClear);
        // console.log(x + element[0] * i, y - element[1] * i);
        if (
          isMoveValid(
            x + element[0] * i,
            y - element[1] * i,
            isUserWhite,
            gameState
          )
        ) {
          thisMoveset.push([x + element[0] * i, y - element[1] * i]);
          if (
            gameState[x + element[0] * i][y - element[1] * i].slice(0, 1) ===
            "w"
          ) {
            pathIsClear = false;
          }
          // console.log("moveset[i]", thisMoveset[i - 1]);
        } else {
          pathIsClear = false;
        }
        i++;
      }
    } else {
      let i = 1;
      while (pathIsClear) {
        // console.log("i is: ", i);
        // console.log("x: ", x, "  y: ", y);
        // console.log("pathIsClear", pathIsClear);
        // console.log(x + element[0] * i, y + element[1] * i);
        if (
          isMoveValid(
            x + element[0] * i,
            y + element[1] * i,
            isUserWhite,
            gameState
          )
        ) {
          thisMoveset.push([x + element[0] * i, y + element[1] * i]);
          if (
            gameState[x + element[0] * i][y + element[1] * i].slice(0, 1) ===
            "b"
          ) {
            pathIsClear = false;
          }

          // console.log("moveset[i]", thisMoveset[i - 1]);
        } else {
          pathIsClear = false;
        }
        i++;
      }
    }
  });
};

module.exports = router;
