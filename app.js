// Application State
let currentSection = 'accessScreen';
let currentUser = null;
let selectedPatientId = null;
let patients = []; // CORRECCIÓN: Inicializar sin datos de ejemplo
let currentExerciseTimer = null;
let timerInterval = null;
let currentProtocol = 'KLEINERT';

// Application Data
const appData = {
    accessPassword: "0911",
    affiliation_types: ["CONTRIBUTIVO", "SUBSIDIADO", "BENEFICIARIO", "AFILIADO"],
    etiology_types: ["CORTOPUNZANTE", "CORTOCONTUNDENTE", "APLASTAMIENTO", "EXPLOSIVO", "CIZALLANTE", "COMBINADO"],
    trauma_mechanisms: ["ABIERTO", "CERRADO"],
    associated_injuries: ["NERVIOSO", "ÓSEO", "VASCULAR", "MUSCULAR", "LIGAMENTARIA", "CÁPSULA ARTICULAR"],
    repair_types: ["CENTRAL", "EPITENDINOSA", "MIXTA"],
    protocols: ["KLEINERT", "DURAN", "ACTIVE MOTION"],
    follow_up_weeks: [1, 3, 6, 12],
    quickdash_questions: [
        "Abrir un frasco apretado o nuevo",
        "Hacer trabajos caseros pesados (limpiar paredes y pisos)",
        "Cargar una bolsa de compras o un maletín",
        "Lavarse la espalda",
        "Usar un cuchillo para cortar comida",
        "Actividades recreacionales que requieren algo de fuerza",
        "¿Hasta qué punto su problema de brazo, hombro o mano interfirió con sus actividades sociales normales?",
        "¿Hasta qué punto se sintió limitado en su trabajo?",
        "Hormigueo en brazo, hombro o mano",
        "¿Cuánta dificultad tuvo para dormir?",
        "Me siento menos capaz, menos seguro o menos útil"
    ],
    tam_normal_values: {
        thumb: 160,
        index: 260,
        middle: 260,
        ring: 260,
        little: 260
    },
    // PROTOCOLO KLEINERT CORREGIDO Y DETALLADO
    exercise_protocols: {
        KLEINERT: {
            objective: "Lograr movilidad precoz controlada del tendón reparado sin comprometer la sutura",
            mechanism: "Se coloca un arnés en la muñeca o antebrazo, con gomas elásticas fijadas a las uñas, que mantienen los dedos en flexión pasiva; el paciente realiza extensión activa hasta la férula dorsal",
            advantages: ["Reduce adherencias", "Estimula cicatrización intrínseca", "Mejora el rango final de movimiento"],
            disadvantages: ["Requiere supervisión estricta", "Riesgo de ruptura si hay falta de adherencia al protocolo", "Contracturas en flexión si se prolonga"],
            phase_1: {
                timeframe: "0 - 3 días (Postoperatorio inmediato)",
                interventions: [
                    "Inmovilización con férula dorsal protectora",
                    "Muñeca 30° flexión, MCF 70° flexión, IP en extensión", 
                    "Colocación de bandas elásticas desde uñas hasta el arnés"
                ],
                observations: "Mantiene reparación protegida, se inicia movilidad temprana bajo supervisión",
                exercises: [
                    {
                        name: "Reposo Protegido",
                        description: "Mantener la férula dorsal en posición correcta con bandas elásticas colocadas",
                        duration: 0,
                        repetitions: "N/A",
                        frequency: "24 horas"
                    }
                ]
            },
            phase_2: {
                timeframe: "Día 3 - Semana 4", 
                interventions: [
                    "Flexión pasiva con bandas elásticas",
                    "Extensión activa de los dedos hasta la férula", 
                    "10 repeticiones cada hora, guiadas"
                ],
                observations: "Los elásticos limitan la extensión para proteger la sutura",
                exercises: [
                    {
                        name: "Flexión Pasiva con Elásticos",
                        description: "Permita que las bandas elásticas flexionen suavemente los dedos hacia la palma",
                        duration: 30,
                        repetitions: 10,
                        frequency: "Cada hora despierto"
                    },
                    {
                        name: "Extensión Activa Controlada", 
                        description: "Extienda los dedos activamente hasta el límite de la férula dorsal, las gomas controlan el movimiento",
                        duration: 45,
                        repetitions: 10, 
                        frequency: "Cada hora despierto"
                    }
                ]
            },
            phase_3: {
                timeframe: "Semana 4 - Semana 6",
                interventions: [
                    "Se retiran gradualmente los elásticos",
                    "Se inicia flexión activa asistida dentro de rango suave"
                ],
                observations: "Evitar fuerza o resistencia. Progresar según control del dolor y cicatriz",
                exercises: [
                    {
                        name: "Flexión Activa Asistida",
                        description: "Doble los dedos suavemente con ayuda de la otra mano, sin forzar el movimiento",
                        duration: 60,
                        repetitions: 15,
                        frequency: "3 veces al día"
                    },
                    {
                        name: "Deslizamiento Tendinoso Suave",
                        description: "Movimientos lentos de flexión-extensión dentro del rango cómodo",
                        duration: 45,
                        repetitions: 10,
                        frequency: "2 veces al día"
                    }
                ]
            },
            phase_4: {
                timeframe: "Semana 6 - Semana 8",
                interventions: [
                    "Flexión activa completa",
                    "Ejercicios de puño suave, rodillos o esponja",
                    "Extensión activa completa"
                ],
                observations: "Aumentar progresivamente el rango de movimiento",
                exercises: [
                    {
                        name: "Flexión Activa Completa",
                        description: "Cierre el puño completamente de forma activa, sin resistencia externa",
                        duration: 60,
                        repetitions: 20,
                        frequency: "3 veces al día"
                    },
                    {
                        name: "Ejercicios con Esponja",
                        description: "Apriete suavemente una esponja o pelota blanda",
                        duration: 120,
                        repetitions: 15,
                        frequency: "2 veces al día"
                    }
                ]
            },
            phase_5: {
                timeframe: "Semana 8 - Semana 12",
                interventions: [
                    "Ejercicios de fortalecimiento progresivo",
                    "Trabajo funcional (pinza, prensión)"
                ],
                observations: "Riesgo de ruptura disminuye, se busca función práctica",
                exercises: [
                    {
                        name: "Fortalecimiento Progresivo",
                        description: "Ejercicios con resistencia gradual usando bandas elásticas o pesas ligeras",
                        duration: 180,
                        repetitions: 12,
                        frequency: "2 veces al día"
                    },
                    {
                        name: "Actividades Funcionales",
                        description: "Practicar actividades diarias como escribir, abotonarse, usar cubiertos",
                        duration: 300,
                        repetitions: "Según actividad",
                        frequency: "Varias veces al día"
                    }
                ]
            },
            phase_6: {
                timeframe: "> 12 semanas",
                interventions: [
                    "Retorno progresivo a actividades laborales y deportivas"
                ],
                observations: "El tendón alcanza mayor resistencia tensil",
                exercises: [
                    {
                        name: "Actividades Laborales",
                        description: "Retorno gradual a las actividades laborales específicas según ocupación",
                        duration: 0,
                        repetitions: "Según actividad",
                        frequency: "Progresivo"
                    }
                ]
            }
        },
        DURAN: {
            phase_1: {
                timeframe: "Semana 1-2",
                exercises: [
                    {
                        name: "Movimiento Pasivo PIP",
                        description: "Mueva pasivamente la articulación PIP dentro del rango de la férula",
                        duration: 30,
                        repetitions: 10,
                        frequency: "Cada 2 horas"
                    },
                    {
                        name: "Movimiento Pasivo DIP",
                        description: "Mueva pasivamente la articulación DIP suavemente",
                        duration: 30,
                        repetitions: 10,
                        frequency: "Cada 2 horas"
                    }
                ]
            }
        },
        "ACTIVE_MOTION": {
            phase_1: {
                timeframe: "Semana 1-2",
                exercises: [
                    {
                        name: "Flexión Activa Controlada",
                        description: "Flexión activa del dedo hasta la base del dedo índice",
                        duration: 60,
                        repetitions: 10,
                        frequency: "3-5 veces al día"
                    }
                ]
            }
        }
    },
    fingers: [
        { number: 1, name: "Pulgar" },
        { number: 2, name: "Índice" },
        { number: 3, name: "Medio" },
        { number: 4, name: "Anular" },
        { number: 5, name: "Meñique" }
    ],
    jointTypes: ["MCF", "IFP", "IFD", "Déficit Ext"]
};

// Data persistence functions (using memory since localStorage not available)
let memoryStorage = {};

function savePatients() {
    try {
        memoryStorage['flexorTendonPatients'] = JSON.stringify(patients);
        console.log('Pacientes guardados en memoria');
    } catch (error) {
        console.error('Error guardando pacientes:', error);
        showAlert('Error guardando datos', 'error');
    }
}

function loadPatients() {
    try {
        const savedPatients = memoryStorage['flexorTendonPatients'];
        if (savedPatients) {
            patients = JSON.parse(savedPatients);
            console.log('Pacientes cargados:', patients.length);
        }
    } catch (error) {
        console.error('Error cargando pacientes:', error);
        patients = [];
    }
}

// Navigation functions
function showSection(sectionId) {
    console.log('Navegando a sección:', sectionId);
    
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        console.log('Sección activada:', sectionId);
        
        // Initialize section-specific content
        if (sectionId === 'patientSection') {
            showProtocol(currentProtocol);
        } else if (sectionId === 'dashboard') {
            updateDashboard();
        }
    } else {
        console.error('Sección no encontrada:', sectionId);
    }
}

// Authentication functions
function handleDoctorLogin(event) {
    event.preventDefault();
    console.log('Procesando login de médico...');
    
    const doctorId = document.getElementById('doctorId').value.trim();
    const doctorName = document.getElementById('doctorName').value.trim();
    const password = document.getElementById('doctorPassword').value.trim();
    
    console.log('Datos de login:', { doctorId, doctorName, password: '***' });
    
    if (!doctorId || !doctorName || !password) {
        showAlert('Todos los campos son requeridos', 'error');
        return false;
    }
    
    if (password !== appData.accessPassword) {
        showAlert('Contraseña incorrecta', 'error');
        return false;
    }
    
    currentUser = {
        id: doctorId,
        name: doctorName,
        loginTime: new Date().toISOString()
    };
    
    console.log('Usuario autenticado:', currentUser);
    updateDoctorInfo();
    showSection('dashboard');
    showAlert('Sesión iniciada correctamente', 'success');
    
    return false;
}

function updateDoctorInfo() {
    const doctorInfo = document.getElementById('doctorInfo');
    if (doctorInfo && currentUser) {
        doctorInfo.innerHTML = `
            <strong>Dr(a). ${currentUser.name}</strong> - Cédula: ${currentUser.id} - Sesión iniciada: ${formatDateTime(currentUser.loginTime)}
        `;
    }
}

function logout() {
    currentUser = null;
    const loginForm = document.getElementById('doctorLoginForm');
    if (loginForm) {
        loginForm.reset();
    }
    showSection('accessScreen');
    showAlert('Sesión cerrada correctamente', 'info');
}

// Patient section functions
function showProtocol(protocolName) {
    currentProtocol = protocolName;
    console.log('Mostrando protocolo:', protocolName);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === protocolName) {
            btn.classList.add('active');
        }
    });
    
    // Display protocol content
    const content = document.getElementById('protocolContent');
    if (!content) return;
    
    const protocol = appData.exercise_protocols[protocolName];
    if (!protocol) return;
    
    let html = '';
    
    if (protocolName === 'KLEINERT') {
        // Mostrar información detallada del protocolo Kleinert
        html += `
            <div class="protocol-info">
                <div style="background-color: var(--color-bg-1); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-24);">
                    <h4><strong>PROTOCOLO DE KLEINERT</strong></h4>
                    <p><strong>Objetivo:</strong> ${protocol.objective}</p>
                    <p><strong>Mecanismo:</strong> ${protocol.mechanism}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-16); margin-top: var(--space-16);">
                        <div>
                            <p><strong>Ventajas:</strong></p>
                            <ul style="margin: 0; padding-left: var(--space-20);">
                                ${protocol.advantages.map(advantage => `<li>${advantage}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <p><strong>Desventajas:</strong></p>
                            <ul style="margin: 0; padding-left: var(--space-20);">
                                ${protocol.disadvantages.map(disadvantage => `<li>${disadvantage}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <h4 style="color: var(--color-primary); text-align: center; margin-bottom: var(--space-24);">FASES DEL TRATAMIENTO</h4>
            </div>
        `;
        
        // Mostrar todas las fases del protocolo Kleinert
        Object.keys(protocol).forEach(phaseKey => {
            if (phaseKey.startsWith('phase_')) {
                const phase = protocol[phaseKey];
                html += `
                    <div class="protocol-week" style="border: 1px solid var(--color-border); border-radius: var(--radius-base); padding: var(--space-16); margin-bottom: var(--space-20);">
                        <h4 style="color: var(--color-primary); margin-bottom: var(--space-12);">${phase.timeframe}</h4>
                        
                        <div style="background-color: var(--color-bg-2); padding: var(--space-12); border-radius: var(--radius-sm); margin-bottom: var(--space-16);">
                            <h5 style="margin-bottom: var(--space-8);">Intervenciones:</h5>
                            <ul style="margin: 0; padding-left: var(--space-20);">
                                ${phase.interventions.map(intervention => `<li>${intervention}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background-color: var(--color-bg-3); padding: var(--space-12); border-radius: var(--radius-sm); margin-bottom: var(--space-16);">
                            <h5 style="margin-bottom: var(--space-8);">Observaciones:</h5>
                            <p style="margin: 0;">${phase.observations}</p>
                        </div>
                        
                        <div class="exercise-list">
                            <h5 style="color: var(--color-primary); margin-bottom: var(--space-12);">Ejercicios:</h5>
                            ${phase.exercises.map(exercise => `
                                <div class="exercise-item">
                                    <div class="exercise-header">
                                        <span class="exercise-name">${exercise.name}</span>
                                        ${exercise.duration > 0 ? `<button class="btn btn--sm btn--primary" onclick="startExercise('${exercise.name}', '${exercise.description}', ${exercise.duration})">Iniciar Ejercicio</button>` : ''}
                                    </div>
                                    <div class="exercise-description">${exercise.description}</div>
                                    <div class="exercise-details">
                                        ${exercise.duration > 0 ? `<span><strong>Duración:</strong> ${exercise.duration}s</span>` : ''}
                                        <span><strong>Repeticiones:</strong> ${exercise.repetitions}</span>
                                        <span><strong>Frecuencia:</strong> ${exercise.frequency}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
    } else {
        // Mostrar protocolos DURAN y ACTIVE MOTION de forma simplificada
        Object.keys(protocol).forEach(phaseKey => {
            if (phaseKey.startsWith('phase_')) {
                const phase = protocol[phaseKey];
                html += `
                    <div class="protocol-week">
                        <h4>${phase.timeframe}</h4>
                        <div class="exercise-list">
                            ${phase.exercises.map(exercise => `
                                <div class="exercise-item">
                                    <div class="exercise-header">
                                        <span class="exercise-name">${exercise.name}</span>
                                        <button class="btn btn--sm btn--primary" onclick="startExercise('${exercise.name}', '${exercise.description}', ${exercise.duration})">
                                            Iniciar Ejercicio
                                        </button>
                                    </div>
                                    <div class="exercise-description">${exercise.description}</div>
                                    <div class="exercise-details">
                                        <span><strong>Duración:</strong> ${exercise.duration}s</span>
                                        <span><strong>Repeticiones:</strong> ${exercise.repetitions}</span>
                                        <span><strong>Frecuencia:</strong> ${exercise.frequency}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
    }
    
    content.innerHTML = html;
}

function startExercise(name, description, duration) {
    console.log('Iniciando ejercicio:', name);
    const modal = document.getElementById('exerciseTimerModal');
    const title = document.getElementById('exerciseTitle');
    const desc = document.getElementById('exerciseDescription');
    
    if (modal && title && desc) {
        title.textContent = name;
        desc.textContent = description;
        
        currentExerciseTimer = {
            duration: duration,
            remaining: duration,
            isRunning: false
        };
        
        updateTimerDisplay();
        modal.classList.remove('hidden');
    }
}

function startTimer() {
    if (!currentExerciseTimer) return;
    
    console.log('Iniciando temporizador');
    currentExerciseTimer.isRunning = true;
    document.getElementById('timerStartBtn').classList.add('hidden');
    document.getElementById('timerPauseBtn').classList.remove('hidden');
    document.getElementById('timerCircle').classList.add('active');
    
    timerInterval = setInterval(() => {
        currentExerciseTimer.remaining--;
        updateTimerDisplay();
        
        if (currentExerciseTimer.remaining <= 0) {
            finishTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!currentExerciseTimer) return;
    
    console.log('Pausando temporizador');
    currentExerciseTimer.isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('timerStartBtn').classList.remove('hidden');
    document.getElementById('timerPauseBtn').classList.add('hidden');
    document.getElementById('timerCircle').classList.remove('active');
}

function resetTimer() {
    if (!currentExerciseTimer) return;
    
    console.log('Reiniciando temporizador');
    pauseTimer();
    currentExerciseTimer.remaining = currentExerciseTimer.duration;
    updateTimerDisplay();
}

function finishTimer() {
    pauseTimer();
    showAlert('¡Ejercicio completado!', 'success');
    closeExerciseModal();
}

function updateTimerDisplay() {
    const timerText = document.getElementById('timerText');
    if (timerText && currentExerciseTimer) {
        const minutes = Math.floor(currentExerciseTimer.remaining / 60);
        const seconds = currentExerciseTimer.remaining % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseTimerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    currentExerciseTimer = null;
}

// Dashboard functions
function updateDashboard() {
    const totalPatients = patients.length;
    const pendingControls = calculatePendingControls();
    const incompletePatients = calculateIncompletePatients();
    
    const totalElement = document.getElementById('totalPacientes');
    const pendingElement = document.getElementById('controlesPendientes');
    const incompleteElement = document.getElementById('pacientesIncompletos');
    
    if (totalElement) totalElement.textContent = totalPatients;
    if (pendingElement) pendingElement.textContent = pendingControls;
    if (incompleteElement) incompleteElement.textContent = incompletePatients;
}

function calculatePendingControls() {
    let pending = 0;
    const today = new Date();
    
    patients.forEach(patient => {
        if (patient.initial_data && patient.initial_data.surgery_date) {
            const surgeryDate = new Date(patient.initial_data.surgery_date);
            const weeksPassedSinceSurgery = Math.floor((today - surgeryDate) / (7 * 24 * 60 * 60 * 1000));
            
            appData.follow_up_weeks.forEach(week => {
                if (weeksPassedSinceSurgery >= week) {
                    const hasFollowUp = patient.follow_ups && patient.follow_ups.some(fu => fu.week === week);
                    if (!hasFollowUp) {
                        pending++;
                    }
                }
            });
        }
    });
    
    return pending;
}

function calculateIncompletePatients() {
    let incomplete = 0;
    const today = new Date();
    
    patients.forEach(patient => {
        if (patient.initial_data && patient.initial_data.surgery_date) {
            const surgeryDate = new Date(patient.initial_data.surgery_date);
            const weeksPassedSinceSurgery = Math.floor((today - surgeryDate) / (7 * 24 * 60 * 60 * 1000));
            
            if (weeksPassedSinceSurgery >= 12) {
                const hasAllFollowUps = appData.follow_up_weeks.every(week => {
                    return patient.follow_ups && patient.follow_ups.some(fu => fu.week === week);
                });
                
                if (!hasAllFollowUps) {
                    incomplete++;
                }
            } else {
                const hasMissingControls = appData.follow_up_weeks.some(week => {
                    if (weeksPassedSinceSurgery >= week) {
                        return !(patient.follow_ups && patient.follow_ups.some(fu => fu.week === week));
                    }
                    return false;
                });
                
                if (hasMissingControls) {
                    incomplete++;
                }
            }
        }
    });
    
    return incomplete;
}

// Search functions
function searchPatients() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput || !resultsContainer) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<div class="no-results"><p>Ingrese un término de búsqueda</p></div>';
        return;
    }
    
    const results = patients.filter(patient => 
        patient.identification.full_name.toLowerCase().includes(searchTerm) ||
        patient.identification.document_number.includes(searchTerm)
    );
    
    displaySearchResults(results, resultsContainer);
}

function searchPatientsForFollowUp() {
    const searchInput = document.getElementById('followUpSearch');
    const resultsContainer = document.getElementById('followUpSearchResults');
    
    if (!searchInput || !resultsContainer) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<div class="no-results"><p>Ingrese un término de búsqueda</p></div>';
        return;
    }
    
    const results = patients.filter(patient => 
        patient.identification.full_name.toLowerCase().includes(searchTerm) ||
        patient.identification.document_number.includes(searchTerm)
    );
    
    displayFollowUpSearchResults(results, resultsContainer);
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results"><p>No se encontraron pacientes</p></div>';
        return;
    }
    
    container.innerHTML = results.map(patient => `
        <div class="search-result-item" onclick="showPatientHistory('${patient.id}')">
            <h4>${patient.identification.full_name}</h4>
            <p><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</p>
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zone || 'No especificada'}</p>
            <p><strong>Fecha de ingreso:</strong> ${formatDate(patient.identification.admission_date)}</p>
        </div>
    `).join('');
}

function displayFollowUpSearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results"><p>No se encontraron pacientes</p></div>';
        return;
    }
    
    container.innerHTML = results.map(patient => `
        <div class="search-result-item" onclick="selectPatientForFollowUp('${patient.id}')">
            <h4>${patient.identification.full_name}</h4>
            <p><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</p>
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zone || 'No especificada'}</p>
            <p><strong>Cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}</p>
        </div>
    `).join('');
}

// Patient management functions
function selectPatientForFollowUp(patientId) {
    selectedPatientId = patientId;
    const patient = patients.find(p => p.id === patientId);
    
    if (patient) {
        const nameElement = document.getElementById('selectedPatientName');
        const formElement = document.getElementById('followUpForm');
        const selectionElement = document.getElementById('patientSelection');
        
        if (nameElement) nameElement.textContent = patient.identification.full_name;
        if (formElement) formElement.classList.remove('hidden');
        if (selectionElement) selectionElement.style.display = 'none';
        
        const weekSelect = document.getElementById('followUpWeek');
        if (weekSelect) {
            weekSelect.value = '';
            weekSelect.focus();
        }
        clearFollowUpForm();
        generateGoniometryGrid();
        generateQuickDashQuestions();
    }
}

function showPatientHistory(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    displayPatientHistory(patient);
    showSection('patientHistory');
}

function displayPatientHistory(patient) {
    const container = document.getElementById('historyContent');
    if (!container) return;
    
    const historyHTML = `
        <div class="history-patient-info">
            <h3>${patient.identification.full_name}</h3>
            <div class="form-grid">
                <div><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</div>
                <div><strong>Edad:</strong> ${patient.identification.age} años</div>
                <div><strong>Sexo:</strong> ${patient.identification.sex}</div>
                <div><strong>Ocupación:</strong> ${patient.identification.occupation}</div>
                <div><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zone || 'No especificada'}</div>
                <div><strong>Fecha de cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}</div>
            </div>
        </div>
        
        <div class="history-timeline">
            <div class="timeline-item initial">
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>Evaluación Inicial</h4>
                        <span class="timeline-date">${formatDate(patient.identification.admission_date)}</span>
                    </div>
                    <div class="timeline-details">
                        <div class="timeline-detail">
                            <strong>Objeto:</strong>
                            ${patient.initial_data?.object || 'No especificado'}
                        </div>
                        <div class="timeline-detail">
                            <strong>Etiología:</strong>
                            ${patient.initial_data?.etiology || 'No especificada'}
                        </div>
                        <div class="timeline-detail">
                            <strong>Tendones comprometidos:</strong>
                            ${patient.initial_data?.compromised_flexor_tendon?.join(', ') || 'No especificados'}
                        </div>
                        <div class="timeline-detail">
                            <strong>Técnica de reparación:</strong>
                            ${patient.initial_data?.repair_technique || 'No especificada'}
                        </div>
                    </div>
                </div>
            </div>
            
            ${generateFollowUpTimeline(patient.follow_ups || [])}
        </div>
    `;
    
    container.innerHTML = historyHTML;
    
    const editBtn = document.getElementById('editPatientBtn');
    if (editBtn) {
        editBtn.setAttribute('data-patient-id', patient.id);
    }
}

function generateFollowUpTimeline(followUps) {
    if (!followUps || followUps.length === 0) {
        return '<div class="no-results"><p>No hay controles de seguimiento registrados</p></div>';
    }
    
    return followUps.sort((a, b) => a.week - b.week).map(followUp => `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-header">
                    <h4>Control - Semana ${followUp.week}</h4>
                    <span class="timeline-date">${followUp.date ? formatDate(followUp.date) : 'Fecha no registrada'}</span>
                </div>
                <div class="timeline-details">
                    <div class="timeline-detail">
                        <strong>Protocolo:</strong>
                        ${followUp.protocol || 'No especificado'}
                    </div>
                    <div class="timeline-detail">
                        <strong>Terapias completas:</strong>
                        ${followUp.complete_therapies ? 'Sí' : 'No'}
                    </div>
                    <div class="timeline-detail">
                        <strong>Quick DASH:</strong>
                        ${followUp.quick_dash_score || 'No registrado'}
                    </div>
                    <div class="timeline-detail">
                        <strong>TAM:</strong>
                        ${followUp.tam_result || 'No calculado'}
                    </div>
                    <div class="timeline-detail">
                        <strong>Strickland:</strong>
                        ${followUp.strickland_result || 'No calculado'}%
                    </div>
                    <div class="timeline-detail">
                        <strong>Retorno laboral:</strong>
                        ${followUp.return_to_previous_occupation ? 'Sí' : 'No'}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showControlSelection() {
    showSection('followUpControl');
    cancelFollowUp();
}

function cancelFollowUp() {
    selectedPatientId = null;
    const formElement = document.getElementById('followUpForm');
    const selectionElement = document.getElementById('patientSelection');
    const searchElement = document.getElementById('followUpSearch');
    const resultsElement = document.getElementById('followUpSearchResults');
    
    if (formElement) formElement.classList.add('hidden');
    if (selectionElement) selectionElement.style.display = 'block';
    if (searchElement) searchElement.value = '';
    if (resultsElement) resultsElement.innerHTML = '';
    clearFollowUpForm();
}

function showPatientEditDialog() {
    const editBtn = document.getElementById('editPatientBtn');
    const patientId = editBtn?.getAttribute('data-patient-id');
    
    if (patientId) {
        showAlert('Función de edición en desarrollo. Los cambios se registrarán con el médico actual.', 'info');
    }
}

// Form handling functions
function calculateDaysToSurgery() {
    const admissionDate = document.getElementById('admissionDate')?.value;
    const surgeryDate = document.getElementById('surgeryDate')?.value;
    const daysField = document.getElementById('daysToSurgery');
    
    if (admissionDate && surgeryDate && daysField) {
        const admission = new Date(admissionDate);
        const surgery = new Date(surgeryDate);
        const diffTime = surgery - admission;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        daysField.value = Math.max(0, diffDays);
    }
}

function generateGoniometryGrid() {
    const container = document.getElementById('goniometryMeasurements');
    if (!container) return;
    
    let html = `
        <div class="gonio-header">Dedo</div>
        <div class="gonio-header">MCF</div>
        <div class="gonio-header">IFP</div>
        <div class="gonio-header">IFD</div>
        <div class="gonio-header">Déficit Ext</div>
    `;
    
    appData.fingers.forEach(finger => {
        html += `<div class="gonio-label">${finger.name}</div>`;
        appData.jointTypes.forEach(joint => {
            if (finger.number === 1 && joint === 'IFD') {
                html += `<div></div>`;
            } else {
                const inputId = `gonio_finger${finger.number}_${joint.replace(' ', '_')}`;
                html += `<input type="number" id="${inputId}" class="gonio-input" min="0" max="180" placeholder="0°" onchange="calculateTAMAndStrickland()">`;
            }
        });
    });
    
    container.innerHTML = html;
}

function calculateTAMAndStrickland() {
    let totalTAM = 0;
    let totalStrickland = 0;
    let fingerCount = 0;
    
    appData.fingers.forEach(finger => {
        const mcf = parseFloat(document.getElementById(`gonio_finger${finger.number}_MCF`)?.value) || 0;
        const ifp = parseFloat(document.getElementById(`gonio_finger${finger.number}_IFP`)?.value) || 0;
        const ifd = finger.number === 1 ? 0 : (parseFloat(document.getElementById(`gonio_finger${finger.number}_IFD`)?.value) || 0);
        const deficit = parseFloat(document.getElementById(`gonio_finger${finger.number}_Déficit_Ext`)?.value) || 0;
        
        if (mcf > 0 || ifp > 0 || ifd > 0) {
            fingerCount++;
            
            const fingerTAM = (mcf + ifp + ifd) - deficit;
            totalTAM += fingerTAM;
            
            if (finger.number > 1) {
                const stricklandValue = ((ifp + ifd) / 175) * 100;
                totalStrickland += stricklandValue;
            }
        }
    });
    
    const tamResult = document.getElementById('tamResult');
    const tamPercentage = document.getElementById('tamPercentage');
    
    if (tamResult) tamResult.value = totalTAM;
    
    const normalTAM = 260 * fingerCount;
    const tamPercent = fingerCount > 0 ? (totalTAM / normalTAM) * 100 : 0;
    if (tamPercentage) tamPercentage.value = Math.round(tamPercent);
    
    const stricklandResult = document.getElementById('stricklandResult');
    const stricklandClassification = document.getElementById('stricklandClassification');
    
    const avgStrickland = fingerCount > 1 ? totalStrickland / (fingerCount - 1) : 0;
    if (stricklandResult) stricklandResult.value = Math.round(avgStrickland);
    
    let classification = '';
    if (avgStrickland >= 85) classification = 'Excelente (85-100%)';
    else if (avgStrickland >= 70) classification = 'Bueno (70-84%)';
    else if (avgStrickland >= 50) classification = 'Regular (50-69%)';
    else classification = 'Pobre (<50%)';
    
    if (stricklandClassification) stricklandClassification.value = classification;
}

function generateQuickDashQuestions() {
    const container = document.getElementById('quickDashQuestions');
    if (!container) return;
    
    let html = '';
    appData.quickdash_questions.forEach((question, index) => {
        html += `
            <div class="quickdash-question">
                <div class="quickdash-question-text">${index + 1}. ${question}</div>
                <div class="quickdash-options">
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash_${index}" value="1" onchange="calculateQuickDash()">
                        1 - Ninguna dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash_${index}" value="2" onchange="calculateQuickDash()">
                        2 - Leve dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash_${index}" value="3" onchange="calculateQuickDash()">
                        3 - Moderada dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash_${index}" value="4" onchange="calculateQuickDash()">
                        4 - Severa dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash_${index}" value="5" onchange="calculateQuickDash()">
                        5 - Incapaz
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function calculateQuickDash() {
    let totalScore = 0;
    let answeredQuestions = 0;
    
    appData.quickdash_questions.forEach((_, index) => {
        const selectedOption = document.querySelector(`input[name="quickdash_${index}"]:checked`);
        if (selectedOption) {
            totalScore += parseInt(selectedOption.value);
            answeredQuestions++;
        }
    });
    
    if (answeredQuestions < 10) {
        document.getElementById('quickDashScore').value = '';
        document.getElementById('dashDisabilityGrade').value = '';
        return;
    }
    
    const quickDashScore = ((totalScore / answeredQuestions) - 1) * 25;
    
    document.getElementById('quickDashScore').value = Math.round(quickDashScore * 100) / 100;
    
    let disabilityGrade = '';
    if (quickDashScore < 20) disabilityGrade = 'Leve (<20)';
    else if (quickDashScore <= 40) disabilityGrade = 'Moderado (20-40)';
    else disabilityGrade = 'Severo (>40)';
    
    document.getElementById('dashDisabilityGrade').value = disabilityGrade;
}

function toggleIncompleteReason() {
    const completeTherapies = document.getElementById('completeTherapies').value;
    const reasonGroup = document.getElementById('incompleteReasonGroup');
    
    if (completeTherapies === 'false') {
        reasonGroup.style.display = 'block';
    } else {
        reasonGroup.style.display = 'none';
        document.getElementById('incompleteReason').value = '';
    }
}

function toggleReturnTimeField() {
    const returnToPrevious = document.getElementById('returnToPreviousOccupation').value;
    const timeGroup = document.getElementById('returnTimeGroup');
    
    if (returnToPrevious === 'true') {
        timeGroup.style.display = 'block';
    } else {
        timeGroup.style.display = 'none';
        document.getElementById('returnTimeMonths').value = '';
    }
}

function calculateDynamometerDifference() {
    const left = parseFloat(document.getElementById('dynamometerLeft').value) || 0;
    const right = parseFloat(document.getElementById('dynamometerRight').value) || 0;
    const difference = Math.abs(left - right);
    
    document.getElementById('dynamometerDifference').value = difference.toFixed(1);
}

function loadExistingFollowUp() {
    const weekSelect = document.getElementById('followUpWeek');
    const week = parseInt(weekSelect.value);
    
    if (!week || !selectedPatientId) {
        clearFollowUpForm();
        return;
    }
    
    weekSelect.style.fontWeight = 'bold';
    weekSelect.style.color = 'var(--color-primary)';
    
    console.log(`Cargando control existente para semana ${week}, paciente ${selectedPatientId}`);
    
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !patient.follow_ups) {
        clearFollowUpForm();
        return;
    }
    
    const existingFollowUp = patient.follow_ups.find(fu => fu.week === week);
    if (!existingFollowUp) {
        clearFollowUpForm();
        console.log(`No se encontró control existente para semana ${week}`);
        return;
    }
    
    console.log('Control existente encontrado:', existingFollowUp);
    populateFollowUpForm(existingFollowUp);
}

function populateFollowUpForm(followUp) {
    if (followUp.protocol) document.getElementById('protocolUsed').value = followUp.protocol;
    if (followUp.complete_therapies !== undefined) document.getElementById('completeTherapies').value = followUp.complete_therapies ? 'true' : 'false';
    if (followUp.incomplete_reason) document.getElementById('incompleteReason').value = followUp.incomplete_reason;
    
    if (followUp.quick_dash_score) document.getElementById('quickDashScore').value = followUp.quick_dash_score;
    if (followUp.dash_disability_grade) document.getElementById('dashDisabilityGrade').value = followUp.dash_disability_grade;
    
    if (followUp.return_to_previous_occupation !== undefined) document.getElementById('returnToPreviousOccupation').value = followUp.return_to_previous_occupation ? 'true' : 'false';
    if (followUp.occupation_change !== undefined) document.getElementById('occupationChange').value = followUp.occupation_change;
    if (followUp.return_time_months) document.getElementById('returnTimeMonths').value = followUp.return_time_months;
    
    toggleIncompleteReason();
    toggleReturnTimeField();
}

function clearFollowUpForm() {
    const form = document.getElementById('followUpForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.id !== 'followUpWeek') {
                input.value = '';
            }
        });
        
        const weekSelect = document.getElementById('followUpWeek');
        if (weekSelect) {
            weekSelect.style.fontWeight = 'normal';
            weekSelect.style.color = '';
        }
        
        toggleIncompleteReason();
        toggleReturnTimeField();
    }
}

// Form submission handlers
function handleNewPatientSubmit(event) {
    event.preventDefault();
    console.log('Procesando nuevo paciente...');
    
    if (!currentUser) {
        showAlert('Debe estar autenticado para registrar pacientes', 'error');
        return;
    }
    
    if (!validateNewPatientForm()) {
        return;
    }
    
    const patientData = collectNewPatientData();
    patientData.id = generatePatientId();
    patientData.created_by = currentUser;
    patientData.created_at = new Date().toISOString();
    
    patients.push(patientData);
    savePatients();
    updateDashboard();
    
    showAlert('Paciente registrado exitosamente', 'success');
    document.getElementById('newPatientForm').reset();
    initializeDateFields();
    showSection('dashboard');
}

function collectNewPatientData() {
    const compromisedTendons = [];
    ['fds', 'fdp', 'fpl', 'fcu', 'fcr', 'pl'].forEach(tendon => {
        const checkbox = document.getElementById(`tendon_${tendon}`);
        if (checkbox && checkbox.checked) {
            compromisedTendons.push(tendon.toUpperCase());
        }
    });
    
    const associatedInjuries = [];
    ['nervioso', 'oseo', 'vascular', 'muscular', 'ligamentaria', 'capsula'].forEach(injury => {
        const checkbox = document.getElementById(`injury_${injury}`);
        if (checkbox && checkbox.checked) {
            associatedInjuries.push(injury.toUpperCase() === 'CAPSULA' ? 'CÁPSULA ARTICULAR' : injury.toUpperCase());
        }
    });
    
    return {
        identification: {
            admission_date: document.getElementById('admissionDate').value,
            evolution_time_hours: parseInt(document.getElementById('evolutionTime').value),
            full_name: document.getElementById('fullName').value,
            document_type: document.getElementById('documentType').value,
            document_number: document.getElementById('documentNumber').value,
            age: parseInt(document.getElementById('age').value),
            sex: document.getElementById('sex').value,
            education_level: document.getElementById('educationLevel').value,
            occupation: document.getElementById('occupation').value,
            birth_city: document.getElementById('birthCity').value,
            address: document.getElementById('address').value,
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            eps: document.getElementById('eps').value,
            affiliation_type: document.getElementById('affiliationType').value,
            religion: document.getElementById('religion').value,
            companion_name: document.getElementById('companionName').value,
            companion_relation: document.getElementById('companionRelation').value,
            companion_phone: document.getElementById('companionPhone').value
        },
        initial_data: {
            compromised_flexor_tendon: compromisedTendons,
            injured_zone: document.getElementById('injuredZone').value,
            object: document.getElementById('object').value,
            etiology: document.getElementById('etiology').value,
            trauma_mechanism: document.getElementById('traumaMechanism').value,
            presurgical_description: document.getElementById('presurgicalDescription').value,
            tendon_description: document.getElementById('tendonDescription').value,
            associated_injuries: associatedInjuries,
            specific_associated_injury: document.getElementById('specificAssociatedInjury').value,
            tenorrhaphy_threads: document.getElementById('tenorrhaphyThreads').value,
            repair_type: document.getElementById('repairType').value,
            repair_technique: document.getElementById('repairTechnique').value,
            tenolysis: document.getElementById('tenolysis').value,
            days_to_surgery: parseInt(document.getElementById('daysToSurgery').value) || 0,
            surgery_date: document.getElementById('surgeryDate').value,
            bmrc_sensory: {
                median: parseInt(document.getElementById('bmrcSensoryMedian').value) || 0,
                ulnar: parseInt(document.getElementById('bmrcSensoryUlnar').value) || 0,
                radial: parseInt(document.getElementById('bmrcSensoryRadial').value) || 0
            },
            bmrc_motor: {
                fds: {
                    finger2: parseInt(document.getElementById('bmrcMotorFds2').value) || 0,
                    finger3: parseInt(document.getElementById('bmrcMotorFds3').value) || 0,
                    finger4: parseInt(document.getElementById('bmrcMotorFds4').value) || 0,
                    finger5: parseInt(document.getElementById('bmrcMotorFds5').value) || 0
                },
                fdp: {
                    finger2: parseInt(document.getElementById('bmrcMotorFdp2').value) || 0,
                    finger3: parseInt(document.getElementById('bmrcMotorFdp3').value) || 0,
                    finger4: parseInt(document.getElementById('bmrcMotorFdp4').value) || 0,
                    finger5: parseInt(document.getElementById('bmrcMotorFdp5').value) || 0
                },
                fpl: parseInt(document.getElementById('bmrcMotorFpl').value) || 0,
                fcu: parseInt(document.getElementById('bmrcMotorFcu').value) || 0,
                fcr: parseInt(document.getElementById('bmrcMotorFcr').value) || 0,
                pl: parseInt(document.getElementById('bmrcMotorPl').value) || 0
            }
        },
        follow_ups: []
    };
}

function handleFollowUpSubmit(event) {
    event.preventDefault();
    console.log('Procesando seguimiento...');
    
    if (!currentUser || !selectedPatientId || !validateFollowUpForm()) {
        return;
    }
    
    const followUpData = collectFollowUpData();
    const patient = patients.find(p => p.id === selectedPatientId);
    
    if (patient) {
        if (!patient.follow_ups) {
            patient.follow_ups = [];
        }
        
        const existingIndex = patient.follow_ups.findIndex(fu => fu.week === followUpData.week);
        if (existingIndex >= 0) {
            followUpData.modified_by = currentUser;
            followUpData.modified_at = new Date().toISOString();
            patient.follow_ups[existingIndex] = followUpData;
            showAlert(`Control de semana ${followUpData.week} actualizado exitosamente`, 'success');
        } else {
            followUpData.created_by = currentUser;
            followUpData.created_at = new Date().toISOString();
            patient.follow_ups.push(followUpData);
            showAlert(`Control de semana ${followUpData.week} guardado exitosamente`, 'success');
        }
        
        savePatients();
        updateDashboard();
        cancelFollowUp();
    }
}

function collectFollowUpData() {
    const week = parseInt(document.getElementById('followUpWeek').value);
    
    const goniometry = {};
    appData.fingers.forEach(finger => {
        goniometry[`finger${finger.number}`] = {};
        appData.jointTypes.forEach(joint => {
            const inputId = `gonio_finger${finger.number}_${joint.replace(' ', '_')}`;
            const input = document.getElementById(inputId);
            if (input && input.value) {
                goniometry[`finger${finger.number}`][joint.toLowerCase().replace(' ', '_')] = parseInt(input.value);
            }
        });
    });
    
    const quickDashResponses = {};
    appData.quickdash_questions.forEach((_, index) => {
        const selectedOption = document.querySelector(`input[name="quickdash_${index}"]:checked`);
        if (selectedOption) {
            quickDashResponses[`question_${index + 1}`] = parseInt(selectedOption.value);
        }
    });
    
    return {
        week: week,
        date: new Date().toISOString().split('T')[0],
        protocol: document.getElementById('protocolUsed').value,
        complete_therapies: document.getElementById('completeTherapies').value === 'true',
        incomplete_reason: document.getElementById('incompleteReason').value,
        goniometry: goniometry,
        tam_result: parseFloat(document.getElementById('tamResult').value) || 0,
        tam_percentage: parseFloat(document.getElementById('tamPercentage').value) || 0,
        strickland_result: parseFloat(document.getElementById('stricklandResult').value) || 0,
        strickland_classification: document.getElementById('stricklandClassification').value,
        quickdash_responses: quickDashResponses,
        quick_dash_score: parseFloat(document.getElementById('quickDashScore').value) || 0,
        dash_disability_grade: document.getElementById('dashDisabilityGrade').value,
        return_to_previous_occupation: document.getElementById('returnToPreviousOccupation').value === 'true',
        occupation_change: document.getElementById('occupationChange').value,
        return_time_months: parseInt(document.getElementById('returnTimeMonths').value) || 0,
        bmrc_sensory: {
            median: parseInt(document.getElementById('followUpBmrcSensoryMedian').value) || 0,
            ulnar: parseInt(document.getElementById('followUpBmrcSensoryUlnar').value) || 0,
            radial: parseInt(document.getElementById('followUpBmrcSensoryRadial').value) || 0
        },
        bmrc_motor: {
            fpl: parseInt(document.getElementById('followUpBmrcMotorFpl').value) || 0,
            fcu: parseInt(document.getElementById('followUpBmrcMotorFcu').value) || 0,
            fcr: parseInt(document.getElementById('followUpBmrcMotorFcr').value) || 0,
            pl: parseInt(document.getElementById('followUpBmrcMotorPl').value) || 0
        },
        dynamometer: {
            left: parseFloat(document.getElementById('dynamometerLeft').value) || 0,
            right: parseFloat(document.getElementById('dynamometerRight').value) || 0,
            difference: parseFloat(document.getElementById('dynamometerDifference').value) || 0
        },
        nail_palm_distance: {
            finger2: parseInt(document.getElementById('nailPalmDistance2').value) || 0,
            finger3: parseInt(document.getElementById('nailPalmDistance3').value) || 0,
            finger4: parseInt(document.getElementById('nailPalmDistance4').value) || 0,
            finger5: parseInt(document.getElementById('nailPalmDistance5').value) || 0
        }
    };
}

// Form validation functions
function validateNewPatientForm() {
    const requiredFields = [
        'admissionDate', 'evolutionTime', 'fullName', 'documentType', 'documentNumber',
        'age', 'sex', 'educationLevel', 'occupation', 'birthCity', 'address',
        'department', 'city', 'phone', 'eps', 'affiliationType', 'injuredZone',
        'object', 'etiology', 'traumaMechanism'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            const label = field?.labels?.[0]?.textContent || field?.previousElementSibling?.textContent || fieldId;
            showAlert(`El campo ${label} es requerido`, 'error');
            field?.focus();
            return false;
        }
    }
    
    return true;
}

function validateFollowUpForm() {
    const weekSelect = document.getElementById('followUpWeek');
    const week = weekSelect.value;
    
    if (!week) {
        showAlert('Debe seleccionar la semana de control', 'error');
        weekSelect.focus();
        return false;
    }
    
    console.log(`Validación exitosa para semana ${week}`);
    return true;
}

function exportData() {
    if (patients.length === 0) {
        showAlert('No hay datos para exportar', 'warning');
        return;
    }
    
    console.log('Iniciando exportación de datos...');
    
    try {
        const csvData = generateCSVData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tendones_flexores_${timestamp}.csv`;
        
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`Datos exportados como ${filename}`);
        showAlert(`Datos exportados exitosamente como ${filename}`, 'success');
    } catch (error) {
        console.error('Error al exportar datos:', error);
        showAlert('Error al exportar datos', 'error');
    }
}

function generateCSVData() {
    const headers = [
        'ID Paciente', 'Nombre Completo', 'Documento', 'Edad', 'Sexo', 'Ocupación',
        'Fecha Ingreso', 'Zona Lesionada', 'Objeto', 'Etiología', 'Mecanismo Trauma',
        'Fecha Cirugía', 'Días para Cirugía', 'Tendones Comprometidos', 'Técnica Reparación',
        'Lesiones Asociadas', 'Médico Registro', 'Fecha Registro'
    ];
    
    appData.follow_up_weeks.forEach(week => {
        headers.push(
            `Control ${week}sem - Fecha`,
            `Control ${week}sem - Protocolo`,
            `Control ${week}sem - TAM`,
            `Control ${week}sem - Strickland`,
            `Control ${week}sem - Quick DASH`,
            `Control ${week}sem - Discapacidad`,
            `Control ${week}sem - Retorno Laboral`,
            `Control ${week}sem - Médico`
        );
    });
    
    const rows = [headers];
    
    patients.forEach(patient => {
        const row = [
            patient.id,
            patient.identification.full_name,
            `${patient.identification.document_type} - ${patient.identification.document_number}`,
            patient.identification.age,
            patient.identification.sex,
            patient.identification.occupation,
            patient.identification.admission_date,
            patient.initial_data?.injured_zone || '',
            patient.initial_data?.object || '',
            patient.initial_data?.etiology || '',
            patient.initial_data?.trauma_mechanism || '',
            patient.initial_data?.surgery_date || '',
            patient.initial_data?.days_to_surgery || '',
            patient.initial_data?.compromised_flexor_tendon?.join(', ') || '',
            patient.initial_data?.repair_technique || '',
            patient.initial_data?.associated_injuries?.join(', ') || '',
            patient.created_by?.name || '',
            patient.created_at ? formatDate(patient.created_at) : ''
        ];
        
        appData.follow_up_weeks.forEach(week => {
            const followUp = patient.follow_ups?.find(fu => fu.week === week);
            if (followUp) {
                row.push(
                    followUp.date || '',
                    followUp.protocol || '',
                    followUp.tam_result || '',
                    followUp.strickland_result || '',
                    followUp.quick_dash_score || '',
                    followUp.dash_disability_grade || '',
                    followUp.return_to_previous_occupation ? 'Sí' : 'No',
                    followUp.created_by?.name || followUp.modified_by?.name || ''
                );
            } else {
                row.push('', '', '', '', '', '', '', '');
            }
        });
        
        rows.push(row);
    });
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Utility functions
function initializeDateFields() {
    const today = new Date().toISOString().split('T')[0];
    const admissionDateField = document.getElementById('admissionDate');
    if (admissionDateField) {
        admissionDateField.value = today;
    }
}

function generatePatientId() {
    return 'PAT' + Date.now().toString().substr(-6);
}

function formatDate(dateString) {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'No registrada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAlert(message, type = 'info', duration = 5000) {
    console.log(`Alert: ${type} - ${message}`);
    
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
    }
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, duration);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listener setup
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    const newPatientForm = document.getElementById('newPatientForm');
    if (newPatientForm) {
        newPatientForm.addEventListener('submit', handleNewPatientSubmit);
        console.log('Form listener agregado: newPatientForm');
    }
    
    const followUpForm = document.getElementById('followUpForm');
    if (followUpForm) {
        followUpForm.addEventListener('submit', handleFollowUpSubmit);
        console.log('Form listener agregado: followUpForm');
    }
    
    const doctorLoginForm = document.getElementById('doctorLoginForm');
    if (doctorLoginForm) {
        doctorLoginForm.addEventListener('submit', handleDoctorLogin);
        console.log('Form listener agregado: doctorLoginForm');
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchPatients, 300));
        console.log('Search listener agregado: searchInput');
    }
    
    const followUpSearchInput = document.getElementById('followUpSearch');
    if (followUpSearchInput) {
        followUpSearchInput.addEventListener('input', debounce(searchPatientsForFollowUp, 300));
        console.log('Search listener agregado: followUpSearchInput');
    }
}

// CORRECCIÓN CRÍTICA: Hacer funciones globalmente disponibles inmediatamente
window.showSection = showSection;
window.showProtocol = showProtocol;
window.startExercise = startExercise;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.closeExerciseModal = closeExerciseModal;
window.searchPatients = searchPatients;
window.searchPatientsForFollowUp = searchPatientsForFollowUp;
window.showControlSelection = showControlSelection;
window.exportData = exportData;
window.showPatientHistory = showPatientHistory;
window.selectPatientForFollowUp = selectPatientForFollowUp;
window.cancelFollowUp = cancelFollowUp;
window.showPatientEditDialog = showPatientEditDialog;
window.calculateDaysToSurgery = calculateDaysToSurgery;
window.calculateTAMAndStrickland = calculateTAMAndStrickland;
window.calculateQuickDash = calculateQuickDash;
window.toggleIncompleteReason = toggleIncompleteReason;
window.toggleReturnTimeField = toggleReturnTimeField;
window.calculateDynamometerDifference = calculateDynamometerDifference;
window.loadExistingFollowUp = loadExistingFollowUp;
window.logout = logout;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicación iniciando...');
    
    loadPatients();
    initializeDateFields();
    setupEventListeners();
    showSection('accessScreen');
    
    console.log('Aplicación iniciada correctamente - Sistema limpio sin datos de ejemplo');
});