const express = require("express");
const router = express.Router();

router.use(express.json());
const SQUARES_PER_SIDE = 8;
let gameState, gameStatus;
let isUserWhite, x, y;
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

const formatPiece = (stateString, x, y) => {
  const symbol = stateString.slice(1);
  const color = stateString.slice(0, 1);
  location = [x, y];
  let set, moveType;
  let moves = [];
  moveset.forEach((element) => {
    if (symbol == element.symbol) {
      set = element.moveset;
      moveType = element.moveType;
    }
  });

  moves = getMoves({ symbol, color, x, y, location, set, moveType });
  return { symbol, color, location, set, moveType, moves };
};

const getGameState = (incomingState) => {
  const gs = String(incomingState).split(",");
  const gameStateTwoD = [];

  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    const row = gs.slice(i * 8, (i + 1) * 8);
    gameStateTwoD.push(row);
  }
  gameState = gameStateTwoD;
};

router.get(
  "/gameState/:gameState/gameStatus/:gameStatus/piece/:piece/isUserWhite/:isUserWhite/x/:x/y/:y",
  (req, res) => {
    const SQUARES_PER_SIDE = 8;
    gameStatus = req.params.gameStatus;
    isUserWhite = req.params.isUserWhite == "true" ? true : false;
    getGameState(req.params.gameState);
    x = Number(req.params.x);
    y = Number(req.params.y);

    const formattedPiece = formatPiece(req.params.piece, x, y);
    // moveset.forEach((element) => {
    //   if (element.symbol == req.params.piece.slice(1)) {
    //     res.send(
    //       getMoves(
    //         element,
    //         isUserWhite,
    //         Number(req.params.x),
    //         Number(req.params.y),
    //         gameStateTwoD
    //       )
    //     );
    //   }
    // });

    res.send({ moves: formattedPiece.moves, gameState: gameState });
  }
);

const getMoves = (piece) => {
  const thisMoveset = [];

  if (piece.moveType == "non-extender") {
    nonextenderLogic(piece, thisMoveset);
  } else if (piece.moveType == "extender") {
    extenderLogic(piece, thisMoveset);
  } else {
    pawnLogic(piece, thisMoveset);
  }

  return thisMoveset;
};

const isPawnMoveValid = (
  x,
  y,
  color,
  IN_POSITION_TO_TAKE = false,
  thisMoveset
) => {
  const IS_ON_BOARD = x >= 0 && x < 8 && y >= 0 && y < 8;
  // console.log(IN_POSITION_TO_TAKE);
  if (IS_ON_BOARD) {
    const OCCUPIED_PIECE = gameState[x][y].slice(0, 1);

    if (IN_POSITION_TO_TAKE) {
      checkForTakes(x, y, thisMoveset, color);
    }
    const SQUARE_OCCUPIED = OCCUPIED_PIECE != "e";
    const MOVE_IS_VALID = !SQUARE_OCCUPIED;
    return MOVE_IS_VALID;
  }
};

const checkForTakes = (x, y, thisMoveset, color) => {
  const OCCUPIED_LEFT_PIECE_COLOR =
    x > 0 ? gameState[x - 1][y].slice(0, 1) : false;
  const OCCUPIED_RIGHT_PIECE_COLOR =
    x < 7 ? gameState[x + 1][y].slice(0, 1) : false;
  // console.log("check for takes");
  const LEFT_SQUARE_OCCUPIED_BY_OPPONENT =
    (color == "w" && OCCUPIED_LEFT_PIECE_COLOR === "b") ||
    (color == "b" && OCCUPIED_LEFT_PIECE_COLOR === "w");
  if (LEFT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x - 1, y]);
  }

  const RIGHT_SQUARE_OCCUPIED_BY_OPPONENT =
    (color == "w" && OCCUPIED_RIGHT_PIECE_COLOR === "b") ||
    (color == "b" && OCCUPIED_RIGHT_PIECE_COLOR === "w");
  if (RIGHT_SQUARE_OCCUPIED_BY_OPPONENT) {
    thisMoveset.push([x + 1, y]);
  }
};

const pawnLogic = (piece, thisMoveset) => {
  const WHITE_PAWN_HOME_ROW = 1;
  const BLACK_PAWN_HOME_ROW = 6;
  const IN_POSITION_TO_TAKE = false;

  if (!(piece.color == "w")) {
    const IS_FIRST_MOVE = y == BLACK_PAWN_HOME_ROW;
    if (
      isPawnMoveValid(
        piece.x,
        piece.y - 1,
        piece.color,
        IN_POSITION_TO_TAKE,
        thisMoveset
      )
    ) {
      thisMoveset.push([piece.x, piece.y - 1]);
      if (IS_FIRST_MOVE && isPawnMoveValid(piece.x, piece.y - 2)) {
        thisMoveset.push([piece.x, piece.y - 2]);
      }
    }
  } else {
    const IS_FIRST_MOVE = y == WHITE_PAWN_HOME_ROW;
    if (
      isPawnMoveValid(x, y + 1, piece.color, IN_POSITION_TO_TAKE, thisMoveset)
    ) {
      thisMoveset.push([x, y + 1]);
      if (IS_FIRST_MOVE && isPawnMoveValid(x, y + 2, piece.color)) {
        thisMoveset.push([x, y + 2]);
      }
    }
  }
};

const isMoveValid = (x, y, color) => {
  const IS_ON_BOARD = x >= 0 && x < 8 && y >= 0 && y < 8;

  if (IS_ON_BOARD) {
    const OCCUPIED_PIECE_COLOR = gameState[x][y].slice(0, 1);
    const SQUARE_OCCUPIED_BY_FRIENDLY =
      (color == "w" && OCCUPIED_PIECE_COLOR === "w") ||
      (color == "b" && OCCUPIED_PIECE_COLOR === "b");
    const MOVE_IS_VALID = !SQUARE_OCCUPIED_BY_FRIENDLY;
    return MOVE_IS_VALID;
  }
};

const nonextenderLogic = (piece, thisMoveset) => {
  piece.set.forEach((element) => {
    if (!(piece.color == "w")) {
      if (isMoveValid(x + element[0], y - element[1], piece.color)) {
        thisMoveset.push([x + element[0], y - element[1]]);
      }
      // FINISH PAWN LOGIC HERE
    } else {
      if (isMoveValid(x + element[0], y + element[1], piece.color)) {
        thisMoveset.push([x + element[0], y + element[1]]);
      }
    }
  });
};

const extenderLogic = (piece, thisMoveset) => {
  // console.log(piece);
  // if ((piece.symbol = "r")) {
  //   rookLogic(x, y, isUserWhite, gameState, thisMoveset);
  // }
  piece.set.forEach((element) => {
    let pathIsClear = true;

    if (!(piece.color == "w")) {
      let i = 1;
      while (pathIsClear) {
        // console.log("i is: ", i);
        // console.log("x: ", x, "  y: ", y);
        // console.log("pathIsClear", pathIsClear);
        // console.log(x + element[0] * i, y - element[1] * i);

        if (
          isMoveValid(
            piece.x + element[0] * i,
            piece.y - element[1] * i,
            piece.color
          )
        ) {
          thisMoveset.push([
            piece.x + element[0] * i,
            piece.y - element[1] * i,
          ]);
          if (
            gameState[piece.x + element[0] * i][piece.y - element[1] * i].slice(
              0,
              1
            ) === "w"
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
            piece.x + element[0] * i,
            piece.y + element[1] * i,
            piece.color
          )
        ) {
          thisMoveset.push([
            piece.x + element[0] * i,
            piece.y + element[1] * i,
          ]);
          if (
            gameState[piece.x + element[0] * i][piece.y + element[1] * i].slice(
              0,
              1
            ) === "b"
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

// const rookLogic = (x, y, isUserWhite, gameState, thisMoveset) => {
//   if(gameState)
// }

// router.get(
//   "/check/gameState/:gameState/piece/:piece/isUserWhite/:isUserWhite/x/:x/y/:y",
//   (req, res) => {
//     // console.log("inside check");

//     const isUserWhite = req.params.isUserWhite == "true" ? true : false;
//     console.log("isUserwhite going into check: ", isUserWhite);
//     const SQUARES_PER_SIDE = 8;
//
//     getGameState(req.params.gameState);

//     moveset.forEach((element) => {
//       // GET AGGRESSOR MOVESET TO SEE IF MOVE IS CHECK
//       if (element.symbol == req.params.piece.slice(1)) {
//         const aggressor = element;
//         const aggressorX = Number(req.params.x);
//         const aggressorY = Number(req.params.y);
//         const aggressorMoveset = getMoves(
//           aggressor,
//           isUserWhite,
//           aggressorX,
//           aggressorY,
//           gameStateTwoD
//         );
//         const IS_CHECK = check(aggressorMoveset, isUserWhite, gameStateTwoD);

//         if (IS_CHECK) {
//           const checkedTeamPieces = getOpposingTeamPieces(
//             isUserWhite,
//             gameStateTwoD,
//             aggressorMoveset
//           );
//           // GET PATH TO KING HERE

//           if (aggressor.moveType == "extender") {
//             // XXXXXXXXXXXXXXXXX
//             const OPPOSING_KING = isUserWhite ? "bk" : "wk";
//             let opposingKingLocation;
//             for (let i = 0; i < 8; i++) {
//               for (let j = 0; j < 8; j++) {
//                 if (gameStateTwoD[i][j] == OPPOSING_KING) {
//                   opposingKingLocation = [i, j];
//                 }
//               }
//             }
//             const pathToKing = getPathToKing(
//               opposingKingLocation,
//               aggressorX,
//               aggressorY
//             );

//             console.log("aggressorLocation: ", [aggressorX, aggressorY]);
//             console.log("kingLocation: ", opposingKingLocation);
//             // defenderMoveset.forEach;
//           }

//           if (checkedTeamPieces.length > 0) {
//             checkedTeamPieces.forEach((defender) => {
//               // console.log("defender: ", defender);

//               const CAN_TAKE_AGGRESSOR = attemptToTakeAggressor(
//                 defender,
//                 aggressor,
//                 aggressorX,
//                 aggressorY,
//                 isUserWhite,
//                 aggressorMoveset,
//                 gameStateTwoD
//               );

//               if (CAN_TAKE_AGGRESSOR) {
//                 // console.log("returned successfully");
//                 return true;
//               }
//               // check if defender can get in the path between the threatening piece and the king

//               //check if king can move out of harms way
//             });
//           }
//           /*
//           map through team B pieces:
// 			-if piece can take player threatening king
// 			-if piece can get in the path between the threatening piece and the king
// 			-if king can move out of harms way:
// 				map through every piece of team A and check if they have a path to any available moves for the king under threat, if so push them into an array.				-if all of the kings available moves are covered by the opposing team, that is CHECKMATE.
//           */
//         }
//       }
//     });

//     res.send("sheesh");
//   }
// );

// const getPathToKing = (kingLocation, aggressorX, aggressorY) => {
//   const pathToKing = [];
//   console.log("inside getPathToKing()");
//   if (kingLocation[0] != aggressorX && kingLocation[1] != aggressorY) {
//     if (kingLocation[0] > aggressorX && kingLocation[1] > aggressorY) {
//       let j = aggressorY + 1;
//       for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
//         pathToKing.push([i, j]);
//         j++;
//       }
//     } else if (kingLocation[0] < aggressorX && kingLocation[1] > aggressorY) {
//       let j = aggressorY + 1;
//       for (let i = aggressorX - 1; i > kingLocation[0]; i--) {
//         pathToKing.push([i, j]);
//         j++;
//       }
//       console.log("pathToKing: ", pathToKing);
//     } else if (kingLocation[0] > aggressorX && kingLocation[1] < aggressorY) {
//       let j = aggressorY - 1;
//       for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
//         pathToKing.push([i, j]);
//         j--;
//       }
//       console.log("pathToKing: ", pathToKing);
//     } else {
//       let j = aggressorY - 1;
//       for (let i = aggressorX - 1; i > kingLocation[0]; i--) {
//         pathToKing.push([i, j]);
//         j--;
//       }
//       console.log("pathToKing: ", pathToKing);
//     }
//     console.log("diagonal attack");
//   } else if (kingLocation[0] == aggressorX) {
//     if (kingLocation[1] > aggressorY) {
//       for (let i = aggressorY + 1; i < kingLocation[1]; i++) {
//         pathToKing.push([aggressorX, i]);
//       }
//     } else if (kingLocation[1] < aggressorY) {
//       console.log("inside else if");
//       for (let i = kingLocation[1] + 1; i < aggressorY; i++) {
//         pathToKing.push([aggressorX, i]);
//       }
//     }
//     console.log("vertical attack", pathToKing);
//   } else {
//     if (kingLocation[0] > aggressorX) {
//       for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
//         pathToKing.push([i, aggressorY]);
//       }
//     } else {
//       for (let i = kingLocation[0] + 1; i < aggressorX; i++) {
//         pathToKing.push([i, aggressorY]);
//       }
//     }
//     console.log("horizontal attack", pathToKing);
//   }
//   return pathToKing;
// };

// const attemptToTakeAggressor = (
//   defender,
//   aggressor,
//   aggressorX,
//   aggressorY,
//   isUserWhite,
//   aggressorMoveset,
//   gameState
// ) => {
//   // console.log(`
//   // defender: ${defender.piece} [${defender.x}, ${defender.y}]
//   // aggressor location: ${aggressorX}, ${aggressorY}
//   // aggressor Moveset: ${aggressorMoveset}
//   // `);
//   let canDefend = false;
//   let pieceSet;

//   moveset.forEach((index) => {
//     if (index.symbol == defender.piece.slice(1)) {
//       pieceSet = index;
//     }
//   });
//   const defenderMoveset = getMoves(
//     pieceSet,
//     !Boolean(isUserWhite),
//     defender.x,
//     defender.y,
//     gameState
//   );
//   // console.log("defenderMoveset: ", defenderMoveset);
//   defenderMoveset.forEach((element) => {
//     // console.log(element, aggressorX, aggressorY);
//     if (element[0] == aggressorX && element[1] == aggressorY) {
//       // console.log("can defend");
//       canDefend = true;
//     }
//   });
// };

// const getOpposingTeamPieces = (isUserWhite, gameState, aggressorMoveset) => {
//   // console.log('inside getOpposingTeamPieces')
//   const OPPOSING_TEAM = isUserWhite ? "b" : "w";
//   const teamPositions = [];

//   for (let i = 0; i < 8; i++) {
//     for (let j = 0; j < 8; j++) {
//       if (gameState[i][j].slice(0, 1) == OPPOSING_TEAM) {
//         teamPositions.push({ x: i, y: j, piece: gameState[i][j] });
//       }
//     }
//   }

//   return teamPositions;
// };

// const check = (moveset, isUserWhite, gameState) => {
//   const OPPOSING_KING = isUserWhite ? "bk" : "wk";
//   let check = false;
//   console.log("opposingKing: ", OPPOSING_KING, "isUserWhite: ", isUserWhite);
//   moveset.forEach((element) => {
//     // console.log("moveset element is: ", element);
//     // console.log(
//     //   `gameState[${element[0]}][${element[1]}] is: `,
//     //   gameState[element[0]][element[1]]
//     // );
//     if (gameState[element[0]][element[1]] == OPPOSING_KING) {
//       check = true;
//     }
//   });
//   return check;
// };

module.exports = router;
