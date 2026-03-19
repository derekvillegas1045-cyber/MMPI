// --- CONFIGURACIÓN ---
const TOTAL_QUESTIONS = 567;

// --- ESTADO DE LA APLICACIÓN ---
let currentQuestion = 1;
let responses = []; // Aquí se guardan las respuestas

// --- ELEMENTOS DEL DOM ---
const questionDisplay = document.getElementById('question-display');
const btnContainer = document.getElementById('button-container');
const btnUndo = document.getElementById('btn-undo');
const menuBtn = document.getElementById('menu-btn');
const navMenu = document.getElementById('nav-menu');

// Botones de Opción
const btnV = document.getElementById('btn-v');
const btnF = document.getElementById('btn-f');
const btnNa = document.getElementById('btn-na');

// Botones del Menú
const btnDownloadXLSX = document.getElementById('download-xlsx');
const btnGenerateString = document.getElementById('generate-string');
const outputContainer = document.getElementById('output-string-container');
const outputTextarea = document.getElementById('output-string');

// --- LÓGICA PRINCIPAL ---

/**
 * Registra la respuesta y avanza a la siguiente pregunta.
 * @param {string} answer - El valor de la respuesta ('V', 'F', 'N/A')
 */
function registerAnswer(answer) {
    if (currentQuestion > TOTAL_QUESTIONS) return; // Ya terminó

    // Guarda la respuesta en el formato { Inciso: #, Respuesta: 'X' }
    responses.push({
        Inciso: currentQuestion,
        Respuesta: answer
    });

    // Avanza
    currentQuestion++;

    // Actualiza la pantalla
    updateUI();
}

/**
 * Deshace la última respuesta registrada.
 */
function undoLast() {
    if (currentQuestion <= 1) return; // No hay nada que deshacer

    // Quita la última respuesta del array
    responses.pop();

    // Retrocede el contador
    currentQuestion--;

    // Actualiza la pantalla
    updateUI();
}

/**
 * Actualiza la interfaz de usuario (número de pregunta y estado de botones).
 */
function updateUI() {
    // Actualiza el contador de pregunta
    if (currentQuestion <= TOTAL_QUESTIONS) {
        questionDisplay.textContent = `Pregunta ${currentQuestion} / ${TOTAL_QUESTIONS}`;
        // Asegura que los botones estén habilitados
        setAnswerButtonsEnabled(true);
    } else {
        // Test completado
        questionDisplay.textContent = `¡Test Completado! (${TOTAL_QUESTIONS} respuestas)`;
        // Deshabilita los botones de respuesta
        setAnswerButtonsEnabled(false);
    }
    
    // Habilita o deshabilita el botón "Deshacer"
    btnUndo.disabled = (currentQuestion <= 1);
}

/**
 * Habilita o deshabilita los 3 botones de respuesta.
 * @param {boolean} isEnabled - true para habilitar, false para deshabilitar.
 */
function setAnswerButtonsEnabled(isEnabled) {
    btnV.disabled = !isEnabled;
    btnF.disabled = !isEnabled;
    btnNa.disabled = !isEnabled;
    
    // Estilo visual para deshabilitado
    btnContainer.style.opacity = isEnabled ? 1 : 0.5;
    btnContainer.style.pointerEvents = isEnabled ? 'auto' : 'none';
}

/**
 * Muestra u oculta el menú lateral.
 */
function toggleMenu() {
    navMenu.classList.toggle('visible');
    // Reinicia el área de texto al cerrar
    if (!navMenu.classList.contains('visible')) {
        outputContainer.style.display = 'none';
    }
}

// --- LÓGICA DE EXPORTACIÓN ---

/**
 * Genera y descarga un archivo .xlsx con las respuestas.
 */
function generateXLSX() {
    if (responses.length === 0) {
        alert("Aún no hay respuestas para descargar.");
        return;
    }
    
    // 1. Crea una hoja de cálculo a partir de nuestro array de objetos
    const ws = XLSX.utils.json_to_sheet(responses);
    
    // 2. Crea un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // 3. Añade la hoja de cálculo al libro
    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
    
    // 4. Escribe y descarga el archivo
    XLSX.writeFile(wb, "respuestas_test.xlsx");
}

/**
 * Genera la cadena de texto para el script de Python.
 */
function generateString() {
    if (responses.length === 0) {
        alert("Aún no hay respuestas.");
        return;
    }

    // Mapea el array de objetos a un array de strings (ej. ['V', 'F', 'N/A'])
    const answerList = responses.map(r => r.Respuesta);
    
    // Une todo con comas
    const answerString = answerList.join(',');

    // Muestra el área de texto y pone la cadena ahí
    outputContainer.style.display = 'block';
    outputTextarea.value = answerString;
    
    // Selecciona el texto automáticamente para copiar fácil
    outputTextarea.select();
    outputTextarea.setSelectionRange(0, 99999); // Para móviles
    
    alert(`Se generó la cadena con ${answerList.length} respuestas. Ya puedes copiarla del menú.`);
}


// --- ASIGNACIÓN DE EVENTOS (Event Listeners) ---

// Clics en los botones de respuesta
btnV.addEventListener('click', () => registerAnswer('V'));
btnF.addEventListener('click', () => registerAnswer('F'));
btnNa.addEventListener('click', () => registerAnswer('N/A'));

// Clic en Deshacer
btnUndo.addEventListener('click', undoLast);

// Clic en Menú
menuBtn.addEventListener('click', toggleMenu);

// Clics en Opciones del Menú
btnDownloadXLSX.addEventListener('click', generateXLSX);
btnGenerateString.addEventListener('click', generateString);

// Inicializa la UI al cargar
updateUI();