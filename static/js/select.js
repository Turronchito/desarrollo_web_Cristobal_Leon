document.addEventListener('DOMContentLoaded', () => {
    const regionSelect = document.getElementById("region-select");
    const comunaSelect = document.getElementById("comuna-select");

    if (!regionSelect || !comunaSelect) return;
    fetch('/get_regiones')
        .then(res => res.json())
        .then(regiones => {
            regionSelect.innerHTML = '<option value="">Seleccione una Región</option>';
            regiones.forEach(reg => {
                const option = document.createElement("option");
                option.value = reg.id;
                option.textContent = reg.nombre;
                regionSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error al cargar regiones:", err));

    regionSelect.addEventListener("change", function() {
        const regionId = parseInt(this.value, 10);
        comunaSelect.innerHTML = '<option value="">Seleccione una Comuna</option>';

        if (regionId && !isNaN(regionId)) {
            fetch(`/get_comunas/${regionId}`)
                .then(res => res.json())
                .then(comunas => {
                    comunas.forEach(comuna => {
                        const option = document.createElement("option");
                        option.value = comuna.id;
                        option.textContent = comuna.nombre;
                        comunaSelect.appendChild(option);
                    });
                })
                .catch(err => console.error("Error al cargar comunas:", err));
        }
    });
});