const MAX_LENGTH = 620;
function setup() {}
function draw() {
  drawBoard();
}

const drawBoard = () => {
  let pieces;
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

  for (let i = 0; i < squareSideLength; i++) {
    for (let j = 0; j < squareSideLength; j++) {
      let fillColor = (i + j) % 2 === 0 ? "#DDD" : "#333";

      fill(fillColor);
      square(squareSideLength * i, j * squareSideLength, squareSideLength);
    }
  }
};

const getPieces = async () => {};
