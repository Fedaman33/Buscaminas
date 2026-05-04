// Importa la función que permite guardar la puntuación en localStorage
import { guardarPuntuacion } from "./score.js";


// Obtiene los parámetros enviados en la URL (puntos, dificultad, tiempo)
const params = new URLSearchParams(window.location.search);

// Extrae cada dato de la URL
const puntos = params.get("puntos");
const dificultad = params.get("dificultad");
const tiempo = params.get("tiempo");


// Rellena automáticamente los inputs del formulario con los datos recibidos
document.querySelector("#puntos").value = puntos;
document.querySelector("#dificultad").value = dificultad;
document.querySelector("#tiempo").value = tiempo;


// Listener que se ejecuta cuando el usuario envía el formulario
document.querySelector("#formPuntuacion").addEventListener("submit", (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página por defecto


    // Evita guardar si faltan datos esenciales de la partida ganada saliendo un mensaje de alerta.
    if (!puntos || !dificultad || !tiempo) {
        alert("❌ No puedes guardar porque faltan datos de la partida ganada.");
        return;
    }

    // Obtiene los valores introducidos por el usuario
    const nombre = document.querySelector("#nombre").value.trim();
    const correo = document.querySelector("#correo").value.trim();

    // Comprueba que los campos obligatorios no estén vacíos
    if (nombre === "" || correo === "") {
        alert("Rellena todos los campos");
        return;
    }

    // Crea un objeto con toda la información de la puntuación
    const puntuacion = {
        nombre,
        correo,
        puntos: Number(puntos), // Convierte los puntos a número
        dificultad,
        tiempo
    };

    // Guarda la puntuación en localStorage mediante la función importada
    guardarPuntuacion(puntuacion);

    // Confirma al usuario que se ha guardado correctamente
    alert("Puntuación guardada");

    // Redirige a la página donde se muestran todas las puntuaciones
    window.location.href = "puntuaciones.html";
});
