const idAvistamiento = document.getElementById("detalle").dataset.id;
const formComentario = document.getElementById("form-comentario");

const validadorComentario = (nombre, texto) => {
  const validadorNombre = (nombre) => nombre && nombre.trim().length >= 3 && nombre.trim().length <= 50;
  const validadorTexto = (texto) => texto && texto.trim().length >= 5 && texto.trim().length <= 300;

  let errores = [];
  if (!validadorNombre(nombre)) {
    errores.push("Nombre (entre 3 y 50 caracteres)");
  }
  if (!validadorTexto(texto)) {
    errores.push("Comentario (entre 5 y 300 caracteres)");
  }

  return { errores: errores, isValid: errores.length === 0 };
};


const populateErrores = (errores) => {
  let cajaErrores = document.getElementById("comentario-errores");
  let listaErrores = document.getElementById("comentario-lista-errores");

  while (listaErrores.firstChild) {
    listaErrores.removeChild(listaErrores.firstChild);
  }

  for (error of errores) {
    let item = document.createElement("li");
    item.innerText = error;
    listaErrores.append(item);
  }
  cajaErrores.hidden = errores.length === 0;
};

const populateComentarios = (comentarios) => {
  let lista = document.getElementById("lista-comentarios");

  while (lista.firstChild) {
    lista.removeChild(lista.firstChild);
  }

  if (comentarios.length === 0) {
    let vacio = document.createElement("li");
    vacio.innerText = "Aún no hay comentarios.";
    lista.append(vacio);
    return;
  }

  for (comentario of comentarios) {
    let item = document.createElement("li");

    let cabecera = document.createElement("strong");
    cabecera.innerText = comentario["fecha"] + " - " + comentario["nombre"];

    let texto = document.createElement("p");
    texto.innerText = comentario["texto"];

    item.append(cabecera);
    item.append(texto);
    lista.append(item);
  }
};

const getComentarios = () => {
  fetch(`${window.origin}/get-comentarios/${idAvistamiento}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((ajaxResponse) => {
      populateComentarios(ajaxResponse["data"]);
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      populateErrores(["No se pudieron cargar los comentarios"]);
    });
};

const agregarComentario = () => {
  let nombre = formComentario["nombre"].value;
  let texto = formComentario["texto"].value;

  let { errores, isValid } = validadorComentario(nombre, texto);
  populateErrores(errores);
  if (!isValid) {
    return;
  }

  fetch(`${window.origin}/post-comentario`, {
    method: "POST",
    body: JSON.stringify({ avistamiento_id: idAvistamiento, nombre: nombre, texto: texto }),
    credentials: "include",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((ajaxResponse) => {
      if (ajaxResponse["status"] === "error") {
        populateErrores(ajaxResponse["data"]);
        return;
      }
      formComentario.reset();
      getComentarios();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      populateErrores(["No se pudo enviar el comentario"]);
    });
};

let submitComentarioBtn = document.getElementById("comentario-btn");
submitComentarioBtn.addEventListener("click", agregarComentario);

getComentarios();
