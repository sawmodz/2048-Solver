import Direction from "./movement.js";
export default class Game {
  SIZE = 4;
  constructor(game) {
    if (game == undefined) {
      this.init();
    } else {
      this.seed = parseInt(game.seed);
      this.board = game.board.map((row) => [...row]);
      this.score = game.score;
    }
  }

  clone() {
    const newGame = new Game();
    newGame.board = this.board.map((row) => [...row]);
    newGame.seed = this.seed;
    newGame.score = this.score;
    return newGame;
  }

  getScore() {
    return this.score;
  }

  addScore(score) {
    this.score += score;
  }

  init() {
    this.board = new Array(this.SIZE)
      .fill(null)
      .map(() => new Array(this.SIZE).fill(0));

    this.seed = "31789";
    this.score = 0;
    this.spawnTile();
    this.spawnTile();
  }

  evaluateBoard() {
    let board = this.board;
    let freeSpaces = 0;
    let mergeableTiles = 0;
    let monotonicityScore = 0;
    let maxTile = 0;

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 0) freeSpaces++;
        if (cell > maxTile) maxTile = cell;
      });
    });

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length - 1; x++) {
        if (board[y][x] > 0 && board[y][x] <= board[y][x + 1]) {
          monotonicityScore += board[y][x];
        }
      }
    }

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (x < board.length - 1 && board[y][x] === board[y][x + 1]) {
          mergeableTiles += board[y][x];
        }
        if (y < board.length - 1 && board[y][x] === board[y + 1][x]) {
          mergeableTiles += board[y][x];
        }
      }
    }

    const freeSpacesWeight = 1.0;
    const mergeableTilesWeight = 1.0;
    const monotonicityWeight = 1.0;
    const maxTileWeight = 1.0;

    let score =
      freeSpaces * freeSpacesWeight +
      mergeableTiles * mergeableTilesWeight +
      monotonicityScore * monotonicityWeight +
      maxTile * maxTileWeight;

    return score;
  }

  canMove(direction) {
    if (this.wrongCommands === 10) return false;

    let backup = this.board.map((row) => [...row]);

    let scoreBeforeMove = this.score;
    this.move(direction);

    let changed = false;
    for (let y = 0; y < this.SIZE; y++) {
      for (let x = 0; x < this.SIZE; x++) {
        if (this.board[y][x] !== backup[y][x]) {
          changed = true;
          break;
        }
      }
      if (changed) break;
    }

    this.board = backup;
    this.score = scoreBeforeMove;

    return changed;
  }

  spawnTile() {
    let freeCell = this.getFreeCell();

    let spawnIndex = freeCell[Math.floor(this.seed % freeCell.length)];
    let value = (this.seed & 0x10) === 0 ? 2 : 4;

    this.board[spawnIndex % this.SIZE][Math.floor(spawnIndex / this.SIZE)] =
      value;

    this.seed = Math.floor((this.seed * this.seed) % 50515093);
  }

  getFreeCell() {
    let freeCell = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (this.board[x][y] == 0) freeCell.push(x + y * this.SIZE);
      }
    }
    return freeCell;
  }

  show() {
    const largestNum = Math.max(...this.board.flat());
    const cellWidth = largestNum.toString().length;

    console.clear();

    this.board.forEach((row) => {
      let rowString = row
        .map((cell) => {
          let cellString = cell === 0 ? "." : cell.toString();
          return cellString.padStart(cellWidth, " ");
        })
        .join(" | ");
      console.log(rowString);
      console.log("-".repeat(cellWidth * this.SIZE + (this.SIZE - 1) * 3));
    });
    console.log("Score : " + this.getScore());
  }

  setseed(seed) {
    this.seed = parseInt(seed);
  }

  move(direction) {
    let turnScore = 0;
    let merged = new Array(this.SIZE)
      .fill(null)
      .map(() => new Array(this.SIZE).fill(false));
    let dir = Direction[direction.toUpperCase()];
    let targetStart = [0, this.SIZE - 1, this.SIZE * (this.SIZE - 1), 0][dir];
    let targetStep = [1, this.SIZE, 1, this.SIZE][dir];
    let sourceStep = [this.SIZE, -1, -this.SIZE, 1][dir];

    for (let i = 0; i < this.SIZE; i++) {
      let finalTarget = targetStart + i * targetStep;
      for (let j = 1; j < this.SIZE; j++) {
        let source = finalTarget + j * sourceStep;
        let sourceX = source % this.SIZE;
        let sourceY = Math.floor(source / this.SIZE);
        if (this.get(sourceX, sourceY) === 0) continue;
        for (let k = j - 1; k >= 0; k--) {
          let intermediate = finalTarget + k * sourceStep;

          let intermediateX = intermediate % this.SIZE;
          let intermediateY = Math.floor(intermediate / this.SIZE);
          if (this.get(intermediateX, intermediateY) === 0) {
            this.set(intermediateX, intermediateY, this.get(sourceX, sourceY));
            this.set(sourceX, sourceY, 0);
            source = intermediate;
            sourceX = source % this.SIZE;
            sourceY = Math.floor(source / this.SIZE);
          } else {
            if (
              !merged[intermediateX][intermediateY] &&
              this.get(intermediateX, intermediateY) ===
                this.get(sourceX, sourceY)
            ) {
              this.set(sourceX, sourceY, 0);
              this.set(
                intermediateX,
                intermediateY,
                this.get(intermediateX, intermediateY) * 2
              );
              merged[intermediateX][intermediateY] = true;
              turnScore += this.get(intermediateX, intermediateY);
            }
            break;
          }
        }
      }
    }

    return turnScore;
  }

  hasLost() {
    if (this.getFreeCell().length > 0) {
      return false;
    }

    for (let y = 0; y < this.SIZE; y++) {
      for (let x = 0; x < this.SIZE; x++) {
        let tile = this.get(x, y);
        if (x < this.SIZE - 1 && tile === this.get(x + 1, y)) {
          return false;
        }
        if (y < this.SIZE - 1 && tile === this.get(x, y + 1)) {
          return false;
        }
      }
    }

    return true;
  }

  getValue(movement) {
    return Direction[movement.toUpperCase()];
  }

  set(x, y, value) {
    this.board[y][x] = value;
  }

  get(x, y) {
    return this.board[y][x];
  }
}
