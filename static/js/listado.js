let pag = 1;
const porPag = 5;

function render() {
  const filtro = document.getElementById("filtro").value;
  const orden = document.getElementById("orden").value;

  let lista = (typeof datos !== 'undefined' ? datos : [])
    .filter(d => !filtro || d.tipo.toLowerCase() === filtro.toLowerCase())
    .sort((a, b) => (b[orden] || "").localeCompare(a[orden] || ""));

  const maxPag = Math.ceil(lista.length / porPag) || 1;
  if (pag > maxPag) pag = maxPag;
  if (pag < 1) pag = 1;

  const items = lista.slice((pag - 1) * porPag, pag * porPag);

  const tabla = document.getElementById("tabla");
  if (items.length === 0) {
    tabla.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay avistamientos registrados.</td></tr>';
  } else {
    tabla.innerHTML = items.map(d => 
      `<tr onclick="window.location.href='/avistamiento/${d.id}';">
         <td>${d.bname}</td>
         <td>${d.tipo}</td>
         <td>${d.time}</td>
         <td>${d.place}</td>
       </tr>`
    ).join('');
  }

  document.getElementById("p-info").innerText = `${pag} / ${maxPag}`;
}

document.getElementById("filtro").onchange = () => { pag = 1; render(); };
document.getElementById("orden").onchange = () => render();
document.getElementById("prev").onclick = () => { if (pag > 1) { pag--; render(); } };
document.getElementById("next").onclick = () => { pag++; render(); };

render();