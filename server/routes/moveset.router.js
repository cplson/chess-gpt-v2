const express = require("express");
const router = express.Router();

router.use(express.json());
const SQUARES_PER_SIDE = 8;
let gameState, gameStatus;
const gameMoves = [];
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

// ALL PIECE DATA THAT THE MOVESET ROUTER WORKS WITH MUST BE FORMATTED USING THIS FORMATTER!!
const formatPiece = (stateString, thisX = undefined, thisY = undefined) => {
  const symbol = stateString.slice(1, 3);
  // console.log(symbol);

  const color = stateString.slice(0, 1);
  let set, moveType, location, x, y;
  let moves = [];
  // this is used for formatting whole teams
  if (thisX != undefined && thisY != undefined) {
    x = thisX;
    y = thisY;
    location = [thisX, thisY];
  } else {
    // this is used for formatting single pieces
    for (let i = 0; i < SQUARES_PER_SIDE; i++) {
      for (let j = 0; j < SQUARES_PER_SIDE; j++) {
        if (
          gameState[i][j] == color + symbol ||
          gameState[i][j] == color + symbol + "u"
        ) {
          x = i;
          y = j;
          location = [x, y];
        }
      }
    }
  }

  moveset.forEach((element) => {
    if (symbol.slice(0, 1) == element.symbol) {
      set = element.moveset;
      moveType = element.moveType;
    }
  });
  // console.log("symbol after slice logic", symbol.length);

  moves = getMoves({ symbol, color, x, y, location, set, moveType });
  return { symbol, color, location, set, moveType, moves };
};

// formats 2D gameState array
const formatGameState = (incomingState) => {
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
    formatGameState(req.params.gameState);
    x = Number(req.params.x);
    y = Number(req.params.y);

    const formattedPiece = formatPiece(req.params.piece, x, y);

    res.send({ moves: formattedPiece.moves, gameState: gameState });
  }
);

router.get(
  "/check/gameState/:gameState/gameStatus/:gameStatus/gameMove/:gameMove/piece/:piece/isUserWhite/:isUserWhite/",
  (req, res) => {
    formatGameState(req.params.gameState);
    gameStatus = req.params.gameStatus;
    const incomingMove = JSON.parse(req.params.gameMove);
    // let isUserWhite = req.params.isUserWhite;
    let piece = req.params.piece;
    let pieceColor = piece.slice(0, 1);
    gameMoves.push(incomingMove);

    const CHECK = checkForCheck(piece, incomingMove.toX, incomingMove.toY);

    // CHECK IF NOT CHECKMATE
    if (CHECK) {
      gameStatus = "check";
      const aggressor = formatPiece(piece);
      const kingUnderDuress = formatPiece(
        (pieceColor == "w" ? "b" : "w") + "k"
      );
      // console.log("aggressor: ", aggressor);
      // console.log("kingUnderDuress: ", kingUnderDuress);
      const pathToKing = getPathToKing(
        kingUnderDuress.location,
        incomingMove.toX,
        incomingMove.toY,
        aggressor
      );
      const availableMoves = attemptToNeutralizeThreat(
        pieceColor == "w" ? "b" : "w",
        pathToKing,
        incomingMove.toX,
        incomingMove.toY
      );

      if (availableMoves.length == 0) {
        gameStatus = "checkmate";
      }
    }
    res.send(gameStatus);

    // IMPLEMENT LATER
    //   if(!CHECK){
    //     res.send(gameStatus);
    //   }else{

    //     res.send({gameStatus, availableMoveset})
    //   }
  }
);

const attemptToNeutralizeThreat = (
  color,
  pathToKing,
  aggressorX,
  aggressorY
) => {
  const teamPieces = getTeamPieces(color);
  console.log(teamPieces);
  const availableMoves = [];

  // console.log(
  //   "inside attemptToNeutralizeThreat(): ",
  //   color,
  //   pathToKing,
  //   aggressorX,
  //   aggressorY
  // );
  // check if any pieces can take the aggressor
  // if pathtoKing length is > 0, check if pieces can get in the path of the aggressor

  return availableMoves;
};

const getKing = (color) => {
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      // console.log(gameState[i][j].slice(1));
      if (
        gameState[i][j].slice(0, 1) == color &&
        gameState[i][j].slice(1, 2) == "k"
      ) {
        return formatPiece(gameState[i][j]);
      }
    }
  }
};

const checkForCheck = (piece, x, y) => {
  const formattedPiece = formatPiece(piece);
  let kingColor = formattedPiece.color == "w" ? "b" : "w";
  const king = getKing(kingColor);
  // console.log(king);

  const CHECK = checkForThreat(king.location, kingColor);
  // console.log("inside format piece with piece: ", formattedPiece);
  // console.log("king is: ", king);
  return CHECK;
};

const checkForThreat = (location, checkForColor) => {
  // GET ALL OPPONENT FORMATTED PIECES
  // console.log("checkForColor is: ", checkForColor);
  let threatCondition = false;
  const opponentPieces = getTeamPieces(checkForColor == "w" ? "b" : "w");
  opponentPieces.forEach((oppPiece) => {
    oppPiece.moves.forEach((move) => {
      if (move[0] == location[0] && move[1] == location[1]) {
        threatCondition = true;
      }
    });
  });
  return threatCondition;
};

const getTeamPieces = (color) => {
  const teamPieces = [];
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      if (gameState[i][j].slice(0, 1) == color) {
        teamPieces.push(formatPiece(gameState[i][j]));
      }
    }
  }
  return teamPieces;
};

const getPathToKing = (kingLocation, aggressorX, aggressorY, aggressor) => {
  const pathToKing = [];
  if (aggressor.moveType == "extender") {
    // console.log(
    //   "inside getPathToKing(), ",
    //   kingLocation,
    //   aggressor,
    //   aggressorX,
    //   aggressorY
    // );
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
      } else {
        let j = aggressorY - 1;
        for (let i = aggressorX - 1; i > kingLocation[0]; i--) {
          pathToKing.push([i, j]);
          j--;
        }
        console.log("pathToKing: ", pathToKing);
      }
      console.log("diagonal attack");
    } else if (kingLocation[0] == aggressorX) {
      if (kingLocation[1] > aggressorY) {
        for (let i = aggressorY + 1; i < kingLocation[1]; i++) {
          pathToKing.push([aggressorX, i]);
        }
      } else if (kingLocation[1] < aggressorY) {
        console.log("inside else if");
        for (let i = kingLocation[1] + 1; i < aggressorY; i++) {
          pathToKing.push([aggressorX, i]);
        }
      }
      console.log("vertical attack", pathToKing);
    } else {
      if (kingLocation[0] > aggressorX) {
        for (let i = aggressorX + 1; i < kingLocation[0]; i++) {
          pathToKing.push([i, aggressorY]);
        }
      } else {
        for (let i = kingLocation[0] + 1; i < aggressorX; i++) {
          pathToKing.push([i, aggressorY]);
        }
      }
      console.log("horizontal attack", pathToKing);
    }
  }
  return pathToKing;
};

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

const isPawnMoveValid = (x, y, color, IN_POSITION_TO_TAKE, thisMoveset) => {
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

  if (!(piece.color == "w")) {
    const IS_FIRST_MOVE = y == BLACK_PAWN_HOME_ROW;
    if (isPawnMoveValid(piece.x, piece.y - 1, piece.color, true, thisMoveset)) {
      thisMoveset.push([piece.x, piece.y - 1]);
      if (
        IS_FIRST_MOVE &&
        isPawnMoveValid(piece.x, piece.y - 2, piece.color, false, thisMoveset)
      ) {
        thisMoveset.push([piece.x, piece.y - 2]);
      }
    }
  } else {
    const IS_FIRST_MOVE = piece.y == WHITE_PAWN_HOME_ROW;
    if (isPawnMoveValid(piece.x, piece.y + 1, piece.color, true, thisMoveset)) {
      thisMoveset.push([piece.x, piece.y + 1]);
      if (
        IS_FIRST_MOVE &&
        isPawnMoveValid(piece.x, piece.y + 2, piece.color, false, thisMoveset)
      ) {
        thisMoveset.push([piece.x, piece.y + 2]);
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
      if (
        isMoveValid(piece.x + element[0], piece.y - element[1], piece.color)
      ) {
        thisMoveset.push([piece.x + element[0], piece.y - element[1]]);
      }
    } else {
      if (
        isMoveValid(piece.x + element[0], piece.y + element[1], piece.color)
      ) {
        thisMoveset.push([piece.x + element[0], piece.y + element[1]]);
      }
    }
  });
};
const checkCastle = (piece, thisMoveset) => {
  // check if king has not been moved
  let king = getKing(piece.color);
  // if unmoved, proceed to check for threat conditions
  if (king.symbol.length == 2) {
    // console.log("proceed to check for threat conditions", gameState);
    if (
      (piece.x == 7 &&
        gameState[6][piece.y] == "e" &&
        gameState[5][piece.y] == "e") ||
      (piece.x == 0 &&
        gameState[1][piece.y] == "e" &&
        gameState[2][piece.y] == "e" &&
        gameState[3][piece.y] == "e")
    ) {
    }
  }
};

const extenderLogic = (piece, thisMoveset) => {
  // if rook has not been moved, check if castling is a valid move
  if (piece.symbol.slice(0, 1) == "r" && piece.symbol.length == 2) {
    checkCastle(piece, thisMoveset);
  }
  piece.set.forEach((element) => {
    let pathIsClear = true;

    if (!(piece.color == "w")) {
      let i = 1;
      while (pathIsClear) {
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
        } else {
          pathIsClear = false;
        }
        i++;
      }
    } else {
      let i = 1;
      while (pathIsClear) {
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
//   "/check/gameState/:gameState/gameStatus/:gameStatus/gameMoves/:gameMoves/piece/:piece/isUserWhite/:isUserWhite/x/:x/y/:y",
//   (req, res) => {
//     // console.log("inside check");

//     const isUserWhite = req.params.isUserWhite == "true" ? true : false;
//     console.log("isUserwhite going into check: ", isUserWhite);
//     const SQUARES_PER_SIDE = 8;
//
//     formatGameState(req.params.gameState);

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
