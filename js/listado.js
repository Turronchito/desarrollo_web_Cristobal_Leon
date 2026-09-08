const datos = [
  { bname: "Cóndor", tipo: "Rapaz", time: "2026-09-01", place: "Andes" },
  { bname: "Loica", tipo: "Passeriforme", time: "2026-08-15", place: "Valle" },
  { bname: "Aguilucho", tipo: "Rapaz", time: "2026-07-10", place: "Maipo" },
  { bname: "Chucao", tipo: "Passeriforme", time: "2026-06-05", place: "Bosque" }
];

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

  document.getElementById("tabla").innerHTML = items.map(d => 
    `<tr><td>${d.bname}</td><td>${d.tipo}</td><td>${d.time}</td><td>${d.place}</td></tr>`
  ).join('');

  document.getElementById("p-info").innerText = `${pag} / ${maxPag}`;
}

document.getElementById("filtro").onchange = () => { pag = 1; render(); };
document.getElementById("orden").onchange = () => render();
document.getElementById("prev").onclick = () => { if (pag > 1) { pag--; render(); } };
document.getElementById("next").onclick = () => { pag++; render(); };

render();
