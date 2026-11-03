// las filas llegan desde la base de datos (escritas en el HTML por Flask); se leen como "datos"
const datos = Array.from(document.querySelectorAll("#tabla tr")).map(fila => ({
  id: fila.dataset.id,
  bname: fila.cells[0].textContent,
  tipo: fila.cells[1].textContent,
  time: fila.cells[2].textContent,
  place: fila.cells[3].textContent
}));

let pag = 1;
const porPag = 2;
function render() {
  const filtro = document.getElementById("filtro").value;
  const orden = document.getElementById("orden").value;

  let lista = datos
    .filter(d => !filtro || d.tipo === filtro)
    .sort((a, b) => a[orden].localeCompare(b[orden]));

  const maxPag = Math.ceil(lista.length / porPag) || 1;
  if (pag > maxPag) pag = maxPag;
  const items = lista.slice((pag - 1) * porPag, pag * porPag);

  // las filas se arman con textContent (no innerHTML) para que un texto con HTML no se ejecute
  const tabla = document.getElementById("tabla");
  tabla.textContent = "";
  for (const d of items) {
    let fila = document.createElement("tr");
    for (const texto of [d.bname, d.tipo, d.time, d.place]) {
      let celda = document.createElement("td");
      celda.textContent = texto;
      fila.appendChild(celda);
    }
    // clic sobre una fila: ver el detalle del avistamiento
    fila.onclick = () => { window.location.href = "/listado?id=" + d.id; };
    tabla.appendChild(fila);
  }

  document.getElementById("p-info").innerText = `${pag} / ${maxPag}`;
}

document.getElementById("filtro").onchange = () => { pag = 1; render(); };
document.getElementById("orden").onchange = () => render();
document.getElementById("prev").onclick = () => { if (pag > 1) { pag--; render(); } };
document.getElementById("next").onclick = () => { pag++; render(); };

render();