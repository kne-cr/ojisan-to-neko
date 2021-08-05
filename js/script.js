(() => {
  let pieces = Array.from(document.getElementsByClassName("piece"));
  pieces.forEach(piece => {
    piece.addEventListener("dragstart", (event) => {
      console.log("dragstart");
      event.dataTransfer.setData('piece_id', event.target.id);
    });
    piece.addEventListener("drop", (event) => {
      event.preventDefault();
    });
  });
  let cells = Array.from(document.getElementsByClassName("board__cell"));
  cells.forEach(cell => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    cell.addEventListener("drop", (event) => {
      console.log("drop");
      console.log(event.target.closest(".board__cell"));
      event.target.closest(".board__cell").appendChild(document.getElementById(event.dataTransfer.getData('piece_id')));
      event.preventDefault();
    });
  });
})();