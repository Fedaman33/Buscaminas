// ===============================
//   SISTEMA DE PUNTUACIONES
// ===============================

// Clave usada en localStorage para guardar todas las puntuaciones del juego
const CLAVE = "buscaminas_puntuaciones";


// Guarda una nueva puntuación en localStorage
export function guardarPuntuacion(p) {
    const lista = obtenerPuntuaciones(); // Obtiene la lista actual de puntuaciones
    lista.push(p); // Añade la nueva puntuación al final
    localStorage.setItem(CLAVE, JSON.stringify(lista)); // Guarda la lista actualizada en localStorage
}


// Devuelve todas las puntuaciones guardadas en localStorage
export function obtenerPuntuaciones() {
    // Convierte el JSON almacenado en un array. Si no existe, devuelve un array vacío.
    return JSON.parse(localStorage.getItem(CLAVE)) || [];
}


// Elimina completamente todas las puntuaciones guardadas
export function borrarPuntuaciones() {
    localStorage.removeItem(CLAVE); // Borra la clave del almacenamiento
}


// ===============================
//   GENERAR TABLA 
// ===============================

export function generarTablaPuntuaciones() {
    const contenedor = document.querySelector("#contenedor-puntuaciones"); // Contenedor donde se insertará la tabla
    const lista = obtenerPuntuaciones(); // Lista de puntuaciones guardadas

    if (!contenedor) return; // Si no existe el contenedor, no hace nada

    // Si no hay puntuaciones, muestra un mensaje informativo
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <p class="text-center mt-4">No hay puntuaciones guardadas.</p>
        `;
        return;
    }

    // Ordena las puntuaciones de mayor a menor según los puntos
    lista.sort((a, b) => b.puntos - a.puntos);
    lista.splice(10); //Maximo de 10 lineas de clasificación

    // Estructura inicial de la tabla
    let html = `
        <h2 class="text-center mt-4"></h2>
        <table class="tabla-clasificacion">
            <thead>
                <tr>
                    <th>Posición</th>
                    <th>Jugador</th>
                    <th>Puntos</th>
                    <th>Dificultad</th>
                    <th>Tiempo</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Recorre cada puntuación y genera una fila en la tabla
    lista.forEach((p, i) => {
        const pos = i + 1; // Posición en la clasificación (1, 2, 3...)

        // Iconos para los tres primeros puestos
        let icono = "";
        if (pos === 1) icono = `<i class="bi bi-trophy-fill" style="color: gold;"></i>`;
        if (pos === 2) icono = `<i class="bi bi-trophy-fill" style="color: #C0C0C0;"></i>`;
        if (pos === 3) icono = `<i class="bi bi-trophy-fill" style="color: #D27D2D;"></i>`;

        // Fila de la tabla con los datos del jugador
        html += `
            <tr>
                <td>${icono} ${pos}</td>
                <td>${p.nombre}</td>
                <td>${p.puntos}</td>
                <td>${p.dificultad}</td>
                <td>${p.tiempo}s</td>
            </tr>
        `;
    });

    // Cierra la tabla
    html += `
            </tbody>
        </table>
    `;

    // Inserta la tabla completa en el contenedor
    contenedor.innerHTML = html;
}


// ===============================
//   ATAJO SECRETO PARA BORRAR TODO
// ===============================

// Detecta si el usuario pulsa Ctrl + Shift + X
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "X") {
        // Pide confirmación antes de borrar todas las puntuaciones
        if (confirm("¿Borrar TODA la clasificación?")) {
            borrarPuntuaciones(); // Borra todas las puntuaciones
            location.reload(); // Recarga la página para actualizar la tabla
        }
    }
});


// Si la URL actual contiene "puntuaciones.html", genera automáticamente la tabla
if (window.location.pathname.includes("puntuaciones.html")) {
    generarTablaPuntuaciones();
}
