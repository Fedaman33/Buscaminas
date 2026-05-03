// Crea una matriz con todas las celdas inicializadas a 0
export function crearMatriz(filas, columnas) {

  const matriz = []; // Matriz principal

  // Recorre cada fila
  for (let fila = 0; fila < filas; fila++) {

    const filaActual = []; // Crea una fila vacía

    // Rellena la fila con ceros
    for (let columna = 0; columna < columnas; columna++) {
      filaActual.push(0);
    }

    matriz.push(filaActual); // Añade la fila a la matriz
  }

  return matriz; // Devuelve la matriz completa
}



// Coloca minas (-1) en posiciones aleatorias sin repetir
export function colocarMinas(matriz, cantidadMinas) {

  let minasColocadas = 0; // Contador de minas ya colocadas

  while (minasColocadas < cantidadMinas) { // Bucle que continúa hasta que se hayan colocado todas las minas necesarias

    // Posición aleatoria dentro de la matriz
    const fila = Math.floor(Math.random() * matriz.length);
    const columna = Math.floor(Math.random() * matriz[0].length);

    // Solo coloca la mina si la celda no tenía una
    if (matriz[fila][columna] !== -1) {
      matriz[fila][columna] = -1;
      minasColocadas++;
    }
  }
}



// Cuenta cuántas minas hay alrededor de una celda
export function contarMinasVecinas(matriz, fila, columna) {

  let totalMinas = 0; // Contador de minas vecinas

  // Recorre las 8 posiciones alrededor
  for (let f = fila - 1; f <= fila + 1; f++) {
    for (let c = columna - 1; c <= columna + 1; c++) {

      // Evita contar la propia celda
      if (f === fila && c === columna) continue;

      // Comprueba que la posición está dentro de la matriz
      const dentroDeRango =
        f >= 0 &&
        f < matriz.length &&
        c >= 0 &&
        c < matriz[0].length;

      if (dentroDeRango) {
        if (matriz[f][c] === -1) {
          totalMinas++;
        }
      }
    }
  }

  return totalMinas; // Devuelve el total encontrado
}



// Asigna a cada celda el número de minas vecinas
export function calcularNumeros(matriz) {

  // Recorre toda la matriz
  for (let fila = 0; fila < matriz.length; fila++) {
    for (let columna = 0; columna < matriz[fila].length; columna++) {

      // Si no es una mina, calcula su número
      if (matriz[fila][columna] !== -1) {
        matriz[fila][columna] = contarMinasVecinas(matriz, fila, columna);
      }
    }
  }
}



// Genera el tablero HTML y asigna eventos a cada celda
export function crearTablero(filas, columnas, abrir, bandera) {

  const tbody = document.getElementById("tablero-body");

  tbody.innerHTML = ""; // Limpia el tablero anterior

  // Recorre cada fila
  for (let fila = 0; fila < filas; fila++) {

    const filaHTML = document.createElement("tr"); // Fila HTML

    // Recorre cada columna
    for (let columna = 0; columna < columnas; columna++) {

      const celda = document.createElement("td"); // Celda HTML

      celda.classList.add("celda", "oculta"); // Estado inicial

      // Clic izquierdo → abrir celda
      celda.addEventListener("click", () => abrir(fila, columna));

      // Guarda la posición en atributos data
      celda.dataset.fila = fila;
      celda.dataset.col = columna;

      // Clic derecho → poner o quitar bandera
      celda.addEventListener("contextmenu", (evento) => {
        evento.preventDefault();
        bandera(fila, columna);
      });

      filaHTML.appendChild(celda); // Añade la celda a la fila
    }

    tbody.appendChild(filaHTML); // Añade la fila al tablero
  }
}



    
  

