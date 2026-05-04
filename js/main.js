// Importa las funciones necesarias desde board.js
// Estas funciones construyen el tablero y preparan la lógica interna del juego.
import {
  crearMatriz,
  colocarMinas,
  calcularNumeros,
  crearTablero
} from "./board.js";

// -----------------------------
// VARIABLES GLOBALES DEL JUEGO
// -----------------------------
let matrizJuego = [];      // Aquí se guarda la matriz completa del juego (minas y números)
let partidaActiva = false; // Indica si la partida está en curso o ya terminó
let tiempo = 0;            // Contador de tiempo en segundos
let temporizador = null;   // Referencia al intervalo del temporizador
let dificultadActual = "facil"; // Dificultad seleccionada (por defecto: fácil)
let minasRestantes = 0;    // Contador de minas que quedan por marcar con banderas


// -----------------------------------------
// CONFIGURACIÓN DE LAS DIFICULTADES DEL JUEGO
// -----------------------------------------

// Cada dificultad define:
// - número de filas, número de columnas, número de minas, título que se mostrará en pantalla, clase CSS para definir el título

const dificultades = {
  facil: { filas: 8, columnas: 8, minas: 10, titulo: "😄 Fácil 😄", clase: "titulo-facil" },
  medio: { filas: 12, columnas: 12, minas: 25, titulo: "😐 Medio 😐", clase: "titulo-medio" },
  dificil: { filas: 16, columnas: 16, minas: 40, titulo: "😵 Difícil 😵", clase: "titulo-dificil" }
};

// -----------------------------------------
// Función que cambia la carita del juego según el estado actual 
// -----------------------------------------
function actualizarCarita(estado) {
  const carita = document.querySelector("#carita"); // Seleccionamos el elemento HTML donde se muestra la carita
  if (!carita) return; // Si no existe el elemento, salimos de la función

// Cambia la carita según el estado recibido:
  if (estado === "pensando") carita.textContent = "🤔"; // "pensando" → carita neutral mientras se juega
  if (estado === "perdido") carita.textContent = "💀"; // "perdido" → carita de calavera cuando explota una mina
  if (estado === "ganado") carita.textContent = "😎"; // "ganado" → carita con gafas de sol cuando el jugador gana
}

// -----------------------------------------
// Función principal que se ejecuta cada vez que empieza una nueva partida
// -----------------------------------------
function iniciarJuego() {
  partidaActiva = true; // Activa la partida: permite abrir celdas y poner banderas

  actualizarCarita("pensando"); // Cambia la carita al estado "pensando" (🤔) esto indica que la partida está en curso
  reiniciarReloj(); // Reinicia el contador de tiempo a 0
  iniciarTemporizador();   // Inicia el temporizador que va sumando cada segundo.

  const config = dificultades[dificultadActual];   // Obtiene la configuración de la dificultad actual (filas, columnas, minas…)
  minasRestantes = config.minas; // Establece el número de minas restantes según la dificultad

  matrizJuego = crearMatriz(config.filas, config.columnas);   // Crea la matriz vacía del tablero según filas y columnas
  colocarMinas(matrizJuego, config.minas); // Coloca las minas aleatoriamente dentro de la matriz
  calcularNumeros(matrizJuego);   // Calcula los números alrededor de cada mina

  // Genera el tablero, usa las filas y columnas, usa abrirCelda para clic izquierdo, usa alternarBandera para clic derecho
  crearTablero(config.filas, config.columnas, abrirCelda, alternarBandera);

  actualizarContadorMinas();  // Actualiza el contador de minas en pantalla
  actualizarTituloPartida(); // Actualiza el título de la partida (Fácil, Medio, Difícil)
}

// -----------------------------------------
// Función que se ejecuta cuando el jugador hace clic en una mina
// -----------------------------------------
function perder() {
  partidaActiva = false;// La partida deja de estar activa, ya no se pueden abrir celdas, ni poner banderas
  detenerTemporizador(); // Detiene el temporizador para que el tiempo final quede congelado.

  mostrarTodoElTablero(); // Revela TODO el tablero, muestra todas las minas,los números,las celdas vacías

  actualizarCarita("perdido"); // Cambia la carita a la de "perdido" (💀)
  alert("💀 Has perdido la partida 💀"); // Muestra un mensaje emergente indicando que el jugador ha perdido
}

// -----------------------------------------
// Función que se ejecuta cuando el jugador hace clic izquierdo en una celda
// -----------------------------------------
function abrirCelda(fila, columna) {
  if (!partidaActiva) return; // Si la partida ya terminó (ganado o perdido), no se puede abrir nada

  const celda = obtenerCeldaDOM(fila, columna); // Obtenemos el elemento HTML correspondiente a la celda clicada
  if (!celda) return; // Si por algún motivo no existe la celda, sale

  if (celda.classList.contains("descubierta")) return; // Si la celda ya está descubierta, no hace nada
  if (celda.classList.contains("bandera")) return;   // Si la celda tiene una bandera, tampoco se puede abrir

  const valor = matrizJuego[fila][columna]; // Obtenemos el valor real de la celda en la matriz, -1 = mina, 0 = vacío, 1-8 = número de minas alrededor
  
  celda.classList.remove("oculta"); // Quitamos la clase oculta
  celda.classList.add("descubierta"); // marcamos la celda como descubierta

// Si el valor de la celda es -1 mostrara la mina explotada visualmente
  if (valor === -1) { 
    celda.classList.add("mina-explota");
    perder(); // Ejecuta la lógica de perder
    return; // no segue ejecutando nada más
  }

// Si el valor de la celda es del 1 al 8 
  if (valor > 0) {
    celda.classList.add(`n${valor}`); // Añade la clase CSS correspondiente (n1, n2, n3...)

 //La celda es un 0 abre las celdas de alrededor 
  } else { // Recorre las 8 celdas vecinas
    for (let f = fila - 1; f <= fila + 1; f++) {
      for (let c = columna - 1; c <= columna + 1; c++) {
        if (f === fila && c === columna) continue; // Salta la celda actual

// Comprueba que la celda vecina está dentro del tablero
        if (
            f >= 0 && f < matrizJuego.length &&
            c >= 0 && c < matrizJuego[0].length) {
          abrirCelda(f, c); // Abre la celda vecina
        }
      }
    }
  }
  // Comprueba si el jugador es ganador
  if (comprobarVictoria()) {
    partidaActiva = false; // Para la partida
    detenerTemporizador(); // Detiene el temporizador
    actualizarCarita("ganado"); // Muestra carita de ganador 😎
    mostrarTodasLasMinas(); // Muestra todas las minas

    const puntos = Math.max(0, 5000 - tiempo * 10); // Calcula los puntos según el tiempo

    // Esperar 5 segundos antes del mensaje
    setTimeout(() => {
        alert("🎉 ¡Has ganado! 🎉"); // Mensaje al ganar

        // Redirige después del mensaje, a la pagina para guadar la puntuación
        window.location.href = `salvar.html?puntos=${puntos}&dificultad=${dificultadActual}&tiempo=${tiempo}`;
    }, 5000);
}
}

// -----------------------------------------
// Función que se ejecuta cuando el jugador gana la partida (no descubre ninguna mina)
// -----------------------------------------
function comprobarVictoria() {
  if (!partidaActiva) return false; // Si la partida ya no está activa, no se puede ganar

  // Indicadores para las dos condiciones de victoria:
  let todasDescubiertas = true; // Todas las casillas sin mina están descubiertas
  let todasMinasMarcadas = true; // Todas las minas están correctamente marcadas con bandera
// Recorre toda la matriz del juego
  for (let f = 0; f < matrizJuego.length; f++) {
    for (let c = 0; c < matrizJuego[f].length; c++) {
// Obtenemos la celda del DOM y su valor en la matriz
      const celda = obtenerCeldaDOM(f, c);
      const valor = matrizJuego[f][c];

      // Todas las casillas sin mina deben estar descubiertas, si la celda NO es mina y NO está descubierta, aún no se ha ganado
      if (valor !== -1 && !celda.classList.contains("descubierta")) {
        todasDescubiertas = false;
      }
      // Todas las minas deben estar marcadas con bandera, si la celda es mina y NO tiene bandera, aún no se ha ganado por banderas
      if (valor === -1 && !celda.classList.contains("bandera")) {
        todasMinasMarcadas = false;
      }
    }
  }
// Se gana si, todas las casillas sin mina están descubiertas, o todas las minas están marcadas con bandera
  return todasDescubiertas || todasMinasMarcadas;
}

// -----------------------------------------
// Función que se ejecuta mostrando todo el tablero
// -----------------------------------------
  function mostrarTodoElTablero() {
    // Recorre toda la matriz del juego
    for (let f = 0; f < matrizJuego.length; f++) {
    for (let c = 0; c < matrizJuego[f].length; c++) {
      // Obtenemos la celda del DOM y el valor en la matriz
      const celda = obtenerCeldaDOM(f, c);
      const valor = matrizJuego[f][c];

      if (!celda) continue; // Si por algún motivo la celda no existe en el DOM, pasamos a la siguiente
      // Quita la clase que oculta la celda y la marca como descubierta
        celda.classList.remove("oculta");
        celda.classList.add("descubierta");

      // Si NO es mina, quita bandera para que no se mezcle con el número
      if (valor !== -1) {
        celda.classList.remove("bandera");
      }

      if (valor === -1) {
    if (!celda.classList.contains("mina-explota")) { // Si la celda es una mina pero NO es la mina que explotó,
      celda.classList.add("mina"); // saldrá la clase de mina normal
    }
  }   
      else if (valor > 0) { // Añade la clase correspondiente al número (n1, n2, ..., n8) para mostrar los numeros.
      celda.classList.add(`n${valor}`);  // Las casillas con valor 0 quedan simplemente descubiertas sin número
      }  
      
    }
    }
  }

// -----------------------------------------
// Función que se ejecuta mostrando todas las minas del tablero
// -----------------------------------------

function mostrarTodasLasMinas() {
  // Recorre toda la matriz del juego
  for (let f = 0; f < matrizJuego.length; f++) {
    for (let c = 0; c < matrizJuego[f].length; c++) {

      // Si el valor de la matriz es -1, significa que esta celda contiene una mina
      if (matrizJuego[f][c] === -1) {
        const celda = obtenerCeldaDOM(f, c); // Obtenemos la celda del DOM y el valor en la matriz
        // Si la celda existe, procedera a mostrarla
        if (celda) {
          celda.classList.remove("mina-explota"); // Asegura que no se muestre como mina explotada (solo ocurre al perder)
          celda.classList.remove("oculta"); // Quita la clase que la mantiene oculta
          celda.classList.add("mina"); // Añade la clase de mina normal (imagen de mina sin explotar)
          celda.classList.remove("bandera"); // Quita bandera
        }
      }
    }
  }
}
// -----------------------------------------
// Función que se ejecuta alternando bandera
// -----------------------------------------

function alternarBandera(fila, columna) {
  if (!partidaActiva) return; // Si la partida no está activa, no se permite poner o quitar banderas

  const celda = obtenerCeldaDOM(fila, columna);   // Obtenemos la celda del DOM correspondiente a la posición indicada
  if (!celda) return; // Si no existe, sale
  if (celda.classList.contains("descubierta")) return; // No se puede poner bandera en una celda ya descubierta

  if (celda.classList.contains("bandera")) { 
    celda.classList.remove("bandera"); // Si ya tiene bandera se quita
    minasRestantes++; // Al quitar bandera, aumentan las minas restantes por marcar
  } else {
    celda.classList.add("bandera"); // Si no tiene bandera la podemos poner
    minasRestantes--; // Al poner bandera, disminuyen las minas restantes
  }

  actualizarContadorMinas(); // Actualizamos el contador visual de minas restantes
}
 
 
function obtenerCeldaDOM(fila, columna) { // Busca en el DOM una celda que tenga la clase celda y data-fila="fila" y data-col="columna"
  return document.querySelector(`.celda[data-fila="${fila}"][data-col="${columna}"]`);
} // Esto permite localizar rápidamente la celda correspondiente a una posición de la matriz del juego.

function actualizarReloj() { // Selecciona el elemento del DOM donde se muestra el tiempo
  const reloj = document.querySelector("#reloj");
  if (reloj) reloj.textContent = tiempo; // Si existe, actualizamos su contenido con el valor actual de 'tiempo'(que se incrementa desde el temporizador principal del juego)
}

function iniciarTemporizador() { // Antes de iniciar un nuevo temporizador, nos aseguramos de detener cualquier temporizador previo para evitar múltiples intervalos activos.
  detenerTemporizador();
  temporizador = setInterval(() => { // Crea un intervalo que se ejecuta cada 1000 ms (1 segundo)
    tiempo++; // Incrementa el contador de tiempo de la partida
    actualizarReloj(); // Actualiza el reloj en pantalla con el nuevo valor
  }, 1000);
}
   

function detenerTemporizador() {
  if (temporizador !== null) { // Si existe un temporizador activo (no esta vacio)
    clearInterval(temporizador); // Detiene el intervalo
    temporizador = null;         // Lo marca como inactivo
  }
}

function reiniciarReloj() {
  tiempo = 0; // Reinicia el contador de tiempo a 0
  actualizarReloj(); // Actualiza el reloj en pantalla para reflejar el nuevo valor
}

function actualizarContadorMinas() {
  const contador = document.querySelector("#minas"); // Selecciona el elemento del DOM donde se muestra el contador de minas
  if (contador) contador.textContent = minasRestantes; // Si existe, actualiza su contenido con el valor actual de minasRestantes
}

function actualizarTituloPartida() {
  const titulo = document.querySelector("#tituloPartida"); // Selecciona el elemento del DOM donde se mostrará el título de la partida
  const config = dificultades[dificultadActual]; // Obtiene la configuración asociada a la dificultad actual (incluye el texto del título y la clase CSS)

  if (titulo) { // Si el elemento existe, actualiza su contenido y su clase
    titulo.textContent = config.titulo; // Texto visible (Ej: "Fácil", "Medio", "Difícil")
    titulo.className = config.clase; // Clase CSS para aplicar color/estilo
  }
}

function configurarMenuDificultad() { 
  
  const botones = document.querySelectorAll("[data-difficulty]"); // Selecciona todos los elementos del menú que tengan el atributo data-difficulty, (estos son los botones/enlaces que permiten cambiar la dificultad del juego)
  botones.forEach((boton) => { // Recorre cada botón y le asigna un listener de clic a cada dificultad
    boton.addEventListener("click", (e) => {
      e.preventDefault(); // Evita que el enlace recargue la página
      dificultadActual = boton.dataset.difficulty; // Guarda la dificultad seleccionada (fácil, medio, difícil)
      iniciarJuego(); // Reinicia completamente el juego con la nueva dificultad
    });
  });
}

function configurarBotonReinicio() {
  const carita = document.querySelector("#carita"); // Selecciona el elemento que actúa como botón de reinicio (la carita)
  if (carita) {   // Si existe, le añade un listener para reiniciar la partida
    carita.addEventListener("click", () => iniciarJuego());
  }
}

configurarMenuDificultad(); // Configura los botones del menú para cambiar la dificultad
configurarBotonReinicio(); // Configura el botón de reinicio (la carita)
iniciarJuego(); // Inicia el juego por primera vez al cargar la página
