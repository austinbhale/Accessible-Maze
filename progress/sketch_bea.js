var cols, rows;
var w = 150; // width of each square
var grid = [];
var stack = [];
var current; // the player's current cell
var currCellLoc = 0;

var play = false;


// Setup(): line pixel weight. Even numbers only
var lineWeight = 6;

function setup() {
  createCanvas(900, 900);
  // frameRate(30);
  createNewMaze();
}

// draw() loops forever until stopped. Set fps with frameRate(30)
// function draw() {}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   createNewMaze();
// }

// Current cell goes back to the top left starting position.
function createNewMaze() {

  clear();
  grid = [];
  stack = [];
  currCellLoc = 0;

  // floor function makes sure that we are dealing with integers, no matter the canvas size
  cols = floor(width / w);
  rows = floor(height / w);

  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  // establish marker for current cell
  current = grid[currCellLoc];

  while (true) {
    for (var i = 0; i < grid.length; i++) {
      grid[i].show();
    }

    current.visited = true;
    var next = current.checkNeighbors();

    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }

    if (current == grid[0]) {
      console.log("maze created");
      current.highlightPlayer(0, 255, 0);
      break;
    }
  }

  // Draws a black border on the canvas
  strokeWeight(lineWeight);
  stroke(0);
  line(0, 0, 0, 900);
  line(0, 900, 900, 900);
  line(900, 900, 900, 0);
  line(900, 0, 0, 0);
}

// Global vars for audio
var track, audioContext, successSound, panner, originalPos;
function createSound() {
  // establish audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext;
  // get audio element
  successSound = document.querySelector('#success')
  failSound = document.querySelector("#fail")


  
  // pass track into audio context
  track = audioContext.createMediaElementSource(failSound)
  // connect track to context
  // track.connect(audioContext.destination);

  // listener for the specific context
  let listener = audioContext.listener;


  // set in the center of the screen
  const posX = window.innerWidth / 2;
  const posY = window.innerHeight / 2;
  const posZ = 300;
  originalPos = { x: posX, y: posY, z: posZ - 5 };

  // TODO: maybe find a way to attach it somehow?
  listener.forwardX.value = 0;
  listener.forwardY.value = 0;
  listener.upZ.value = 0;

  // situate the listener object
  listener.positionX.value = originalPos.x;
  listener.positionY.value = originalPos.y;
  listener.positionZ.value = originalPos.z;


  const pannerModel = 'HRTF';
  const innerCone = 60;
  const outerCone = 90;
  const outerGain = 0.3;
  const distanceModel = 'linear';
  const maxDistance = 10000;
  const refDistance = 1;
  const rollOff = 10;
  const positionX = posX;
  const positionY = posY;
  const positionZ = posZ;
  const orientationX = 0.0;
  const orientationY = 0.0;
  const orientationZ = -1.0;


  panner = new PannerNode(audioContext, {
    panningModel: pannerModel,
    distanceModel: distanceModel,
    positionX: positionX,
    positionY: positionY,
    positionZ: positionZ,
    orientationX: orientationX,
    orientationY: orientationY,
    orientationZ: orientationZ,
    refDistance: refDistance,
    maxDistance: maxDistance,
    rolloffFactor: rollOff,
    coneInnerAngle: innerCone,
    coneOuterAngle: outerCone,
    coneOuterGain: outerGain
  })
  // const pannerOptions = { pan: 0 };
  // const panner = new StereoPannerNode(audioContext, pannerOptions);  
}
// More key presses for p5js can be found at https://p5js.org/reference/#/p5/keyPressed
function keyPressed() {
  if (!play) return;
  track.connect(panner).connect(audioContext.destination);

  var next = undefined;
  // Reset panner position back to the center
  panner.positionX.value = originalPos.x;
  panner.positionY.value = originalPos.y;
  panner.positionZ.value = originalPos.z;

  if (keyCode == UP_ARROW) {
    console.log("up");
    if (!current.walls[0]) {
      console.log("SUCCESS!")
      currCellLoc -= cols;
      next = grid[currCellLoc];
      successSound.play()
    } else {
      console.log("hit a wall...")
      panner.positionY.value += 5000;
      failSound.play()
    }
  } else if (keyCode == RIGHT_ARROW) {
    console.log("right");
    if (!current.walls[1]) {
      console.log("SUCCESS!")
      currCellLoc += 1;
      next = grid[currCellLoc];
      successSound.play()
    } else {
      console.log("hit a wall...")
      panner.positionX.value += 5000;
      failSound.play()
    }
  } else if (keyCode == DOWN_ARROW) {
    console.log("down");
    if (!current.walls[2]) {
      console.log("SUCCESS!")
      currCellLoc += cols;
      next = grid[currCellLoc];
      successSound.play()
    } else {
      console.log("hit a wall...")
      panner.positionY.value -= 5000;
      failSound.play()
    }
  } else if (keyCode == LEFT_ARROW) {
    console.log("left");
    if (!current.walls[3]) {
      console.log("SUCCESS!")
      currCellLoc -= 1;
      next = grid[currCellLoc];
      successSound.play()
    } else {
      console.log("hit a wall...")
      panner.positionX.value -= 5000;
      failSound.play()
    }
  } else if (keyCode == ENTER) {
    console.log("enter");
    createNewMaze();
    // add sound

    next = undefined;
  }

  // place a new cell   
  if (next !== undefined) {
    // Erase so we're not drawing on top of a color
    erase();
    current.highlightPlayer(0, 0, 0, true);
    noErase();


    current.highlightPlayer(75, 156, 211, true);

    // Highlight the valid next position given by the user
    current = next;
    current.highlightPlayer(0, 255, 0, false);

  }

  // audioContext.close()
}



// Setup()
function index(i, j) {

  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  // Turns 2D space into a 1D array of cells
  return i + j * cols;
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true]; //top, right, bottom, left
  this.visited = false;

  // Setup(): Chooses wall positions based off cells already visited and randomization.
  this.checkNeighbors = function () {
    var neighbors = [];

    var top = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var bottom = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      var r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }
  }

  // Setup(): Creates lines to act as the walls of the maze.
  this.show = function () {
    var x = this.i * w;
    var y = this.j * w;

    strokeWeight(lineWeight);
    stroke(0);

    if (this.walls[0]) {
      line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      line(x + w, y + w, x, y + w);
    }
    if (this.walls[3]) {
      line(x, y + w, x, y);
    }

    if (this.visited) {
      // Erase before drawing over a cell color
      noStroke();
      erase();
      fill(0, 0, 0);
      rect(x + (lineWeight / 2), y + (lineWeight / 2), w, w);
      noErase();
      // Draw
      fill(75, 156, 211); // TarHeel blue background
      rect(x + (lineWeight / 2), y + (lineWeight / 2), w, w);
    }
  }

  // Specify an rgb value ranging from 0-255 for each
  this.highlightPlayer = function (r, g, b, erase) {
    var x = this.i * w;
    var y = this.j * w;
    noStroke();
    fill(r, g, b);
    (erase) ? rect(x + (w / 6), y + (w / 6), w / 1.5, w / 1.5) : rect(x + (w / 4), y + (w / 4), w / 2, w / 2);
  }
}

// Setup()
function removeWalls(a, b) {
  var x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }

  var y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}


document.documentElement.addEventListener(
  "mousedown", function () {
    if (window.Tone) {
      if (window.Tone.context.state !== 'running') {
        Tone.context.resume();
      }
    }
  })

document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    play = true;
    createSound();
    createNewMaze();
  }
}