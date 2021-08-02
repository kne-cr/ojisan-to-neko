(() => {
  let pieces = Array.from(document.getElementsByClassName("piece"));
  pieces.forEach(piece => {
    piece.addEventListener("mousedown", (event) => {
      alert("mousedown");
    });
    // piece.addEventListener("mouseup", (event) => {
    //   alert("mouseup");
    // });
    // piece.addEventListener("dragstart", () => {
    //   return false;
    // });
  });
})();