(() => {
  class Piece {
    constructor(player, size) {
      this.player = player;
      this.size = size;
    }
  }

  class Cell {
    constructor() {
      this.pieces = [];
    }

    player() {
      if (!this.pieces.length) return 0;
      return this.pieces[this.pieces.length - 1].player;
    }

    size() {
      if (!this.pieces.length) return 0;
      return this.pieces[this.pieces.length - 1].size;
    }
  }

  class Board {
    constructor() {
      this.cells = Array(3);
      for (let col = 0; col < this.cells.length; col++) {
        this.cells[col] = [];
        for (let row = 0; row < 3; row++) {
          this.cells[col][row] = new Cell();
        }
      }
    }

    win_horizontal(player) {
      return [0,1,2].some(col => {
        return [0,1,2].every(row => {
          return this.cells[col][row].player() == player;
        });
      });
    }

    win_vertical(player) {
      return [0,1,2].some(row => {
        return [0,1,2].every(col => {
          return this.cells[col][row].player() == player;
        });
      });
    }

    win_diagonal(player) {
      if(
        this.cells[0][0].player() == player
        && this.cells[1][1].player() == player
        && this.cells[2][2].player() == player
      ) return true;
      if(
        this.cells[0][2].player() == player
        && this.cells[1][1].player() == player
        && this.cells[2][0].player() == player
      ) return true;

      return false;
    }

    win(player) {
      if(this.win_vertical(player)) return true;
      if(this.win_horizontal(player)) return true;
      if(this.win_diagonal(player)) return true;

      return false;
    }
  }

  const pieces = Array.from(document.getElementsByClassName("piece"));
  pieces.forEach(piece => {
    piece.addEventListener("dragstart", (event) => {
      console.log("dragstart");
      event.dataTransfer.setData('piece_id', event.target.id);
    });
  });

  const cells = Array.from(document.getElementsByClassName("board__cell"));
  cells.forEach(cell => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    cell.addEventListener("drop", (event) => {
      const piece = document.getElementById(event.dataTransfer.getData('piece_id'));
      const cell = event.target.closest(".board__cell");
      if(piece.dataset.size <= globalThis.board.cells[cell.dataset.y][cell.dataset.x].size()){
        alert("置けません");
        return;
      }
      cell.appendChild(piece);
      globalThis.board.cells[cell.dataset.y][cell.dataset.x].pieces.push(new Piece(piece.dataset.player, piece.dataset.size));
      if(globalThis.board.win(1)) {
        if(globalThis.board.win(2)) {
          document.getElementById("result").innerHTML = "draw";
        } else {
          document.getElementById("result").innerHTML = "win 1";
        }
      } else {
        if(globalThis.board.win(2)) {
          document.getElementById("result").innerHTML = "win 2";
        }
      }
      event.preventDefault();
    });
  });

  globalThis.board = new Board();
})();