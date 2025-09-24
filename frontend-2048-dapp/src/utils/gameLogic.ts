// Game logic for 2048
export class Game2048 {
  private size: number = 4;
  private board: number[][];
  private score: number = 0;
  private maxTile: number = 0;
  private gameOver: boolean = false;
  private won: boolean = false;
  private milestones: Record<number, boolean>;

  constructor() {
    this.board = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(0));
    this.milestones = {
      2048: false,
      4096: false,
      8192: false,
    };
    this.addRandomTile();
    this.addRandomTile();
  }

  // Add a random tile (90% chance of 2, 10% chance of 4)
  addRandomTile(): void {
    const emptyCells: { row: number; col: number }[] = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.board[randomCell.row][randomCell.col] = value;
    }
  }

  // Move tiles left
  moveLeft(): boolean {
    let moved = false;
    for (let i = 0; i < this.size; i++) {
      const row = this.board[i].filter((cell) => cell !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          this.score += row[j];
          this.updateMaxTile(row[j]);
          row[j + 1] = 0;
        }
      }
      const newRow = row.filter((cell) => cell !== 0);
      while (newRow.length < this.size) {
        newRow.push(0);
      }

      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] !== newRow[j]) {
          moved = true;
        }
        this.board[i][j] = newRow[j];
      }
    }
    return moved;
  }

  // Move tiles right
  moveRight(): boolean {
    let moved = false;
    for (let i = 0; i < this.size; i++) {
      const row = this.board[i].filter((cell) => cell !== 0);
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          this.score += row[j];
          this.updateMaxTile(row[j]);
          row[j - 1] = 0;
        }
      }
      const newRow = row.filter((cell) => cell !== 0);
      while (newRow.length < this.size) {
        newRow.unshift(0);
      }

      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] !== newRow[j]) {
          moved = true;
        }
        this.board[i][j] = newRow[j];
      }
    }
    return moved;
  }

  // Move tiles up
  moveUp(): boolean {
    let moved = false;
    for (let j = 0; j < this.size; j++) {
      const column: number[] = [];
      for (let i = 0; i < this.size; i++) {
        if (this.board[i][j] !== 0) {
          column.push(this.board[i][j]);
        }
      }

      for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1]) {
          column[i] *= 2;
          this.score += column[i];
          this.updateMaxTile(column[i]);
          column[i + 1] = 0;
        }
      }

      const newColumn = column.filter((cell) => cell !== 0);
      while (newColumn.length < this.size) {
        newColumn.push(0);
      }

      for (let i = 0; i < this.size; i++) {
        if (this.board[i][j] !== newColumn[i]) {
          moved = true;
        }
        this.board[i][j] = newColumn[i];
      }
    }
    return moved;
  }

  // Move tiles down
  moveDown(): boolean {
    let moved = false;
    for (let j = 0; j < this.size; j++) {
      const column: number[] = [];
      for (let i = 0; i < this.size; i++) {
        if (this.board[i][j] !== 0) {
          column.push(this.board[i][j]);
        }
      }

      for (let i = column.length - 1; i > 0; i--) {
        if (column[i] === column[i - 1]) {
          column[i] *= 2;
          this.score += column[i];
          this.updateMaxTile(column[i]);
          column[i - 1] = 0;
        }
      }

      const newColumn = column.filter((cell) => cell !== 0);
      while (newColumn.length < this.size) {
        newColumn.unshift(0);
      }

      for (let i = 0; i < this.size; i++) {
        if (this.board[i][j] !== newColumn[i]) {
          moved = true;
        }
        this.board[i][j] = newColumn[i];
      }
    }
    return moved;
  }

  // Update max tile and check for milestones
  updateMaxTile(value: number): void {
    if (value > this.maxTile) {
      this.maxTile = value;

      // Check for milestone achievements
      if (value >= 2048 && !this.milestones[2048]) {
        this.milestones[2048] = true;
      }
      if (value >= 4096 && !this.milestones[4096]) {
        this.milestones[4096] = true;
      }
      if (value >= 8192 && !this.milestones[8192]) {
        this.milestones[8192] = true;
      }
    }
  }

  // Check if any moves are possible
  canMove(): boolean {
    // Check for empty cells
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) {
          return true;
        }
      }
    }

    // Check for possible merges
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const current = this.board[i][j];
        if (
          (i > 0 && this.board[i - 1][j] === current) ||
          (i < this.size - 1 && this.board[i + 1][j] === current) ||
          (j > 0 && this.board[i][j - 1] === current) ||
          (j < this.size - 1 && this.board[i][j + 1] === current)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // Make a move in the specified direction
  move(direction: string): boolean {
    if (this.gameOver) return false;

    let moved = false;
    switch (direction) {
      case "ArrowLeft":
        moved = this.moveLeft();
        break;
      case "ArrowRight":
        moved = this.moveRight();
        break;
      case "ArrowUp":
        moved = this.moveUp();
        break;
      case "ArrowDown":
        moved = this.moveDown();
        break;
      default:
        return false;
    }

    if (moved) {
      this.addRandomTile();
      if (!this.canMove()) {
        this.gameOver = true;
      }
    }

    return moved;
  }

  // Get current game state
  getState(): {
    board: number[][];
    score: number;
    maxTile: number;
    gameOver: boolean;
    won: boolean;
    milestones: Record<number, boolean>;
  } {
    return {
      board: this.board.map((row) => [...row]),
      score: this.score,
      maxTile: this.maxTile,
      gameOver: this.gameOver,
      won: this.won,
      milestones: { ...this.milestones },
    };
  }

  // Reset the game
  reset(): void {
    this.board = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(0));
    this.score = 0;
    this.maxTile = 0;
    this.gameOver = false;
    this.won = false;
    this.milestones = {
      2048: false,
      4096: false,
      8192: false,
    };
    this.addRandomTile();
    this.addRandomTile();
  }
}
