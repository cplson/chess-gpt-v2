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
  "/check/gameState/:gameState/piece/:piece/isUserWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    // console.log("inside check");

    const isUserWhite = req.params.isUserWhite == "true" ? true : false;
    console.log("isUserwhite going into check: ", isUserWhite);
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
        const aggressor = element;
        const aggressorX = Number(req.params.x);
        const aggressorY = Number(req.params.y);
        const aggressorMoveset = getMoveset(
          aggressor,
          isUserWhite,
          aggressorX,
          aggressorY,
          gameStateTwoD
        );
        const IS_CHECK = check(aggressorMoveset, isUserWhite, gameStateTwoD);

        if (IS_CHECK) {
          const checkedTeamPieces = getOpposingTeamPieces(
            isUserWhite,
            gameStateTwoD,
            aggressorMoveset
          );
          // GET PATH TO KING HERE

          if (aggressor.moveType == "extender") {
            // XXXXXXXXXXXXXXXXX
            const OPPOSING_KING = isUserWhite ? "bk" : "wk";
            let opposingKingLocation;
            for (let i = 0; i < 8; i++) {
              for (let j = 0; j < 8; j++) {
                if (gameStateTwoD[i][j] == OPPOSING_KING) {
                  opposingKingLocation = [i, j];
                }
              }
            }
            const pathToKing = getPathToKing(
              opposingKingLocation,
              aggressorX,
              aggressorY
            );

            console.log("aggressorLocation: ", [aggressorX, aggressorY]);
            console.log("kingLocation: ", opposingKingLocation);
            // defenderMoveset.forEach;
          }

          if (checkedTeamPieces.length > 0) {
            checkedTeamPieces.forEach((defender) => {
              // console.log("defender: ", defender);

              const CAN_TAKE_AGGRESSOR = attemptToTakeAggressor(
                defender,
                aggressor,
                aggressorX,
                aggressorY,
                isUserWhite,
                aggressorMoveset,
                gameStateTwoD
              );

              if (CAN_TAKE_AGGRESSOR) {
                // console.log("returned successfully");
                return true;
              }
              // check if defender can get in the path between the threatening piece and the king

              //check if king can move out of harms way
            });
          }
          /*
          map through team B pieces:
			-if piece can take player threatening king
			-if piece can get in the path between the threatening piece and the king
			-if king can move out of harms way:
				map through every piece of team A and check if they have a path to any available moves for the king under threat, if so push them into an array.				-if all of the kings available moves are covered by the opposing team, that is CHECKMATE.
          */
        }
      }
    });

    res.send("sheesh");
  }
);

const getPathToKing = (kingLocation, aggressorX, aggressorY) => {
  const pathToKing = [];
  console.log("inside getPathToKing()");
  if (kingLocation[0] != aggressorX && kingLocation[1] != aggressorY) {
    if (kingLocation[0] > aggressorX && kingLocation[1] > aggressorY) {
      let j = aggressorY + 1;
      for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
        pathToKing.push([i, j]);
        j++;
      }
    } else if (kingLocation[0] < aggressorX && kingLocation[1] > aggressorY) {
      let j = aggressorY + 1;
      for (let i = aggressorX - 1; i > kingLocation[0]; i--) {
        pathToKing.push([i, j]);
        j++;
      }
      console.log("pathToKing: ", pathToKing);
    } else if (kingLocation[0] > aggressorX && kingLocation[1] < aggressorY) {
      let j = aggressorY - 1;
      for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
        pathToKing.push([i, j]);
        j--;
      }
      console.log("pathToKing: ", pathToKing);
    } else if (kingLocation[0] < aggressorX && kingLocation[1] < aggressorY) {
      let j = aggressorY - 1;
      for (let i = aggressorX - 1; i > kingLocation[0]; i--) {
        pathToKing.push([i, j]);
        j--;
      }
      console.log("pathToKing: ", pathToKing);
    }
    console.log("diagonal attack");
  } else if (kingLocation[0] == aggressorX) {
    console.log("vertical attack");
  } else {
    console.log("horizontal attack");
  }
  return pathToKing;
};

const attemptToTakeAggressor = (
  defender,
  aggressor,
  aggressorX,
  aggressorY,
  isUserWhite,
  aggressorMoveset,
  gameState
) => {
  // console.log(`
  // defender: ${defender.piece} [${defender.x}, ${defender.y}]
  // aggressor location: ${aggressorX}, ${aggressorY}
  // aggressor Moveset: ${aggressorMoveset}
  // `);
  let canDefend = false;
  let pieceSet;

  moveset.forEach((index) => {
    if (index.symbol == defender.piece.slice(1)) {
      pieceSet = index;
    }
  });
  const defenderMoveset = getMoveset(
    pieceSet,
    !Boolean(isUserWhite),
    defender.x,
    defender.y,
    gameState
  );
  // console.log("defenderMoveset: ", defenderMoveset);
  defenderMoveset.forEach((element) => {
    // console.log(element, aggressorX, aggressorY);
    if (element[0] == aggressorX && element[1] == aggressorY) {
      // console.log("can defend");
      canDefend = true;
    }
  });
};

router.get(
  "/gameState/:gameState/piece/:piece/isUserWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    const SQUARES_PER_SIDE = 8;
    const gameState = String(req.params.gameState).split(",");
    const gameStateTwoD = [];
    const isUserWhite = req.params.isUserWhite == "true" ? true : false;
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
            isUserWhite,
            Number(req.params.x),
            Number(req.params.y),
            gameStateTwoD
          )
        );
      }
    });
  }
);

const getOpposingTeamPieces = (isUserWhite, gameState, aggressorMoveset) => {
  // console.log('inside getOpposingTeamPieces')
  const OPPOSING_TEAM = isUserWhite ? "b" : "w";
  const teamPositions = [];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (gameState[i][j].slice(0, 1) == OPPOSING_TEAM) {
        teamPositions.push({ x: i, y: j, piece: gameState[i][j] });
      }
    }
  }

  return teamPositions;
};

const check = (moveset, isUserWhite, gameState) => {
  const OPPOSING_KING = isUserWhite ? "bk" : "wk";
  let check = false;
  console.log("opposingKing: ", OPPOSING_KING, "isUserWhite: ", isUserWhite);
  moveset.forEach((element) => {
    // console.log("moveset element is: ", element);
    // console.log(
    //   `gameState[${element[0]}][${element[1]}] is: `,
    //   gameState[element[0]][element[1]]
    // );
    if (gameState[element[0]][element[1]] == OPPOSING_KING) {
      check = true;
    }
  });
  return check;
};

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
      (isUserWhite && OCCUPIED_PIECE_COLOR === "b") ||
      (!isUserWhite && OCCUPIED_PIECE_COLOR === "w");
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
    (isUserWhite && OCCUPIED_LEFT_PIECE_COLOR === "b") ||
    (!isUserWhite && OCCUPIED_LEFT_PIECE_COLOR === "w");
  if (LEFT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x - 1, y]);
  }

  const RIGHT_SQUARE_OCCUPIED_BY_OPPONENT =
    (isUserWhite && OCCUPIED_RIGHT_PIECE_COLOR === "b") ||
    (!isUserWhite && OCCUPIED_RIGHT_PIECE_COLOR === "w");
  if (RIGHT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x + 1, y]);
  }
};

const pawnLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  const WHITE_PAWN_HOME_ROW = 1;
  const BLACK_PAWN_HOME_ROW = 6;
  const IN_POSITION_TO_TAKE = true;

  if (!isUserWhite) {
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
      (isUserWhite && OCCUPIED_PIECE_COLOR === "w") ||
      (!isUserWhite && OCCUPIED_PIECE_COLOR === "b");
    const MOVE_IS_VALID = !SQUARE_OCCUPIED_BY_FRIENDLY;
    return MOVE_IS_VALID;
  }
};

const nonextenderLogic = (piece, isUserWhite, x, y, gameState, thisMoveset) => {
  piece.moveset.forEach((element) => {
    if (!isUserWhite) {
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
    if (!isUserWhite) {
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
