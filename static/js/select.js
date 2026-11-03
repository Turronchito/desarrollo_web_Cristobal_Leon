// Las comunas vienen en el HTML (cada una con su data-region); se guardan y se
// muestran solo las de la región elegida
const regionSelect = document.getElementById("region-select");
const comunaSelect = document.getElementById("comuna-select");

const comunas = Array.from(comunaSelect.querySelectorAll("option[data-region]"));

const updateComunas = () => {
    comunaSelect.innerHTML = '<option value="">Seleccione una Comuna</option>';

    comunas.forEach(comuna => {
        if (comuna.dataset.region === regionSelect.value) {
            comunaSelect.appendChild(comuna);
        }
    });
};

regionSelect.addEventListener("change", updateComunas);
updateComunas();
