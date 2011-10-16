// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//
// Various characteristics for the look of the game.
//

var width = 50;
var height = 23;

var pixelSize = 5;
var borderSize = 0;
var cellStyle = "purple";
var borderStyle = "rgb(100, 100, 100)";

// Checks that expected conditions are met (to check for coding mistakes).
function assert(expression) {
  if (!expression) {
    throw new Exception("Failed assert.");
  }
}

//
// Board
//

// Representation of the current state of the board.
function Board(width, height) {
  this.cells = new Array(width);
  for (var x = 0; x < this.cells.length; x++) {
    this.cells[x] = new Array(height);
  }
}

// Empty the board.
Board.prototype.clear = function() {
  for (var x = 0; x < this.cells.length; x++) {
    for (var y = 0; y < this.cells[x].length; y++) {
      this.cells[x][y] = 0;
    }
  }
}

Board.prototype.width = function() {
  return this.cells.length;
}

Board.prototype.height = function() {
  if (this.cells.length == 0)
    return 0;
  return this.cells[0].length;
}

Board.prototype.validateCoordinates = function(x, y) {
  assert(x >= 0);
  assert(x < this.width());
  assert(y >= 0);
  assert(y < this.height());
}

// How many cells are filled in around the given point?
Board.prototype.neighbors = function(x, y) {
  this.validateCoordinates(x, y);

  var surroundingCellCount = 0;

  // Contrain the coordinates to be on the board.
  var xStart = Math.max(0, x - 1);
  var xEnd = Math.min(this.width() - 1, x + 1);
  var yStart = Math.max(0, y - 1);
  var yEnd = Math.min(this.height() - 1, y + 1);

  // Go through all of the neighbors and check whcih are filled in.
  for (var xIndex = xStart; xIndex <= xEnd; xIndex++) {
    for (var yIndex = yStart; yIndex <= yEnd; yIndex++) {

      // Don't count the current cell when determining the
      // number of neighbors.
      if (xIndex == x && yIndex == y) {
        continue;
      }

      // Found one.
      if (this.cells[xIndex][yIndex] == 1) {
        surroundingCellCount++;
      }
    }
  }

  return surroundingCellCount;
}

// Get what the next state should be for this location based
// on its current state and how many neighbors it has.
Board.prototype.nextState = function(x, y) {
  this.validateCoordinates(x, y);

  var surroundingCellCount = this.neighbors(x, y);

  // Is the cell filled?
  if (this.cells[x][y] == 1) {
    switch (surroundingCellCount) {
      case 2:
      case 3:
	// Stay filled if there are 2 or 3 neighbors.
        return 1;

      default:
	// Otherwise empty it.
        return 0;
    }
  }
  // Else the cell is empty.

  // When there are 3 surrounding cells, create a new one.
  if (surroundingCellCount == 3) {
    return 1;
  }

  // Otherwise the cell remains empty.
  return 0;
}

// Returns the state for the given position.
Board.prototype.state = function(x, y) {
  this.validateCoordinates(x, y);
  return this.cells[x][y];
}

// Sets the state for the given position.
Board.prototype.setState = function(x, y, state) {
  this.validateCoordinates(x, y);
  assert(state == 0 || state == 1);

  this.cells[x][y] = state;
}

//
// GameOfLife
//

// Represents the overall game.
function GameOfLife(width, height, drawingContext) {
  this.drawingContext = drawingContext;
  this.currentBoard = new Board(width, height);
  this.clear();
}

GameOfLife.prototype.clear = function() {
  // Clear the state of the board.
  this.currentBoard.clear();

  // Clear the entire drawing surface.
  this.drawingContext.clearRect(0, 0, 
				this.currentBoard.width() * (pixelSize + borderSize) + borderSize, 
				this.currentBoard.height() * (pixelSize + borderSize) + borderSize);


  // Draw the vertical lines.
  for (var x = 0; x <= this.currentBoard.width(); x++) {
    var xPixel = x * (pixelSize + borderSize);
    var yPixel = 0;
    var widthPixel = borderSize;
    var heightPixel = this.currentBoard.height() * (pixelSize + borderSize) + borderSize;
    this.drawingContext.fillStyle = borderStyle;
    this.drawingContext.fillRect(xPixel, yPixel, widthPixel, heightPixel);
  }

  // Draw the horizontal lines.
  for (var y = 0; y <= this.currentBoard.height(); y++) {
    var xPixel = 0;
    var yPixel = y * (pixelSize + borderSize);
    var widthPixel = this.currentBoard.width() * (pixelSize + borderSize) + borderSize;
    var heightPixel = borderSize;
    this.drawingContext.fillStyle = borderStyle;
    this.drawingContext.fillRect(xPixel, yPixel, widthPixel, heightPixel);
  }
}

// Changes the display for a given position.
GameOfLife.prototype.changeDisplayState = function(x, y, nextState) {
  assert(nextState == 0 || nextState == 1);
  this.currentBoard.validateCoordinates(x, y);

  var xPixel = x * (pixelSize + borderSize) + borderSize;
  var yPixel = y * (pixelSize + borderSize) + borderSize;
  var widthPixel = pixelSize;
  var heightPixel = pixelSize;

  switch (nextState) {
    case 0:
      this.drawingContext.clearRect(xPixel, yPixel, widthPixel, heightPixel);
      break;

    case 1:
      this.drawingContext.fillStyle = cellStyle;
      this.drawingContext.fillRect(xPixel, yPixel, widthPixel, heightPixel);
      break;
  }
}

// Changes both the array and the display to the next state.
GameOfLife.prototype.transitionToNextState = function() {
  var nextBoard = new Board(this.currentBoard.width(), this.currentBoard.height());

  // Compute the next state.
  for (var x = 0; x < this.currentBoard.width(); x++) {
    for (var y = 0; y < this.currentBoard.height(); y++) {
      var nextState = this.currentBoard.nextState(x, y);
      nextBoard.setState(x, y, nextState);
    }
  }

  // Draw the next state.
  for (var x = 0; x < this.currentBoard.width(); x++) {
    for (var y = 0; y < this.currentBoard.height(); y++) {
       var nextState = nextBoard.state(x, y);
       this.changeDisplayState(x, y, nextState);
    }
  }

  // The next board is now the current board.
  this.currentBoard = nextBoard;
}

// Returns the current state of the given cell.
GameOfLife.prototype.cellState = function(x, y) {
  return this.currentBoard.state(x, y);
}

// Sets the state for the cell (both on the display and in the array).
GameOfLife.prototype.setCellState = function(x, y, state) {
  this.currentBoard.setState(x, y, state);
  this.changeDisplayState(x, y, state);
}

//
// Initialization.
//

// Get the drawing surface.
var gameCanvas = document.getElementById("gameCanvas");
if (!gameCanvas || !gameCanvas.getContext) {
  var errorMessage = document.createElement("b");
  errorMessage.innerHTML = "<i>Your browser isn't supported. Please use <a href='http://www.google.com/chrome/'>Google Chrome</a>, Internet Explorer 9,  Firefox, or Safari.</i><p><p><p>";
  document.body.insertBefore(errorMessage, document.body.firstChild);
}

gameCanvas.height = height * (pixelSize + borderSize) + borderSize;
gameCanvas.width = width * (pixelSize + borderSize) + borderSize;

// Create the game logic.
var game = new GameOfLife(width, height, gameCanvas.getContext("2d"));

//
// User interaction handling.
//

// Allow the user to start and stop the game as well as advance just one step.
var intervalId = null;

// start conway
start_conway = function() {
  if (intervalId != null) {
    return;
  }
  intervalId = setInterval(
      function() {
	game.transitionToNextState()
      }, 100);
}

// create a glider gun
glidergun = function() {
  var gliderAtOrigin = [
    [1, 5, 1], [1, 6, 1], 
    [2, 5, 1], [2, 6, 1], 
    [11, 5, 1], [11,6,1], [11,7,1], 
    [12,4,1], [12,8,1], 
    [13,3,1], [13,9,1], 
    [14,3,1], [14,9,1],
    [15,6,1],
    [16,4,1], [16,8,1],
    [17,5,1], [17,6,1], [17,7,1],
    [18,6,1],
    [21,3,1], [21,4,1], [21,5,1],
    [22,3,1], [22,4,1], [22,5,1],
    [23,2,1], [23,6,1],
    [25,1,1], [25,2,1], [25,6,1], [25,7,1],
    [35,3,1], [35,4,1],
    [36,3,1], [36,4,1]];
  for (var i = 0; i < gliderAtOrigin.length; i++) {
    game.setCellState(gliderAtOrigin[i][0], gliderAtOrigin[i][1], gliderAtOrigin[i][2]);
  }
}

// Allow the user to fill and unfill cells.
gameCanvas.onclick = function(event) {
  var xOffsetInCanvas = event.pageX - gameCanvas.offsetLeft;
  var yOffsetInCanvas = event.pageY - gameCanvas.offsetTop;
  xCell = Math.floor(xOffsetInCanvas / (pixelSize + borderSize));
  // Contrain the coordinate to be within the grid. (Handles clicks on the outmost border).
  if (xCell >= width) {
    xCell = width;
  }

  yCell = Math.floor(yOffsetInCanvas / (pixelSize + borderSize));
  // Contrain the coordinate to be within the grid. (Handles clicks on the outmost border).
  if (yCell >= height) {
    yCell = height;
  }
  game.setCellState(xCell, yCell, 1 - game.cellState(xCell, yCell));
}
