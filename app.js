// --- CONFIGURACIÓN ---
const TOTAL_QUESTIONS = 567;

// --- ESTADO DE LA APLICACIÓN ---
let currentQuestion = 1;
let responses = new Array(TOTAL_QUESTIONS).fill(null);
let answerHistory = []; // Para deshacer en orden exacto

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
const questionGrid = document.getElementById('question-grid');

// --- LÓGICA PRINCIPAL ---

/**
 * Registra la respuesta y avanza a la siguiente pregunta.
 * @param {string} answer - El valor de la respuesta ('V', 'F', 'N/A')
 */
function registerAnswer(answer) {
    if (currentQuestion < 1 || currentQuestion > TOTAL_QUESTIONS) return;

    const index = currentQuestion - 1;

    // Si esta pregunta nunca se respondió, guarda en historial para deshacer
    if (!responses[index]) {
        answerHistory.push(currentQuestion);
    }

    // Guarda o actualiza respuesta
    responses[index] = answer;

    // Avanza a la siguiente pregunta no contestada si existe
    let next = currentQuestion;
    while (++next <= TOTAL_QUESTIONS && responses[next - 1]) { }
    if (next <= TOTAL_QUESTIONS) {
        currentQuestion = next;
    } else {
        // si todas contestadas, coloca en fin
        currentQuestion = TOTAL_QUESTIONS + 1;
    }

    updateUI();
}

function undoLast() {
    if (answerHistory.length === 0) return;

    const lastQuestion = answerHistory.pop();
    responses[lastQuestion - 1] = null;
    currentQuestion = lastQuestion;
    updateUI();
}

function updateUI() {
    const answeredCount = responses.filter(r => r !== null).length;

    if (answeredCount >= TOTAL_QUESTIONS) {
        questionDisplay.textContent = `¡Test Completado! (${TOTAL_QUESTIONS} respuestas)`;
        setAnswerButtonsEnabled(false);
    } else {
        let displayQuestion = currentQuestion;
        if (displayQuestion > TOTAL_QUESTIONS) {
            displayQuestion = TOTAL_QUESTIONS;
        }

        const currentAnswer = responses[displayQuestion - 1];
        const answerText = currentAnswer ? ` - ${currentAnswer}` : '';
        questionDisplay.textContent = `Pregunta ${displayQuestion} / ${TOTAL_QUESTIONS}${answerText}`;
        setAnswerButtonsEnabled(true);
    }

    btnUndo.disabled = answerHistory.length === 0;
    renderQuestionGrid();
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

function renderQuestionGrid() {
    questionGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'question-chip';

        if (responses[i - 1]) chip.classList.add('answered');
        if (i === currentQuestion) chip.classList.add('current');

        chip.title = `Pregunta ${i}${responses[i - 1] ? `: ${responses[i - 1]}` : ''}`;

        chip.addEventListener('click', () => setCurrentQuestion(i));

        const label = document.createElement('span');
        label.textContent = i;
        chip.appendChild(label);
        questionGrid.appendChild(chip);
    }
}

function setCurrentQuestion(index) {
    if (index < 1 || index > TOTAL_QUESTIONS) return;
    currentQuestion = index;
    updateUI();
}

/**
 * Muestra u oculta el menú lateral.
 */
function toggleMenu() {
    navMenu.classList.toggle('visible');
}

// --- LÓGICA DE EXPORTACIÓN ---

/**
 * Genera y descarga un archivo .xlsx con las respuestas.
 */
function generateXLSX() {
    const answered = responses
        .map((r, i) => r ? { Inciso: i + 1, Respuesta: r } : null)
        .filter(Boolean);

    if (answered.length === 0) {
        alert("Aún no hay respuestas para descargar.");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(answered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Respuestas");
    XLSX.writeFile(wb, "respuestas_test.xlsx");
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

// Inicializa la UI al cargar
updateUI();
