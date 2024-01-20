const MAX_LENGTH = 620;
const SQUARES_PER_SIDE = 8;
let pieces;
let positions;
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
//   console.log(pieces.pieces.pawn);
    console.log(positions);
}
function draw() {
  drawBoard();
}

const drawBoard = () => {
  let parentElement = select("#chess-container");
  let boardSideLength = parentElement.width * 0.8;
  let squareSideLength;
  let board;
  if (boardSideLength > MAX_LENGTH) {
    board = createCanvas(MAX_LENGTH, MAX_LENGTH);
    squareSideLength = MAX_LENGTH / 8;
  } else {
    board = createCanvas(boardSideLength, boardSideLength);
    squareSideLength = boardSideLength / 8;
  }
  board.parent(parentElement);

  background("#EEE");

  for (let i = 0; i < SQUARES_PER_SIDE; i++) {
    for (let j = 0; j < SQUARES_PER_SIDE; j++) {
      let fillColor = (i + j) % 2 === 0 ? "#DDD" : "#333";

      fill(fillColor);
      square(squareSideLength * i, j * squareSideLength, squareSideLength);
    }
  }
  //   renderPiece();
};

const getPieces = async () => {
  const response = await fetch("./gameState.json");
  return response.json();
};

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

const renderPiece = () => {};
