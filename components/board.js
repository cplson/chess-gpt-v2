const MAX_LENGTH = 620;
const SQUARES_PER_SIDE = 8;
const MAX_SIDE_LENGTH = MAX_LENGTH / SQUARES_PER_SIDE;
const STARTING_PIECE_COUNT = 32;
let boardSideLength, squareSideLength, isMaxLength, pieces, positions;
let blackPawn, blackRook, blackKnight, blackBishop, blackQueen, blackKing;
let whitePawn, whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing;
let gameState;
function preload() {
  // preload images
  blackPawn = loadImage("./assets/Chess_pdt45.svg");
  blackRook = loadImage("./assets/Chess_rdt45.svg");
  blackKnight = loadImage("./assets/Chess_ndt45.svg");
  blackBishop = loadImage("./assets/Chess_bdt45.svg");
  blackQueen = loadImage("./assets/Chess_qdt45.svg");
  blackKing = loadImage("./assets/Chess_kdt45.svg");
  whitePawn = loadImage("./assets/Chess_plt45.svg");
  whiteRook = loadImage("./assets/Chess_rlt45.svg");
  whiteKnight = loadImage("./assets/Chess_nlt45.svg");
  whiteBishop = loadImage("./assets/Chess_blt45.svg");
  whiteQueen = loadImage("./assets/Chess_qlt45.svg");
  whiteKing = loadImage("./assets/Chess_klt45.svg");
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
      square(squareSideLength * j, i * squareSideLength, squareSideLength);

      for (let k = 0; k < STARTING_PIECE_COUNT; k++) {
        if (positions[k][2] == parseSquare(j, i + 1)) {
          findPiece(positions[k][0], positions[k][1], j, i);
        }
      }
    }
  }
};

const getPieces = async () => {
  const response = await fetch("./gameState.json");
  return response.json();
};

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

const findPiece = (role, color, x, y) => {
  if (color === "white") {
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

  if (!isMaxLength) {
    image(
      img,
      x * squareSideLength + squareSideLength / 2,
      y * squareSideLength + squareSideLength / 2
    );
  } else {
    image(
      img,
      x * MAX_SIDE_LENGTH + MAX_SIDE_LENGTH / 2,
      y * MAX_SIDE_LENGTH + MAX_SIDE_LENGTH / 2
    );
  }
};

const move = async () => {
  try {
    gameState = await axios
      .post("http://localhost:5000/api/gameState", {
        from: "a2",
        to: "a4",
      })
      .then((response) => {
        console.log(response.status);
        return response.status;
      });
  } catch (err) {
    console.log(err);
    return err;
  }
};
