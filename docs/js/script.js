(() => {
  const CANNOT_PLACE_MESSAGE = "空いている場所か小さな駒の上にしか置けません";
  const NOT_TURN_PLAYER_MESSAGE = "あなたの順番ではありません";
  const DRAW_MESSAGE = "ひきわけ";
  const WIN_MESSAGE = "の勝ち！";
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

    can_place(size) {
      if (!this.pieces.length) return true;
      return size > this.pieces[this.pieces.length - 1].size;
    }

    /**
     * 引数のプレイヤーの駒が置かれている場合trueを返す。
     */
    is_territory_of(player) {
      if (!this.pieces.length) return false;
      return this.pieces[this.pieces.length - 1].player == player;
    }
  }

  class Turn {
    constructor(player) {
      this.player = player;
    }

    /**
     * プレイヤーを交代する。
     */
    change() {
      this.player = this.player === 1 ? 2 : 1;
    }

    /**
     * 引数のプレイヤーのターンの場合trueを返す。
     */
    of_player(player) {
      return this.player == player;
    }
  }

  class Board {
    constructor() {
      this.turn = new Turn(1);
      this.cells = Array(3);
      for (let col = 0; col < this.cells.length; col++) {
        this.cells[col] = [];
        for (let row = 0; row < 3; row++) {
          this.cells[col][row] = new Cell();
        }
      }
    }

    can_place(x, y, size) {
      return this.cells[y][x].can_place(size);
    }

    place(x, y, player, size) {
      this.cells[y][x].pieces.push(new Piece(player, size));
      this.turn.change();
    }

    remove(x, y) {
      this.cells[y][x].pieces.pop();
    }

    complete_horizontal(player) {
      return [0,1,2].some(col => {
        return [0,1,2].every(row => {
          return this.cells[col][row].is_territory_of(player);
        });
      });
    }

    complete_vertical(player) {
      return [0,1,2].some(row => {
        return [0,1,2].every(col => {
          return this.cells[col][row].is_territory_of(player);
        });
      });
    }

    complete_diagonal(player) {
      if(
        this.cells[0][0].is_territory_of(player)
        && this.cells[1][1].is_territory_of(player)
        && this.cells[2][2].is_territory_of(player)
      ) return true;
      if(
        this.cells[0][2].is_territory_of(player)
        && this.cells[1][1].is_territory_of(player)
        && this.cells[2][0].is_territory_of(player)
      ) return true;

      return false;
    }

    /**
     * 引数のプレイヤーの駒が1列揃った場合trueを返す。
     */
    complete_player(player) {
      if(this.complete_vertical(player)) return true;
      if(this.complete_horizontal(player)) return true;
      if(this.complete_diagonal(player)) return true;

      return false;
    }

    judge_result = () => {
      if(this.complete_player(1)) {
        if(this.complete_player(2)) {
          return DRAW_MESSAGE;
        } else {
          return `おじさんたち${WIN_MESSAGE}`;
        }
      } else {
        if(this.complete_player(2)) {
          return `ネコたち${WIN_MESSAGE}`;
        } else {
          return "";
        }
      }
    }
  }

  const move_piece = (piece, to_cell) => {
    const from_cell = piece.closest(".board__cell");
    if(from_cell) {
      globalThis.board.remove(from_cell.dataset.x, from_cell.dataset.y);
    }
    globalThis.board.place(to_cell.dataset.x, to_cell.dataset.y, piece.dataset.player, piece.dataset.size);
  }

  const draw_display = (piece, to_cell) => {
    to_cell.appendChild(piece);
    Array.from(document.getElementsByClassName("player-pieces")).forEach(player => {
      player.classList.toggle("active");
      player.classList.toggle("inactive");
    });

    const result = globalThis.board.judge_result();
    if(result) {
      document.getElementById("result").innerHTML = result;
      document.getElementById("modal").style.display = "block";
    }
  }

  const follow_cursor =(event) => {
      const touch = event.changedTouches[0];
      event.target.style.position = "fixed";
      event.target.style.top = `${touch.pageY - window.pageYOffset}px`;
      event.target.style.left = `${touch.pageX - window.pageXOffset}px`;
  }

  const release_position = (target) => {
    target.style.position = "";
    target.style.top = "";
    target.style.left = "";
  }

  Array.from(document.getElementsByClassName("piece")).forEach(piece => {
    // PCのドラッグ
    piece.addEventListener("dragstart", (event) => {
      event.stopImmediatePropagation();
      if(!globalThis.board.turn.of_player(event.target.dataset.player)) {
        alert(NOT_TURN_PLAYER_MESSAGE);
        return;
      }

      event.dataTransfer.setData('piece_id', event.target.id);
    });

    piece.addEventListener("touchmove", (event) => {
      // デフォルトのイベントで画面が動いてしまうため停止
      event.preventDefault();

      follow_cursor(event);
    });

    // スマホのドロップ
    piece.addEventListener("touchend", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      release_position(event.target);
      if(!globalThis.board.turn.of_player(event.target.dataset.player)) {
        alert(NOT_TURN_PLAYER_MESSAGE);
        return;
      }

      const piece = event.target;
      const touch = event.changedTouches[0];
      const to_cell = document.elementFromPoint(
        touch.pageX - window.pageXOffset,
        touch.pageY - window.pageYOffset
      ).closest(".board__cell");

      if(!to_cell) return;
      if(!globalThis.board.can_place(to_cell.dataset.x, to_cell.dataset.y, piece.dataset.size)) {
        alert(CANNOT_PLACE_MESSAGE);
        return;
      }

      move_piece(piece, to_cell);
      draw_display(piece, to_cell);
    });

  });

  Array.from(document.getElementsByClassName("board__cell")).forEach(cell => {
    cell.addEventListener("dragover", (event) => {
      // デフォルトのイベントが動いてしまいドロップできないため停止
      event.preventDefault();
    });

    // PCのドロップ
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      const piece = document.getElementById(event.dataTransfer.getData('piece_id'));
      const to_cell = event.target.closest(".board__cell");
      if(!globalThis.board.can_place(to_cell.dataset.x, to_cell.dataset.y, piece.dataset.size)) {
        alert(CANNOT_PLACE_MESSAGE);
        return;
      }

      move_piece(piece, to_cell);
      draw_display(piece, to_cell);
    });
  });

  globalThis.board = new Board();
})();