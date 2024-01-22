const MAX_LENGTH = 620;
const SQUARES_PER_SIDE = 8;
const MAX_SIDE_LENGTH = MAX_LENGTH / SQUARES_PER_SIDE;
const STARTING_PIECE_COUNT = 32;
const userIsWhite = false;
let isUserPiece;
let boardSideLength, squareSideLength, isMaxLength, pieces, positions;
let blackPawn, blackRook, blackKnight, blackBishop, blackQueen, blackKing;
let whitePawn, whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing;
let gameState;
let pressedX, pressedY;
const cachedPieceMoves = [];
async function preload() {
  // preload images
  blackPawn = await loadImage("./assets/Chess_pdt45.svg");
  blackRook = await loadImage("./assets/Chess_rdt45.svg");
  blackKnight = await loadImage("./assets/Chess_ndt45.svg");
  blackBishop = await loadImage("./assets/Chess_bdt45.svg");
  blackQueen = await loadImage("./assets/Chess_qdt45.svg");
  blackKing = await loadImage("./assets/Chess_kdt45.svg");
  whitePawn = await loadImage("./assets/Chess_plt45.svg");
  whiteRook = await loadImage("./assets/Chess_rlt45.svg");
  whiteKnight = await loadImage("./assets/Chess_nlt45.svg");
  whiteBishop = await loadImage("./assets/Chess_blt45.svg");
  whiteQueen = await loadImage("./assets/Chess_qlt45.svg");
  whiteKing = await loadImage("./assets/Chess_klt45.svg");
  let response = await axios.get("http://localhost:5000/api/gameState");
  gameState = response.data;
}
async function setup() {
  pieces = await getPieces();
  positions = [
    ...pieces.pieces.pawn.locations,
    ...pieces.pieces.rook.locations,
    ...pieces.pieces.knight.locations,
    ...pieces.pieces.bishop.locations,
    ...pieces.pieces.queen.locations,
    ...pieces.pieces.king.locations,
  ];
  document
    .getElementById("route-tester")
    .addEventListener("click", async () => {
      const status = await move();
      console.log(status);
    });
}
function draw() {
  drawBoard();
}

const drawBoard = async () => {
  let parentElement = select("#chess-container");
  let board;

  imageMode(CENTER);
  boardSideLength = parentElement.width * 0.8;
  squareSideLength = boardSideLength / SQUARES_PER_SIDE;
  if (boardSideLength > MAX_LENGTH) {
    isMaxLength = true;
    board = createCanvas(MAX_LENGTH, MAX_LENGTH);
    squareSideLength = MAX_LENGTH / SQUARES_PER_SIDE;
  } else {
    isMaxLength = false;
    board = createCanvas(boardSideLength, boardSideLength);
    squareSideLength = boardSideLength / SQUARES_PER_SIDE;
  }
  board.parent(parentElement);

  background("#EEE");
  let k = 0;
  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      let fillColor = (i + j) % 2 === 0 ? "#DDD" : "#333";

      fill(fillColor);
      square(j * squareSideLength, i * squareSideLength, squareSideLength);
      if (gameState[j][i] != "e") {
        highlightOnHover(j, i);
        highlightOnClick(j, i);
        findPiece(gameState[j][i].slice(0, 1), gameState[j][i].slice(1), j, i);
      }
    }
  }
};

const getPieces = async () => {
  const response = await fetch("./gameState.json");
  return response.json();
};

const findPiece = (color, role, x, y) => {
  if (color === "w") {
    switch (role) {
      case "p":
        renderPiece(whitePawn, x, y);
        break;
      case "r":
        renderPiece(whiteRook, x, y);
        break;
      case "n":
        renderPiece(whiteKnight, x, y);
        break;
      case "b":
        renderPiece(whiteBishop, x, y);
        break;
      case "q":
        renderPiece(whiteQueen, x, y);
        break;
      case "k":
        renderPiece(whiteKing, x, y);
        break;
    }
  } else {
    switch (role) {
      case "p":
        renderPiece(blackPawn, x, y);
        break;
      case "r":
        renderPiece(blackRook, x, y);
        break;
      case "n":
        renderPiece(blackKnight, x, y);
        break;
      case "b":
        renderPiece(blackBishop, x, y);
        break;
      case "q":
        renderPiece(blackQueen, x, y);
        break;
      case "k":
        renderPiece(blackKing, x, y);
        break;
    }
  }
};

const renderPiece = (img, x, y) => {
  img.width = squareSideLength * 0.9;
  img.height = squareSideLength * 0.9;
  image(
    img,
    x * squareSideLength + squareSideLength / 2,
    y * squareSideLength + squareSideLength / 2
  );
};

const move = async () => {
  try {
    gameState = await axios
      .post("http://localhost:5000/api/gameState", {
        from: "a2",
        to: "a4",
      })
      .then((response) => {
        // console.log(response);
        return response;
      });
  } catch (err) {
    console.log(err);
    return err;
  }
};

const highlightOnHover = (x, y) => {
  const SQUARE_X_START = x * squareSideLength;
  const SQUARE_X_END = x * squareSideLength + squareSideLength;
  const SQUARE_Y_START = y * squareSideLength;
  const SQUARE_Y_END = y * squareSideLength + squareSideLength;
  if (
    mouseX > SQUARE_X_START &&
    mouseX < SQUARE_X_END &&
    mouseY > SQUARE_Y_START &&
    mouseY < SQUARE_Y_END
  ) {
    // console.log("inside highlight function");
    fill("#8888FF");
    square(SQUARE_X_START, SQUARE_Y_START, squareSideLength);
    // console.log(x, y);
  }
};

const highlightOnClick = (x, y) => {
  const SQUARE_CLICKED =
    pressedX > x * squareSideLength &&
    pressedX < x * squareSideLength + squareSideLength &&
    pressedY > y * squareSideLength &&
    pressedY < y * squareSideLength + squareSideLength;
  //   console.log(pressedX, x, x + SQUARE_CLICKED, pressedY, y, y + SQUARE_CLICKED);
  //   push();

  if (SQUARE_CLICKED) {
    if (
      (userIsWhite && gameState[x][y].slice(0, 1) === "w") ||
      (!userIsWhite && gameState[x][y].slice(0, 1) === "b")
    ) {
      push();
      fill("#8822ff");
      square(x * squareSideLength, y * squareSideLength, squareSideLength);
      pop();
    }
  }
};

async function mousePressed() {
  pressedX = mouseX;
  pressedY = mouseY;
  if (
    pressedX > 0 &&
    pressedX < boardSideLength &&
    pressedY > 0 &&
    pressedY < boardSideLength
  ) {
    let x = floor(pressedX / squareSideLength);
    let y = floor(pressedY / squareSideLength);
    isUserPiece =
      (userIsWhite && gameState[x][y].slice(0, 1) === "w") ||
      (!userIsWhite && gameState[x][y].slice(0, 1) === "b");

    if (isUserPiece) {
      const response = await axios.get(
        `http://localhost:5000/api/moveset/gameState/${gameState}/piece/${gameState[x][y]}/userColorWhite/${userIsWhite}/x/${x}/y/${y}`
      );
      console.log(response.data);
    }
  }
}

/*
if mouse is pressed on a tile with a players piece present (need userIsWhite)
    if another piece is already highlighted (save square and available moves)
        remove previous piece, and cache it and its available moves

if mouse is pressed on a pieces available move 
    update gameState 
    render the move
    prompt the chat and await their move

*/
// takes in the x, y positions on the chessboard and
// converts the x to it's letter equivalent on the board
const parseSquare = (x, y) => {
  switch (x) {
    case 0:
      return "a" + y;
    case 1:
      return "b" + y;
    case 2:
      return "c" + y;
    case 3:
      return "d" + y;
    case 4:
      return "e" + y;
    case 5:
      return "f" + y;
    case 6:
      return "g" + y;
    case 7:
      return "h" + y;
  }
};
