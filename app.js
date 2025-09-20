// Application State
let currentSection = 'accessScreen';
let currentUser = null;
let selectedPatientId = null;
let patients = [];
let currentExerciseTimer = null;
let timerInterval = null;
let currentProtocol = 'KLEINERT';
let editingSection = null;
let pendingEditData = null;
let currentEditPatientId = null;

// Application Data with corrected BMRC scales
const appData = {
    accessPassword: "0911",
    
    bmrc_motor_scale: [
        {value: 0, code: "M0", description: "Sin contracción muscular"},
        {value: 1, code: "M1", description: "Contracción muscular que no resulta en movimiento articular"},
        {value: 2, code: "M2", description: "Contracción muscular con movimiento excluyendo gravedad"},
        {value: 3, code: "M3", description: "Contracción muscular efectiva contra gravedad pero no supera resistencia"},
        {value: 4, code: "M4", description: "Contracción muscular que supera cierta resistencia"},
        {value: 5, code: "M5", description: "Fuerza muscular normal"}
    ],
    
    bmrc_sensory_scale: [
        {value: 0, code: "S0", description: "Sin sensación"},
        {value: 1, code: "S1", description: "Sensación de dolor (profundo)"},
        {value: 2, code: "S2", description: "Sensación de dolor y tacto"},
        {value: 2.5, code: "S2+", description: "Sensación de dolor y tacto con cierta sobreacción"},
        {value: 3, code: "S3", description: "Como S2+, sin sobreacción y discriminación estática 15-20 mm"},
        {value: 3.5, code: "S3+", description: "Como S3, discriminación estática 7-15 mm"},
        {value: 4, code: "S4", description: "Como S3+, discriminación estática < 7 mm"}
    ],
    
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
        "Hormigueo en brazo, hombro or mano",
        "¿Cuánta dificultad tuvo para dormir?",
        "Me siento menos capaz, menos seguro or menos útil"
    ],
    
    // TAM normal values by finger
    tam_normal_values: {
        1: 160, // Dedo 1 (Pulgar)
        2: 260, // Dedo 2 (Índice)
        3: 260, // Dedo 3 (Medio)
        4: 260, // Dedo 4 (Anular)
        5: 260  // Dedo 5 (Meñique)
    },
    
    // Updated finger names using numbers
    fingers: [
        { number: 1, name: "Dedo 1", joints: ["MCF", "IFP"] }, // Pulgar (no IFD)
        { number: 2, name: "Dedo 2", joints: ["MCF", "IFP", "IFD"] },
        { number: 3, name: "Dedo 3", joints: ["MCF", "IFP", "IFD"] },
        { number: 4, name: "Dedo 4", joints: ["MCF", "IFP", "IFD"] },
        { number: 5, name: "Dedo 5", joints: ["MCF", "IFP", "IFD"] }
    ],
    
    // MODIFICADO: Eliminado "Déficit_Ext"
    jointTypes: ["MCF", "IFP", "IFD"]
};

// COMPLETE EXERCISE PROTOCOLS
appData.exercise_protocols = {
    KLEINERT: {
        name: "PROTOCOLO DE KLEINERT",
        objective: "Lograr movilidad precoz controlada del tendón reparado sin comprometer la sutura",
        mechanism: "Se coloca un arnés en la muñeca o antebrazo, con gomas elásticas fijadas a las uñas",
        phases: {
            phase_1: {
                name: "0-3 días (Postoperatorio inmediato)",
                objective: "Protección inicial y control del dolor",
                exercises: [
                    {
                        name: "Reposo Protegido",
                        description: "Mantener férula dorsal con bandas elásticas las 24 horas",
                        duration: 0,
                        repetitions: 1,
                        frequency: "Continuo"
                    },
                    {
                        name: "Control del Edema",
                        description: "Elevación de la mano y aplicación de hielo según tolerancia",
                        duration: 15,
                        repetitions: 1,
                        frequency: "Cada 2 horas"
                    }
                ]
            },
            phase_2: {
                name: "Día 3 - Semana 4",
                objective: "Inicio de movimiento pasivo controlado",
                exercises: [
                    {
                        name: "Flexión Pasiva",
                        description: "Permita que las bandas elásticas flexionen los dedos suavemente hasta la palma",
                        duration: 30,
                        repetitions: 10,
                        frequency: "Cada hora despierto"
                    },
                    {
                        name: "Extensión Activa",
                        description: "Extienda dedos activamente hasta límite de férula dorsal",
                        duration: 45,
                        repetitions: 15,
                        frequency: "Cada hora despierto"
                    }
                ]
            }
        }
    },
    DURAN: {
        name: "PROTOCOLO DE DURAN",
        objective: "Movilización pasiva precoz para prevenir adherencias sin tensión en la sutura",
        mechanism: "Movimientos pasivos controlados de las articulaciones IFP e IFD",
        phases: {
            phase_1: {
                name: "0-3 días (Postoperatorio inmediato)",
                objective: "Protección y control inicial",
                exercises: [
                    {
                        name: "Reposo con Férula",
                        description: "Férula dorsal en posición funcional con muñeca en 20° flexión",
                        duration: 0,
                        repetitions: 1,
                        frequency: "Continuo"
                    }
                ]
            }
        }
    },
    ACTIVE_MOTION: {
        name: "PROTOCOLO DE MOVILIZACIÓN ACTIVA",
        objective: "Movilización activa temprana para optimizar el deslizamiento tendinoso",
        mechanism: "Movimiento activo controlado desde el postoperatorio inmediato",
        phases: {
            phase_1: {
                name: "0-3 días (Postoperatorio inmediato)",
                objective: "Inicio de movilización activa controlada",
                exercises: [
                    {
                        name: "Flexión Activa Limitada",
                        description: "Flexión activa hasta la base del dedo medio únicamente",
                        duration: 30,
                        repetitions: 5,
                        frequency: "Cada 2 horas"
                    }
                ]
            }
        }
    }
};

// Data persistence functions (using memory since localStorage not available)
let memoryStorage = {};

function savePatients() {
    try {
        memoryStorage['flexorTendonPatients'] = JSON.stringify(patients);
        console.log('Pacientes guardados en memoria:', patients.length);
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

// FIXED Navigation functions with proper error handling
function showSection(sectionId) {
    try {
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
            } else if (sectionId === 'clinicalHistories') {
                loadClinicalHistoriesList();
            } else if (sectionId === 'editPatients') {
                loadEditablePatientsList();
            }

            // Scroll to top
            window.scrollTo(0, 0);
        } else {
            console.error('Sección no encontrada:', sectionId);
        }
    } catch (error) {
        console.error('Error en showSection:', error);
        showAlert('Error navegando a la sección', 'error');
    }
}

// MODIFICADO: Authentication functions con funcionalidad de borrado
function handleDoctorLogin(event) {
    event.preventDefault();
    console.log('Procesando login de médico...');

    try {
        const doctorId = document.getElementById('doctorId').value;
        const doctorName = document.getElementById('doctorName').value;
        const password = document.getElementById('doctorPassword').value;

        console.log('Datos de login:', { doctorId, doctorName, password });

        // NUEVO: Verificar credenciales especiales para borrado completo
        if (doctorId === '3124540284' && password === '3124540284') {
            const confirmDelete = confirm('¿ADVERTENCIA: Está a punto de BORRAR TODOS LOS DATOS de la base de datos. Esta acción NO se puede deshacer. ¿Está seguro que desea continuar?');
            if (confirmDelete) {
                const doubleConfirm = confirm('CONFIRMACIÓN FINAL: ¿Está completamente seguro de que desea eliminar TODA la información de pacientes y controles?');
                if (doubleConfirm) {
                    // Borrar todos los datos
                    patients = [];
                    memoryStorage = {};
                    savePatients();
                    showAlert('TODOS LOS DATOS HAN SIDO ELIMINADOS COMPLETAMENTE', 'success');
                    updateDashboard();
                    return false;
                }
            }
            showAlert('Operación de borrado cancelada', 'info');
            return false;
        }

        // Verificación normal de contraseña
        if (password !== appData.accessPassword) {
            showAlert('Contraseña incorrecta. Use: ' + appData.accessPassword, 'error');
            return false;
        }

        if (!doctorId || !doctorName) {
            showAlert('Todos los campos son requeridos', 'error');
            return false;
        }

        currentUser = {
            id: doctorId,
            name: doctorName,
            loginTime: new Date().toISOString()
        };

        console.log('Usuario autenticado:', currentUser);
        updateDoctorInfo();
        showAlert('Sesión iniciada correctamente - Redirigiendo al dashboard...', 'success');
        
        // Small delay to show success message
        setTimeout(() => {
            showSection('dashboard');
        }, 1000);

        return false;
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('Error en el proceso de login', 'error');
        return false;
    }
}

function updateDoctorInfo() {
    const doctorInfo = document.getElementById('doctorInfo');
    if (doctorInfo && currentUser) {
        doctorInfo.innerHTML = `
            **Dr(a). ${currentUser.name}** - Cédula: ${currentUser.id} - Sesión iniciada: ${formatDateTime(currentUser.loginTime)}
        `;
    }
}

function logout() {
    currentUser = null;
    selectedPatientId = null;
    currentEditPatientId = null;
    const loginForm = document.getElementById('doctorLoginForm');
    if (loginForm) {
        loginForm.reset();
    }
    showSection('accessScreen');
    showAlert('Sesión cerrada correctamente', 'info');
}

// CORRECTED Patient section functions with COMPLETE protocols
function showProtocol(protocolName) {
    try {
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

        let html = `
            <div class="protocol-header">
                <h3>${protocol.name}</h3>
                <p><strong>Objetivo:</strong> ${protocol.objective}</p>
                <p><strong>Mecanismo:</strong> ${protocol.mechanism}</p>
            </div>
        `;

        // Generate phases with complete information
        Object.keys(protocol.phases).forEach(phaseKey => {
            const phase = protocol.phases[phaseKey];
            html += `
                <div class="protocol-phase">
                    <div class="protocol-phase-header">
                        <h4 class="protocol-phase-title">${phase.name}</h4>
                        <p class="protocol-phase-objective">${phase.objective}</p>
                    </div>
                    <div class="exercise-list">
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
        });

        content.innerHTML = html;
    } catch (error) {
        console.error('Error mostrando protocolo:', error);
        showAlert('Error cargando protocolo de ejercicios', 'error');
    }
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

// Clinical Histories Functions
function showClinicalHistories() {
    console.log('Mostrando historias clínicas...');
    showSection('clinicalHistories');
}

function loadClinicalHistoriesList() {
    const container = document.getElementById('clinicalHistoriesList');
    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No hay pacientes registrados</h3><p>Registre pacientes para ver sus historias clínicas completas.</p></div>';
        return;
    }

    const html = patients.map(patient => {
        const followUpCount = patient.followups ? patient.followups.length : 0;
        const lastControl = patient.followups && patient.followups.length > 0 ? 
            patient.followups[patient.followups.length - 1] : null;
        
        return `
            <div class="clinical-history-item" onclick="showIndividualClinicalHistory('${patient.id}')">
                <div class="clinical-history-header">
                    <h3 class="clinical-history-patient-name">${patient.identification.fullname}</h3>
                    <div class="clinical-history-stats">
                        <span class="clinical-history-stat">${followUpCount} controles</span>
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
                    </div>
                </div>
                <div class="clinical-history-details">
                    <div class="clinical-history-detail"><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</div>
                    <div class="clinical-history-detail"><strong>Fecha Ingreso:</strong> ${formatDate(patient.identification.admission_date)}</div>
                    <div class="clinical-history-detail"><strong>Cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}</div>
                    <div class="clinical-history-detail"><strong>Último Control:</strong> ${lastControl ? `Semana ${lastControl.week} - ${formatDate(lastControl.date)}` : 'Sin controles'}</div>
                </div>
                <div class="clinical-history-actions">
                    <button class="btn btn--sm btn--primary" onclick="event.stopPropagation(); showIndividualClinicalHistory('${patient.id}')">Ver Historia Completa</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function searchClinicalHistories() {
    const searchInput = document.getElementById('clinicalHistorySearch');
    const container = document.getElementById('clinicalHistoriesList');
    
    if (!searchInput || !container) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadClinicalHistoriesList();
        return;
    }

    const filteredPatients = patients.filter(patient =>
        patient.identification.fullname.toLowerCase().includes(searchTerm) ||
        patient.identification.document_number.includes(searchTerm)
    );

    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No se encontraron pacientes</h3><p>Intente con un término de búsqueda diferente.</p></div>';
        return;
    }

    // Similar rendering logic as loadClinicalHistoriesList but with filtered patients
    const html = filteredPatients.map(patient => {
        const followUpCount = patient.followups ? patient.followups.length : 0;
        const lastControl = patient.followups && patient.followups.length > 0 ? 
            patient.followups[patient.followups.length - 1] : null;
        
        return `
            <div class="clinical-history-item" onclick="showIndividualClinicalHistory('${patient.id}')">
                <div class="clinical-history-header">
                    <h3 class="clinical-history-patient-name">${patient.identification.fullname}</h3>
                    <div class="clinical-history-stats">
                        <span class="clinical-history-stat">${followUpCount} controles</span>
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
                    </div>
                </div>
                <div class="clinical-history-details">
                    <div class="clinical-history-detail"><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</div>
                    <div class="clinical-history-detail"><strong>Fecha Ingreso:</strong> ${formatDate(patient.identification.admission_date)}</div>
                    <div class="clinical-history-detail"><strong>Cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}</div>
                    <div class="clinical-history-detail"><strong>Último Control:</strong> ${lastControl ? `Semana ${lastControl.week} - ${formatDate(lastControl.date)}` : 'Sin controles'}</div>
                </div>
                <div class="clinical-history-actions">
                    <button class="btn btn--sm btn--primary" onclick="event.stopPropagation(); showIndividualClinicalHistory('${patient.id}')">Ver Historia Completa</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function showIndividualClinicalHistory(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    selectedPatientId = patientId;
    const nameElement = document.getElementById('clinicalHistoryPatientName');
    const contentElement = document.getElementById('individualHistoryContent');

    if (nameElement) {
        nameElement.textContent = 'Historia Clínica - ' + patient.identification.fullname;
    }
    if (contentElement) {
        contentElement.innerHTML = generateIndividualHistoryHTML(patient);
    }

    showSection('individualClinicalHistory');
}

function generateIndividualHistoryHTML(patient) {
    return `
        <!-- Identificación del Paciente -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Identificación del Paciente</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateIdentificationHTML(patient.identification)}
            </div>
        </div>

        <!-- Datos Iniciales del Trauma -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Datos Iniciales del Trauma</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateInitialDataHTML(patient.initial_data)}
            </div>
        </div>

        <!-- Controles de Seguimiento -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Controles de Seguimiento</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateFollowUpControlsHTML(patient.followups, patient.id)}
            </div>
        </div>
    `;
}

function generateIdentificationHTML(identification) {
    return `
        <div class="clinical-data-grid">
            <div class="clinical-data-item">
                <div class="clinical-data-label">Nombre Completo</div>
                <div class="clinical-data-value">${identification.fullname}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Documento</div>
                <div class="clinical-data-value">${identification.document_type} - ${identification.document_number}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Edad</div>
                <div class="clinical-data-value">${identification.age} años</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Sexo</div>
                <div class="clinical-data-value">${identification.sex}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Ocupación</div>
                <div class="clinical-data-value">${identification.occupation}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Estrato</div>
                <div class="clinical-data-value">${identification.estrato || 'No registrado'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Comorbilidades</div>
                <div class="clinical-data-value">${identification.comorbilidades_actuales || 'No registradas'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Teléfono</div>
                <div class="clinical-data-value">${identification.phone}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">EPS</div>
                <div class="clinical-data-value">${identification.eps}</div>
            </div>
        </div>
    `;
}

function generateInitialDataHTML(initialData) {
    if (!initialData) {
        return '<p>No hay datos iniciales registrados.</p>';
    }

    return `
        <div class="clinical-data-grid">
            <div class="clinical-data-item">
                <div class="clinical-data-label">Miembro Lesionado</div>
                <div class="clinical-data-value">${initialData.miembro_lesionado || 'No especificado'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Zonas Lesionadas</div>
                <div class="clinical-data-value">${initialData.injured_zones ? 'Zonas ' + initialData.injured_zones.join(', ') : 'No especificada'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Objeto</div>
                <div class="clinical-data-value">${initialData.object || 'No especificado'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Etiología</div>
                <div class="clinical-data-value">${initialData.etiology || 'No especificada'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Mecanismo Trauma</div>
                <div class="clinical-data-value">${initialData.trauma_mechanism || 'No especificado'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Fecha Cirugía</div>
                <div class="clinical-data-value">${formatDate(initialData.surgery_date)}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Días para Cirugía</div>
                <div class="clinical-data-value">${initialData.days_to_surgery || 0} días</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Tendones Comprometidos</div>
                <div class="clinical-data-value">${initialData.compromised_flexor_tendon?.join(', ') || 'No especificados'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Técnica Reparación</div>
                <div class="clinical-data-value">${initialData.repair_technique || 'No especificada'}</div>
            </div>
        </div>
    `;
}

function generateFollowUpControlsHTML(followUps, patientId) {
    if (!followUps || followUps.length === 0) {
        return '<p>No hay controles de seguimiento registrados.</p>';
    }

    return `
        <div class="evolution-timeline">
            ${followUps.sort((a, b) => a.week - b.week).map(followUp => `
                <div class="evolution-item">
                    <div class="evolution-content">
                        <div class="evolution-header">
                            <h4>Control - Semana ${followUp.week}</h4>
                            <span class="evolution-date">${formatDate(followUp.date)}</span>
                        </div>
                        <div class="clinical-data-grid">
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Protocolo</div>
                                <div class="clinical-data-value">${followUp.protocol || 'No especificado'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Terapias Completas</div>
                                <div class="clinical-data-value">${followUp.complete_therapies ? 'Sí' : 'No'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Complicaciones</div>
                                <div class="clinical-data-value">${followUp.complicaciones || 'Ninguna'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Reintervención</div>
                                <div class="clinical-data-value">${followUp.reintervencion_quirurgica || 'No'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Quick DASH</div>
                                <div class="clinical-data-value">${followUp.quickdash_score?.toFixed(2) || 'No calculado'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Strickland</div>
                                <div class="clinical-data-value">${followUp.strickland_result?.toFixed(1) || 'No calculado'}%</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Retorno Laboral</div>
                                <div class="clinical-data-value">${followUp.return_to_previous_occupation ? 'Sí' : 'No'}</div>
                            </div>
                            <div class="clinical-data-item">
                                <div class="clinical-data-label">Grado Discapacidad</div>
                                <div class="clinical-data-value">${followUp.dash_disability_grade || 'No calculado'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// NUEVA: Funciones completas para editar pacientes
function loadEditablePatientsList() {
    const container = document.getElementById('editPatientsList');
    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No hay pacientes registrados</h3><p>Registre pacientes para poder editarlos.</p></div>';
        return;
    }

    const html = patients.map(patient => {
        const followUpCount = patient.followups ? patient.followups.length : 0;
        
        return `
            <div class="edit-patient-item">
                <div class="edit-patient-header">
                    <h3>${patient.identification.fullname}</h3>
                    <div class="patient-info">
                        <span><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</span>
                        <span><strong>Zona:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
                        <span><strong>Controles:</strong> ${followUpCount}</span>
                    </div>
                </div>
                <div class="edit-patient-actions">
                    <button class="edit-button" onclick="editPatientIdentification('${patient.id}')">Editar Identificación</button>
                    <button class="edit-button" onclick="editPatientInitialData('${patient.id}')">Editar Datos Iniciales</button>
                    <button class="edit-button" onclick="editPatientFollowUps('${patient.id}')">Editar Controles</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function searchPatientsForEdit() {
    const searchInput = document.getElementById('editPatientSearch');
    const container = document.getElementById('editPatientsList');
    
    if (!searchInput || !container) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadEditablePatientsList();
        return;
    }

    const filteredPatients = patients.filter(patient =>
        patient.identification.fullname.toLowerCase().includes(searchTerm) ||
        patient.identification.document_number.includes(searchTerm)
    );

    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No se encontraron pacientes</h3><p>Intente con un término de búsqueda diferente.</p></div>';
        return;
    }

    const html = filteredPatients.map(patient => {
        const followUpCount = patient.followups ? patient.followups.length : 0;
        
        return `
            <div class="edit-patient-item">
                <div class="edit-patient-header">
                    <h3>${patient.identification.fullname}</h3>
                    <div class="patient-info">
                        <span><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</span>
                        <span><strong>Zona:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
                        <span><strong>Controles:</strong> ${followUpCount}</span>
                    </div>
                </div>
                <div class="edit-patient-actions">
                    <button class="edit-button" onclick="editPatientIdentification('${patient.id}')">Editar Identificación</button>
                    <button class="edit-button" onclick="editPatientInitialData('${patient.id}')">Editar Datos Iniciales</button>
                    <button class="edit-button" onclick="editPatientFollowUps('${patient.id}')">Editar Controles</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// NUEVA: Función completa para editar identificación del paciente
function editPatientIdentification(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    currentEditPatientId = patientId;
    editingSection = 'identification';

    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const content = document.getElementById('editFormContent');

    title.textContent = `Editar Identificación - ${patient.identification.fullname}`;

    const identification = patient.identification;
    content.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Fecha de Ingreso</label>
                <input type="date" id="editAdmissionDate" class="form-control" value="${identification.admission_date}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tiempo de Evolución (Horas)</label>
                <input type="number" id="editEvolutionTime" class="form-control" value="${identification.evolution_time_hours}" required>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="editFullName" class="form-control" value="${identification.fullname}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Tipo de Documento</label>
                <select id="editDocumentType" class="form-control" required>
                    <option value="Cédula de Ciudadanía" ${identification.document_type === 'Cédula de Ciudadanía' ? 'selected' : ''}>Cédula de Ciudadanía</option>
                    <option value="Tarjeta de Identidad" ${identification.document_type === 'Tarjeta de Identidad' ? 'selected' : ''}>Tarjeta de Identidad</option>
                    <option value="Pasaporte" ${identification.document_type === 'Pasaporte' ? 'selected' : ''}>Pasaporte</option>
                    <option value="Registro Civil" ${identification.document_type === 'Registro Civil' ? 'selected' : ''}>Registro Civil</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Número de Documento</label>
                <input type="text" id="editDocumentNumber" class="form-control" value="${identification.document_number}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Edad</label>
                <input type="number" id="editAge" class="form-control" value="${identification.age}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Sexo</label>
                <select id="editSex" class="form-control" required>
                    <option value="Masculino" ${identification.sex === 'Masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="Femenino" ${identification.sex === 'Femenino' ? 'selected' : ''}>Femenino</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Nivel Educativo</label>
                <select id="editEducationLevel" class="form-control" required>
                    <option value="Primaria" ${identification.education_level === 'Primaria' ? 'selected' : ''}>Primaria</option>
                    <option value="Secundaria" ${identification.education_level === 'Secundaria' ? 'selected' : ''}>Secundaria</option>
                    <option value="Técnico" ${identification.education_level === 'Técnico' ? 'selected' : ''}>Técnico</option>
                    <option value="Tecnólogo" ${identification.education_level === 'Tecnólogo' ? 'selected' : ''}>Tecnólogo</option>
                    <option value="Universitario" ${identification.education_level === 'Universitario' ? 'selected' : ''}>Universitario</option>
                    <option value="Especialización" ${identification.education_level === 'Especialización' ? 'selected' : ''}>Especialización</option>
                    <option value="Maestría" ${identification.education_level === 'Maestría' ? 'selected' : ''}>Maestría</option>
                    <option value="Doctorado" ${identification.education_level === 'Doctorado' ? 'selected' : ''}>Doctorado</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Ocupación</label>
                <input type="text" id="editOccupation" class="form-control" value="${identification.occupation}" required>
            </div>

            <div class="form-group">
                <label class="form-label">País de Origen</label>
                <input type="text" id="editOriginCountry" class="form-control" value="${identification.origin_country || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Ciudad de Nacimiento</label>
                <input type="text" id="editBirthCity" class="form-control" value="${identification.birth_city || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" id="editAddress" class="form-control" value="${identification.address}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Departamento</label>
                <input type="text" id="editDepartment" class="form-control" value="${identification.department}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Ciudad de Residencia</label>
                <input type="text" id="editCity" class="form-control" value="${identification.city}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" id="editPhone" class="form-control" value="${identification.phone}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="editEmail" class="form-control" value="${identification.email || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">EPS</label>
                <input type="text" id="editEps" class="form-control" value="${identification.eps}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Tipo de Afiliación</label>
                <select id="editAffiliationType" class="form-control" required>
                    <option value="CONTRIBUTIVO" ${identification.affiliation_type === 'CONTRIBUTIVO' ? 'selected' : ''}>CONTRIBUTIVO</option>
                    <option value="SUBSIDIADO" ${identification.affiliation_type === 'SUBSIDIADO' ? 'selected' : ''}>SUBSIDIADO</option>
                    <option value="BENEFICIARIO" ${identification.affiliation_type === 'BENEFICIARIO' ? 'selected' : ''}>BENEFICIARIO</option>
                    <option value="AFILIADO" ${identification.affiliation_type === 'AFILIADO' ? 'selected' : ''}>AFILIADO</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Lateralidad</label>
                <select id="editLaterality" class="form-control" required>
                    <option value="Derecho" ${identification.laterality === 'Derecho' ? 'selected' : ''}>Derecho</option>
                    <option value="Izquierdo" ${identification.laterality === 'Izquierdo' ? 'selected' : ''}>Izquierdo</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Estrato</label>
                <select id="editEstrato" class="form-control" required>
                    <option value="1" ${identification.estrato === '1' ? 'selected' : ''}>1</option>
                    <option value="2" ${identification.estrato === '2' ? 'selected' : ''}>2</option>
                    <option value="3" ${identification.estrato === '3' ? 'selected' : ''}>3</option>
                    <option value="4" ${identification.estrato === '4' ? 'selected' : ''}>4</option>
                    <option value="5" ${identification.estrato === '5' ? 'selected' : ''}>5</option>
                    <option value="6" ${identification.estrato === '6' ? 'selected' : ''}>6</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Religión</label>
                <input type="text" id="editReligion" class="form-control" value="${identification.religion || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Acompañante</label>
                <input type="text" id="editCompanionName" class="form-control" value="${identification.companion_name || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Relación Acompañante</label>
                <input type="text" id="editCompanionRelation" class="form-control" value="${identification.companion_relation || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Teléfono Acompañante</label>
                <input type="tel" id="editCompanionPhone" class="form-control" value="${identification.companion_phone || ''}">
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Comorbilidades Actuales</label>
                <textarea id="editComorbilidadesActuales" class="form-control" rows="3">${identification.comorbilidades_actuales || ''}</textarea>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

// NUEVA: Función para editar datos iniciales del trauma
function editPatientInitialData(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    currentEditPatientId = patientId;
    editingSection = 'initial_data';

    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const content = document.getElementById('editFormContent');

    title.textContent = `Editar Datos Iniciales - ${patient.identification.fullname}`;

    const initialData = patient.initial_data || {};
    
    // Generate checkbox values for zones
    const zoneChecked = (zone) => {
        return initialData.injured_zones && initialData.injured_zones.includes(zone) ? 'checked' : '';
    };

    // Generate checkbox values for tendons
    const tendonChecked = (tendon) => {
        return initialData.compromised_flexor_tendon && initialData.compromised_flexor_tendon.includes(tendon) ? 'checked' : '';
    };

    // Generate checkbox values for associated injuries
    const injuryChecked = (injury) => {
        return initialData.associated_injuries && initialData.associated_injuries.includes(injury) ? 'checked' : '';
    };

    content.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Miembro Lesionado</label>
                <select id="editMiembroLesionado" class="form-control" required>
                    <option value="">Seleccionar</option>
                    <option value="Izquierdo" ${initialData.miembro_lesionado === 'Izquierdo' ? 'selected' : ''}>Izquierdo</option>
                    <option value="Derecho" ${initialData.miembro_lesionado === 'Derecho' ? 'selected' : ''}>Derecho</option>
                </select>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Zonas Lesionadas</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="editZone1" value="I" ${zoneChecked('I')}> Zona I</label>
                    <label><input type="checkbox" id="editZone2" value="II" ${zoneChecked('II')}> Zona II</label>
                    <label><input type="checkbox" id="editZone3" value="III" ${zoneChecked('III')}> Zona III</label>
                    <label><input type="checkbox" id="editZone4" value="IV" ${zoneChecked('IV')}> Zona IV</label>
                    <label><input type="checkbox" id="editZone5" value="V" ${zoneChecked('V')}> Zona V</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Objeto</label>
                <input type="text" id="editObject" class="form-control" value="${initialData.object || ''}" required>
            </div>

            <div class="form-group">
                <label class="form-label">Etiología</label>
                <select id="editEtiology" class="form-control" required>
                    <option value="">Seleccionar</option>
                    <option value="CORTOPUNZANTE" ${initialData.etiology === 'CORTOPUNZANTE' ? 'selected' : ''}>CORTOPUNZANTE</option>
                    <option value="CORTOCONTUNDENTE" ${initialData.etiology === 'CORTOCONTUNDENTE' ? 'selected' : ''}>CORTOCONTUNDENTE</option>
                    <option value="APLASTAMIENTO" ${initialData.etiology === 'APLASTAMIENTO' ? 'selected' : ''}>APLASTAMIENTO</option>
                    <option value="EXPLOSIVO" ${initialData.etiology === 'EXPLOSIVO' ? 'selected' : ''}>EXPLOSIVO</option>
                    <option value="CIZALLANTE" ${initialData.etiology === 'CIZALLANTE' ? 'selected' : ''}>CIZALLANTE</option>
                    <option value="COMBINADO" ${initialData.etiology === 'COMBINADO' ? 'selected' : ''}>COMBINADO</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Mecanismo del Trauma</label>
                <select id="editTraumaMechanism" class="form-control" required>
                    <option value="">Seleccionar</option>
                    <option value="ABIERTO" ${initialData.trauma_mechanism === 'ABIERTO' ? 'selected' : ''}>ABIERTO</option>
                    <option value="CERRADO" ${initialData.trauma_mechanism === 'CERRADO' ? 'selected' : ''}>CERRADO</option>
                </select>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Descripción Prequirúrgica</label>
                <textarea id="editPresurgicalDescription" class="form-control" rows="3">${initialData.presurgical_description || ''}</textarea>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Tendón Flexor Comprometido</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="editTendonFds" value="FDS" ${tendonChecked('FDS')}> FDS</label>
                    <label><input type="checkbox" id="editTendonFdp" value="FDP" ${tendonChecked('FDP')}> FDP</label>
                    <label><input type="checkbox" id="editTendonFpl" value="FPL" ${tendonChecked('FPL')}> FPL</label>
                    <label><input type="checkbox" id="editTendonFcu" value="FCU" ${tendonChecked('FCU')}> FCU</label>
                    <label><input type="checkbox" id="editTendonFcr" value="FCR" ${tendonChecked('FCR')}> FCR</label>
                    <label><input type="checkbox" id="editTendonPl" value="PL" ${tendonChecked('PL')}> PL</label>
                </div>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Descripción Tendones</label>
                <textarea id="editTendonDescription" class="form-control" rows="3">${initialData.tendon_description || ''}</textarea>
            </div>

            <div class="form-group col-span-2">
                <label class="form-label">Lesiones Asociadas</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="editInjuryNervioso" value="NERVIOSO" ${injuryChecked('NERVIOSO')}> NERVIOSO</label>
                    <label><input type="checkbox" id="editInjuryOseo" value="ÓSEO" ${injuryChecked('ÓSEO')}> ÓSEO</label>
                    <label><input type="checkbox" id="editInjuryVascular" value="VASCULAR" ${injuryChecked('VASCULAR')}> VASCULAR</label>
                    <label><input type="checkbox" id="editInjuryMuscular" value="MUSCULAR" ${injuryChecked('MUSCULAR')}> MUSCULAR</label>
                    <label><input type="checkbox" id="editInjuryLigamentaria" value="LIGAMENTARIA" ${injuryChecked('LIGAMENTARIA')}> LIGAMENTARIA</label>
                    <label><input type="checkbox" id="editInjuryCapsula" value="CÁPSULA ARTICULAR" ${injuryChecked('CÁPSULA ARTICULAR')}> CÁPSULA ARTICULAR</label>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Lesión Específica</label>
                <input type="text" id="editSpecificAssociatedInjury" class="form-control" value="${initialData.specific_associated_injury || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Tenorrafia (hilos)</label>
                <input type="text" id="editTenorrhaphyThreads" class="form-control" value="${initialData.tenorrhaphy_threads || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Tipo de Reparación</label>
                <select id="editRepairType" class="form-control">
                    <option value="">Seleccionar</option>
                    <option value="CENTRAL" ${initialData.repair_type === 'CENTRAL' ? 'selected' : ''}>CENTRAL</option>
                    <option value="EPITENDINOSA" ${initialData.repair_type === 'EPITENDINOSA' ? 'selected' : ''}>EPITENDINOSA</option>
                    <option value="MIXTA" ${initialData.repair_type === 'MIXTA' ? 'selected' : ''}>MIXTA</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Técnica de Reparación</label>
                <input type="text" id="editRepairTechnique" class="form-control" value="${initialData.repair_technique || ''}">
            </div>

            <div class="form-group">
                <label class="form-label">Tenolisis</label>
                <select id="editTenolysis" class="form-control">
                    <option value="">Seleccionar</option>
                    <option value="Sí" ${initialData.tenolysis === 'Sí' ? 'selected' : ''}>Sí</option>
                    <option value="No" ${initialData.tenolysis === 'No' ? 'selected' : ''}>No</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Fecha Quirúrgica</label>
                <input type="date" id="editSurgeryDate" class="form-control" value="${initialData.surgery_date || ''}" onchange="calculateEditDaysToSurgery()">
            </div>

            <div class="form-group">
                <label class="form-label">Días para Cirugía</label>
                <input type="number" id="editDaysToSurgery" class="form-control" value="${initialData.days_to_surgery || 0}" readonly>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

// NUEVA: Función para editar controles de seguimiento
function editPatientFollowUps(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    currentEditPatientId = patientId;
    editingSection = 'followups';

    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const content = document.getElementById('editFormContent');

    title.textContent = `Editar Controles - ${patient.identification.fullname}`;

    const followUps = patient.followups || [];
    
    let html = `
        <div class="edit-followups-container">
            <h4>Controles de Seguimiento Registrados</h4>
    `;

    if (followUps.length === 0) {
        html += '<p>No hay controles de seguimiento registrados para este paciente.</p>';
    } else {
        followUps.forEach((followUp, index) => {
            html += `
                <div class="edit-followup-item">
                    <div class="edit-followup-header">
                        <h5>Control - Semana ${followUp.week}</h5>
                        <span>${formatDate(followUp.date)}</span>
                        <button type="button" class="btn btn--sm btn--primary" onclick="editSpecificFollowUp(${index})">Editar</button>
                        <button type="button" class="btn btn--sm btn--danger" onclick="deleteFollowUp(${index})">Eliminar</button>
                    </div>
                    <div class="edit-followup-summary">
                        <p><strong>Protocolo:</strong> ${followUp.protocol || 'No especificado'}</p>
                        <p><strong>Terapias Completas:</strong> ${followUp.complete_therapies ? 'Sí' : 'No'}</p>
                        <p><strong>Complicaciones:</strong> ${followUp.complicaciones || 'Ninguna'}</p>
                        <p><strong>Quick DASH:</strong> ${followUp.quickdash_score?.toFixed(2) || 'No calculado'}</p>
                        <p><strong>Strickland:</strong> ${followUp.strickland_result?.toFixed(1) || 'No calculado'}%</p>
                    </div>
                </div>
            `;
        });
    }
    
    html += `
        </div>
        <div class="add-followup-section">
            <button type="button" class="btn btn--success" onclick="addNewFollowUp()">Agregar Nuevo Control</button>
        </div>
    `;

    content.innerHTML = html;
    modal.classList.remove('hidden');
}

// Función auxiliar para calcular días hasta cirugía en edición
function calculateEditDaysToSurgery() {
    const admissionDate = document.getElementById('editAdmissionDate')?.value;
    const surgeryDate = document.getElementById('editSurgeryDate')?.value;
    const daysField = document.getElementById('editDaysToSurgery');

    if (admissionDate && surgeryDate && daysField) {
        const admission = new Date(admissionDate);
        const surgery = new Date(surgeryDate);
        const diffTime = surgery - admission;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysField.value = Math.max(0, diffDays);
    }
}

// Función para cerrar el modal de edición
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
    currentEditPatientId = null;
    editingSection = null;
}

// Función para manejar el envío del formulario de edición
function handleEditSubmit(event) {
    event.preventDefault();
    
    if (!currentEditPatientId || !editingSection) {
        showAlert('Error: No hay datos de edición válidos', 'error');
        return;
    }

    const patient = patients.find(p => p.id === currentEditPatientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    if (editingSection === 'identification') {
        saveIdentificationEdit(patient);
    } else if (editingSection === 'initial_data') {
        saveInitialDataEdit(patient);
    } else if (editingSection === 'followups') {
        // Los controles de seguimiento se manejan por separado
        closeEditModal();
        return;
    }
}

// Función para guardar cambios de identificación
function saveIdentificationEdit(patient) {
    try {
        patient.identification = {
            ...patient.identification,
            admission_date: document.getElementById('editAdmissionDate').value,
            evolution_time_hours: parseInt(document.getElementById('editEvolutionTime').value),
            fullname: document.getElementById('editFullName').value,
            document_type: document.getElementById('editDocumentType').value,
            document_number: document.getElementById('editDocumentNumber').value,
            age: parseInt(document.getElementById('editAge').value),
            sex: document.getElementById('editSex').value,
            education_level: document.getElementById('editEducationLevel').value,
            occupation: document.getElementById('editOccupation').value,
            origin_country: document.getElementById('editOriginCountry').value,
            birth_city: document.getElementById('editBirthCity').value,
            address: document.getElementById('editAddress').value,
            department: document.getElementById('editDepartment').value,
            city: document.getElementById('editCity').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value,
            eps: document.getElementById('editEps').value,
            affiliation_type: document.getElementById('editAffiliationType').value,
            laterality: document.getElementById('editLaterality').value,
            estrato: document.getElementById('editEstrato').value,
            religion: document.getElementById('editReligion').value,
            companion_name: document.getElementById('editCompanionName').value,
            companion_relation: document.getElementById('editCompanionRelation').value,
            companion_phone: document.getElementById('editCompanionPhone').value,
            comorbilidades_actuales: document.getElementById('editComorbilidadesActuales').value
        };

        // Add audit trail
        if (!patient.audit_trail) {
            patient.audit_trail = [];
        }
        patient.audit_trail.push({
            timestamp: new Date().toISOString(),
            doctor_id: currentUser.id,
            doctor_name: currentUser.name,
            action: 'Modificación',
            section: 'Identificación del paciente',
            changes: 'Información de identificación actualizada'
        });

        savePatients();
        showAlert('Información de identificación actualizada exitosamente', 'success');
        closeEditModal();
        loadEditablePatientsList(); // Refresh the list
    } catch (error) {
        console.error('Error guardando identificación:', error);
        showAlert('Error al guardar los cambios', 'error');
    }
}

// Función para guardar cambios de datos iniciales
function saveInitialDataEdit(patient) {
    try {
        // Collect injured zones
        const injuredZones = [];
        ['I', 'II', 'III', 'IV', 'V'].forEach((zone, index) => {
            const checkbox = document.getElementById(`editZone${index + 1}`);
            if (checkbox && checkbox.checked) {
                injuredZones.push(zone);
            }
        });

        // Collect compromised tendons
        const compromisedTendons = [];
        ['FDS', 'FDP', 'FPL', 'FCU', 'FCR', 'PL'].forEach(tendon => {
            const checkbox = document.getElementById(`editTendon${tendon.toLowerCase().charAt(0).toUpperCase() + tendon.toLowerCase().slice(1)}`);
            if (checkbox && checkbox.checked) {
                compromisedTendons.push(tendon);
            }
        });

        // Collect associated injuries
        const associatedInjuries = [];
        ['NERVIOSO', 'ÓSEO', 'VASCULAR', 'MUSCULAR', 'LIGAMENTARIA', 'CÁPSULA ARTICULAR'].forEach(injury => {
            const injuryKey = injury.replace('Ó', 'o').replace(' ', '').toLowerCase();
            const checkbox = document.getElementById(`editInjury${injury.charAt(0).toUpperCase() + injuryKey.slice(1)}`);
            if (checkbox && checkbox.checked) {
                associatedInjuries.push(injury);
            }
        });

        if (!patient.initial_data) {
            patient.initial_data = {};
        }

        patient.initial_data = {
            ...patient.initial_data,
            miembro_lesionado: document.getElementById('editMiembroLesionado').value,
            injured_zones: injuredZones,
            object: document.getElementById('editObject').value,
            etiology: document.getElementById('editEtiology').value,
            trauma_mechanism: document.getElementById('editTraumaMechanism').value,
            presurgical_description: document.getElementById('editPresurgicalDescription').value,
            compromised_flexor_tendon: compromisedTendons,
            tendon_description: document.getElementById('editTendonDescription').value,
            associated_injuries: associatedInjuries,
            specific_associated_injury: document.getElementById('editSpecificAssociatedInjury').value,
            tenorrhaphy_threads: document.getElementById('editTenorrhaphyThreads').value,
            repair_type: document.getElementById('editRepairType').value,
            repair_technique: document.getElementById('editRepairTechnique').value,
            tenolysis: document.getElementById('editTenolysis').value,
            surgery_date: document.getElementById('editSurgeryDate').value,
            days_to_surgery: parseInt(document.getElementById('editDaysToSurgery').value) || 0
        };

        // Add audit trail
        if (!patient.audit_trail) {
            patient.audit_trail = [];
        }
        patient.audit_trail.push({
            timestamp: new Date().toISOString(),
            doctor_id: currentUser.id,
            doctor_name: currentUser.name,
            action: 'Modificación',
            section: 'Datos iniciales del trauma',
            changes: 'Información de datos iniciales actualizada'
        });

        savePatients();
        showAlert('Datos iniciales actualizados exitosamente', 'success');
        closeEditModal();
        loadEditablePatientsList(); // Refresh the list
    } catch (error) {
        console.error('Error guardando datos iniciales:', error);
        showAlert('Error al guardar los cambios', 'error');
    }
}

// Search functions
function searchPatients() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput || !resultsContainer) {
        console.log('Elementos de búsqueda no encontrados');
        return;
    }

    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<div class="no-results"><p>Ingrese un término de búsqueda</p></div>';
        return;
    }

    const results = patients.filter(patient => 
        patient.identification.fullname.toLowerCase().includes(searchTerm) ||
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
        patient.identification.fullname.toLowerCase().includes(searchTerm) ||
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
        <div class="search-result-item" onclick="showIndividualClinicalHistory('${patient.id}')">
            <h4>${patient.identification.fullname}</h4>
            <p><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</p>
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No especificada'}</p>
            <p><strong>Miembro lesionado:</strong> ${patient.initial_data?.miembro_lesionado || 'No especificado'}</p>
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
            <h4>${patient.identification.fullname}</h4>
            <p><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</p>
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No especificada'}</p>
            <p><strong>Miembro lesionado:</strong> ${patient.initial_data?.miembro_lesionado || 'No especificado'}</p>
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

        if (nameElement) {
            nameElement.textContent = patient.identification.fullname;
        }
        if (formElement) {
            formElement.classList.remove('hidden');
        }
        if (selectionElement) {
            selectionElement.style.display = 'none';
        }

        // Reset and clear the follow-up form
        const weekSelect = document.getElementById('followUpWeek');
        if (weekSelect) {
            weekSelect.value = '';
            weekSelect.focus(); // Focus on the select to make it obvious
        }

        clearFollowUpForm();
        generateGoniometryGrid();
        generateQuickDashQuestions();
    }
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

    if (formElement) {
        formElement.classList.add('hidden');
    }
    if (selectionElement) {
        selectionElement.style.display = 'block';
    }
    if (searchElement) {
        searchElement.value = '';
    }
    if (resultsElement) {
        resultsElement.innerHTML = '';
    }

    clearFollowUpForm();
}

function clearFollowUpForm() {
    const form = document.getElementById('followUpForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.id !== 'followUpWeek') { // Don't clear the week selector
                input.value = '';
            }
        });

        toggleIncompleteReason();
        toggleReturnTimeField();

        // Clear TAM results
        const tamResultsContainer = document.getElementById('tamByFingerResults');
        if (tamResultsContainer) {
            tamResultsContainer.innerHTML = '';
        }
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

// MODIFICADO: Goniometry Grid sin columna "Déficit Ext" con diseño mejorado
function generateGoniometryGrid() {
    const container = document.getElementById('goniometryMeasurements');
    if (!container) return;

    let html = `
        <div class="gonio-header">Dedo</div>
        <div class="gonio-header">MCF</div>
        <div class="gonio-header">IFP</div>
        <div class="gonio-header">IFD</div>
    `;

    appData.fingers.forEach(finger => {
        html += `<div class="gonio-label">${finger.name}</div>`;
        
        // MCF joint
        const mcfInputId = `gonio${finger.number}MCF`;
        html += `<input type="number" id="${mcfInputId}" class="gonio-input" min="0" max="180" placeholder="0" onchange="calculateTAMByFingerAndStrickland()">`;
        
        // IFP joint  
        const ifpInputId = `gonio${finger.number}IFP`;
        html += `<input type="number" id="${ifpInputId}" class="gonio-input" min="0" max="180" placeholder="0" onchange="calculateTAMByFingerAndStrickland()">`;
        
        // IFD joint - Skip for thumb (finger 1)
        if (finger.number === 1) {
            html += `<div class="gonio-label" style="background: #f0f0f0; color: #999;">N/A</div>`; // Empty cell for thumb IFD
        } else {
            const ifdInputId = `gonio${finger.number}IFD`;
            html += `<input type="number" id="${ifdInputId}" class="gonio-input" min="0" max="180" placeholder="0" onchange="calculateTAMByFingerAndStrickland()">`;
        }
    });

    container.innerHTML = html;
}

// MODIFICADO: TAM calculation sin déficit de extensión
function calculateTAMByFingerAndStrickland() {
    const resultsContainer = document.getElementById('tamByFingerResults');
    if (!resultsContainer) return;

    let totalStrickland = 0;
    let fingerCount = 0;
    let tamByFinger = {};

    let html = '';

    appData.fingers.forEach(finger => {
        const mcf = parseFloat(document.getElementById(`gonio${finger.number}MCF`)?.value) || 0;
        const ifp = parseFloat(document.getElementById(`gonio${finger.number}IFP`)?.value) || 0;
        const ifd = finger.number === 1 ? 0 : parseFloat(document.getElementById(`gonio${finger.number}IFD`)?.value) || 0;

        // Calculate TAM for this finger (sin déficit de extensión)
        const fingerTAM = mcf + ifp + ifd;
        const normalTAM = appData.tam_normal_values[finger.number];
        const tamPercentage = (fingerTAM / normalTAM) * 100;

        // Store TAM data for later use
        tamByFinger[`finger${finger.number}`] = {
            tam: fingerTAM,
            percentage: tamPercentage,
            classification: getClassificationText(tamPercentage)
        };

        // Generate HTML for this finger
        html += `
            <div class="tam-finger-card">
                <div class="tam-finger-title">${finger.name}</div>
                <div class="tam-finger-score">${fingerTAM}°</div>
                <div class="tam-finger-percentage">${tamPercentage.toFixed(1)}% de normal</div>
                <div class="tam-finger-classification ${getClassificationClass(tamPercentage)}">${getClassificationText(tamPercentage)}</div>
            </div>
        `;

        // Calculate Strickland for fingers 2-5
        if (finger.number > 1) {
            if (ifp > 0 && ifd > 0) {
                const stricklandValue = ((ifp + ifd) / 175) * 100;
                totalStrickland += stricklandValue;
                fingerCount++;
            }
        }
    });

    resultsContainer.innerHTML = html;

    // Update Strickland results
    const stricklandResult = document.getElementById('stricklandResult');
    const stricklandClassification = document.getElementById('stricklandClassification');
    const avgStrickland = fingerCount > 0 ? totalStrickland / fingerCount : 0;

    if (stricklandResult) {
        stricklandResult.value = Math.round(avgStrickland);
    }

    // Strickland classification
    let classification = '';
    if (avgStrickland >= 85) {
        classification = 'Excelente (85-100%)';
    } else if (avgStrickland >= 70) {
        classification = 'Bueno (70-84%)';
    } else if (avgStrickland >= 50) {
        classification = 'Regular (50-69%)';
    } else {
        classification = 'Pobre (<50%)';
    }

    if (stricklandClassification) {
        stricklandClassification.value = classification;
    }

    // Store TAM by finger data for form submission
    window.currentTAMByFinger = tamByFinger;
}

// Classification helper functions
function getClassificationClass(percentage) {
    if (percentage >= 85) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'regular';
    return 'poor';
}

function getClassificationText(percentage) {
    if (percentage >= 85) return 'Excelente';
    if (percentage >= 70) return 'Bueno';
    if (percentage >= 50) return 'Regular';
    return 'Pobre';
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
                        <input type="radio" name="quickdash${index}" value="1" onchange="calculateQuickDash()">
                        1 - Ninguna dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash${index}" value="2" onchange="calculateQuickDash()">
                        2 - Leve dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash${index}" value="3" onchange="calculateQuickDash()">
                        3 - Moderada dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash${index}" value="4" onchange="calculateQuickDash()">
                        4 - Severa dificultad
                    </label>
                    <label class="quickdash-option">
                        <input type="radio" name="quickdash${index}" value="5" onchange="calculateQuickDash()">
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

    appData.quickdash_questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="quickdash${index}"]:checked`);
        if (selectedOption) {
            totalScore += parseInt(selectedOption.value);
            answeredQuestions++;
        }
    });

    if (answeredQuestions < 10) { // Need at least 10 out of 11 questions answered
        document.getElementById('quickDashScore').value = '';
        document.getElementById('dashDisabilityGrade').value = '';
        return;
    }

    // QuickDASH formula: ((sum of responses / number of responses) - 1) * 25
    const quickDashScore = ((totalScore / answeredQuestions) - 1) * 25;
    document.getElementById('quickDashScore').value = Math.round(quickDashScore * 100) / 100;

    // Disability grade
    let disabilityGrade = '';
    if (quickDashScore < 20) {
        disabilityGrade = 'Leve (<20)';
    } else if (quickDashScore < 40) {
        disabilityGrade = 'Moderado (20-40)';
    } else {
        disabilityGrade = 'Severo (>40)';
    }

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

// MODIFICADO: Collect patient data con nuevos campos incluyendo miembro lesionado
function collectNewPatientData() {
    // Collect compromised tendons
    const compromisedTendons = [];
    ['fds', 'fdp', 'fpl', 'fcu', 'fcr', 'pl'].forEach(tendon => {
        const checkbox = document.getElementById(`tendon${tendon}`);
        if (checkbox && checkbox.checked) {
            compromisedTendons.push(tendon.toUpperCase());
        }
    });

    // Collect associated injuries
    const associatedInjuries = [];
    ['nervioso', 'oseo', 'vascular', 'muscular', 'ligamentaria', 'capsula'].forEach(injury => {
        const checkbox = document.getElementById(`injury${injury}`);
        if (checkbox && checkbox.checked) {
            associatedInjuries.push(injury === 'capsula' ? 'CÁPSULA ARTICULAR' : injury.toUpperCase());
        }
    });

    // Collect injured zones (MULTIPLE ZONES SUPPORT)
    const injuredZones = [];
    [1, 2, 3, 4, 5].forEach(zone => {
        const checkbox = document.getElementById(`zone${zone}`);
        if (checkbox && checkbox.checked) {
            injuredZones.push(zone === 1 ? 'I' : zone === 2 ? 'II' : zone === 3 ? 'III' : zone === 4 ? 'IV' : 'V');
        }
    });

    return {
        identification: {
            admission_date: document.getElementById('admissionDate').value,
            evolution_time_hours: parseInt(document.getElementById('evolutionTime').value),
            fullname: document.getElementById('fullName').value,
            document_type: document.getElementById('documentType').value,
            document_number: document.getElementById('documentNumber').value,
            age: parseInt(document.getElementById('age').value),
            sex: document.getElementById('sex').value,
            education_level: document.getElementById('educationLevel').value,
            occupation: document.getElementById('occupation').value,
            origin_country: document.getElementById('originCountry').value,
            birth_city: document.getElementById('birthCity').value,
            address: document.getElementById('address').value,
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            eps: document.getElementById('eps').value,
            affiliation_type: document.getElementById('affiliationType').value,
            laterality: document.getElementById('laterality').value,
            religion: document.getElementById('religion').value,
            companion_name: document.getElementById('companionName').value,
            companion_relation: document.getElementById('companionRelation').value,
            companion_phone: document.getElementById('companionPhone').value,
            
            // NUEVOS CAMPOS AGREGADOS
            estrato: document.getElementById('estrato').value,
            comorbilidades_actuales: document.getElementById('comorbilidadesActuales').value
        },
        initial_data: {
            // NUEVO CAMPO: Miembro lesionado
            miembro_lesionado: document.getElementById('miembroLesionado').value,
            
            compromised_flexor_tendon: compromisedTendons,
            injured_zones: injuredZones, // CORRECTED Multiple zones support
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
                median: parseFloat(document.getElementById('bmrcSensoryMedian').value) || 0,
                ulnar: parseFloat(document.getElementById('bmrcSensoryUlnar').value) || 0,
                radial: parseFloat(document.getElementById('bmrcSensoryRadial').value) || 0
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
        followups: []
    };
}

// MODIFICADO: Collect follow-up data con nuevos campos
function collectFollowUpData() {
    // Collect QuickDASH responses
    const quickDashResponses = [];
    appData.quickdash_questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="quickdash${index}"]:checked`);
        if (selectedOption) {
            quickDashResponses.push(parseInt(selectedOption.value));
        }
    });

    // Collect goniometry data
    const goniometry = {};
    appData.fingers.forEach(finger => {
        goniometry[`finger${finger.number}`] = {
            mcf: parseFloat(document.getElementById(`gonio${finger.number}MCF`)?.value) || 0,
            ifp: parseFloat(document.getElementById(`gonio${finger.number}IFP`)?.value) || 0,
            ifd: finger.number === 1 ? 0 : parseFloat(document.getElementById(`gonio${finger.number}IFD`)?.value) || 0
            // ELIMINADO: déficit de extensión
        };
    });

    return {
        week: parseInt(document.getElementById('followUpWeek').value),
        date: new Date().toISOString().split('T')[0],
        protocol: document.getElementById('protocolUsed').value,
        complete_therapies: document.getElementById('completeTherapies').value === 'true',
        incomplete_reason: document.getElementById('incompleteReason').value,
        goniometry: goniometry,
        tam_by_finger: window.currentTAMByFinger || {},
        strickland_result: parseFloat(document.getElementById('stricklandResult').value) || 0,
        strickland_classification: document.getElementById('stricklandClassification').value,
        quickdash_responses: quickDashResponses,
        quickdash_score: parseFloat(document.getElementById('quickDashScore').value) || 0,
        dash_disability_grade: document.getElementById('dashDisabilityGrade').value,
        return_to_previous_occupation: document.getElementById('returnToPreviousOccupation').value === 'true',
        occupation_change: document.getElementById('occupationChange').value,
        return_time_months: parseInt(document.getElementById('returnTimeMonths').value) || 0,
        
        // NUEVOS CAMPOS AGREGADOS
        complicaciones: document.getElementById('complicaciones').value,
        reintervencion_quirurgica: document.getElementById('reintervencionQuirurgica').value,
        
        bmrc_sensory: {
            median: parseFloat(document.getElementById('followUpBmrcSensoryMedian').value) || 0,
            ulnar: parseFloat(document.getElementById('followUpBmrcSensoryUlnar').value) || 0,
            radial: parseFloat(document.getElementById('followUpBmrcSensoryRadial').value) || 0
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

// MODIFICADO: CSV export con todas las variables incluidas
function generateCSVData() {
    const headers = [
        'ID Paciente', 'Nombre Completo', 'Documento', 'Edad', 'Sexo', 'Nivel Educativo', 
        'Ocupación', 'País Origen', 'Ciudad Nacimiento', 'Departamento', 'Ciudad Residencia',
        'Lateralidad', 'Estrato', 'Comorbilidades Actuales', 'Miembro Lesionado',
        'Fecha Ingreso', 'Zona(s) Lesionada(s)', 'Objeto', 'Etiología', 'Mecanismo Trauma',
        'Fecha Cirugía', 'Días para Cirugía', 'Tendones Comprometidos', 'Técnica Reparación',
        'Lesiones Asociadas', 'Médico Registro', 'Fecha Registro'
    ];

    // Add TAM by finger headers
    appData.fingers.forEach(finger => {
        headers.push(`TAM ${finger.name}`, `TAM ${finger.name} %`);
    });

    // Add follow-up headers with new fields
    appData.follow_up_weeks.forEach(week => {
        headers.push(
            `Control ${week}sem - Fecha`, 
            `Control ${week}sem - Protocolo`, 
            `Control ${week}sem - Strickland`, 
            `Control ${week}sem - Quick DASH`, 
            `Control ${week}sem - Discapacidad`, 
            `Control ${week}sem - Retorno Laboral`,
            `Control ${week}sem - Complicaciones`,
            `Control ${week}sem - Reintervención`,
            `Control ${week}sem - Médico`
        );
    });

    const rows = [headers];
    patients.forEach(patient => {
        const row = [
            patient.id,
            patient.identification.fullname,
            `${patient.identification.document_type} - ${patient.identification.document_number}`,
            patient.identification.age,
            patient.identification.sex,
            patient.identification.education_level || '', // AGREGADO
            patient.identification.occupation,
            patient.identification.origin_country || '',
            patient.identification.birth_city || '', // AGREGADO
            patient.identification.department || '', // AGREGADO
            patient.identification.city || '', // AGREGADO
            patient.identification.laterality || '',
            patient.identification.estrato || '', // NUEVO
            patient.identification.comorbilidades_actuales || '', // NUEVO
            patient.initial_data?.miembro_lesionado || '', // NUEVO
            patient.identification.admission_date,
            patient.initial_data?.injured_zones ? patient.initial_data.injured_zones.join(',') : '',
            patient.initial_data?.object || '',
            patient.initial_data?.etiology || '',
            patient.initial_data?.trauma_mechanism || '',
            patient.initial_data?.surgery_date || '',
            patient.initial_data?.days_to_surgery || '',
            patient.initial_data?.compromised_flexor_tendon?.join(',') || '',
            patient.initial_data?.repair_technique || '',
            patient.initial_data?.associated_injuries?.join(',') || '',
            patient.created_by?.name || '',
            patient.created_at ? formatDate(patient.created_at) : ''
        ];

        // Add latest TAM by finger data
        const latestFollowUp = patient.followups && patient.followups.length > 0 ? 
            patient.followups[patient.followups.length - 1] : null;
        
        appData.fingers.forEach(finger => {
            const tamData = latestFollowUp?.tam_by_finger?.[`finger${finger.number}`];
            row.push(
                tamData?.tam || '',
                tamData?.percentage?.toFixed(1) || ''
            );
        });

        // Add follow-up data with new fields
        appData.follow_up_weeks.forEach(week => {
            const followUp = patient.followups?.find(fu => fu.week == week);
            if (followUp) {
                row.push(
                    followUp.date || '',
                    followUp.protocol || '',
                    followUp.strickland_result || '',
                    followUp.quickdash_score || '',
                    followUp.dash_disability_grade || '',
                    followUp.return_to_previous_occupation ? 'Sí' : 'No',
                    followUp.complicaciones || '', // NUEVO
                    followUp.reintervencion_quirurgica || '', // NUEVO
                    followUp.created_by?.name || followUp.modified_by?.name || ''
                );
            } else {
                row.push('', '', '', '', '', '', '', '', '');
            }
        });

        rows.push(row);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Export functionality with automatic download
function exportData() {
    if (patients.length === 0) {
        showAlert('No hay datos para exportar', 'warning');
        return;
    }

    console.log('Iniciando exportación de datos...');
    try {
        const csvData = generateCSVData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `tendones-flexores-${timestamp}.csv`;

        // Create and trigger automatic download
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
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

// MODIFICADO: Template para portapapeles con formato más organizado
function generateCompleteHistoryTemplate(patient) {
    const getBmrcDescription = (value, scale) => {
        const scaleData = scale === 'motor' ? appData.bmrc_motor_scale : appData.bmrc_sensory_scale;
        const item = scaleData.find(s => s.value == value);
        return item ? item.description : 'No evaluado';
    };

    const latestFollowUp = patient.followups && patient.followups.length > 0 ? 
        patient.followups[patient.followups.length - 1] : null;

    return `
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                           HISTORIA CLÍNICA COMPLETA - TENDONES FLEXORES                         ║
╠══════════════════════════════════════════════════════════════════════════════════════╣

█ IDENTIFICACIÓN DEL PACIENTE █

• Fecha de Ingreso:           ${formatDate(patient.identification.admission_date)}
• Tiempo de Evolución:        ${patient.identification.evolution_time_hours} horas
• Nombre Completo:           ${patient.identification.fullname}
• Documento:                 ${patient.identification.document_type} - ${patient.identification.document_number}
• Edad:                      ${patient.identification.age} años
• Sexo:                      ${patient.identification.sex}
• Nivel Educativo:           ${patient.identification.education_level}
• Ocupación:                 ${patient.identification.occupation}
• País de Origen:            ${patient.identification.origin_country || 'No registrado'}
• Ciudad de Nacimiento:      ${patient.identification.birth_city}
• Dirección:                 ${patient.identification.address}
• Departamento:              ${patient.identification.department}
• Ciudad de Residencia:      ${patient.identification.city}
• Teléfono:                  ${patient.identification.phone}
• Email:                     ${patient.identification.email || 'No registrado'}
• EPS:                       ${patient.identification.eps}
• Tipo de Afiliación:        ${patient.identification.affiliation_type}
• Lateralidad:               ${patient.identification.laterality || 'No registrada'}
• Religión:                  ${patient.identification.religion || 'No registrada'}
• Estrato:                   ${patient.identification.estrato || 'No registrado'}
• Comorbilidades Actuales:   ${patient.identification.comorbilidades_actuales || 'No registradas'}

▼ DATOS DEL ACOMPAÑANTE
• Nombre:                    ${patient.identification.companion_name || 'No registrado'}
• Relación:                  ${patient.identification.companion_relation || 'No registrada'}
• Teléfono:                  ${patient.identification.companion_phone || 'No registrado'}

──────────────────────────────────────────────────────────────────────────────────────

█ DATOS INICIALES DEL TRAUMA █

• Miembro Lesionado:         ${patient.initial_data?.miembro_lesionado || 'No registrado'}
• Zonas Lesionadas:          ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No registradas'}
• Objeto:                    ${patient.initial_data?.object || 'No registrado'}
• Etiología:                 ${patient.initial_data?.etiology || 'No registrada'}
• Mecanismo de Trauma:       ${patient.initial_data?.trauma_mechanism || 'No registrado'}
• Descripción Prequirúrgica: ${patient.initial_data?.presurgical_description || 'No registrada'}
• Tendones Flexores Comprometidos: ${patient.initial_data?.compromised_flexor_tendon?.join(', ') || 'No registrados'}
• Descripción Tendones:      ${patient.initial_data?.tendon_description || 'No registrada'}
• Lesiones Asociadas:        ${patient.initial_data?.associated_injuries?.join(', ') || 'Ninguna'}
• Lesión Asociada Específica: ${patient.initial_data?.specific_associated_injury || 'Ninguna'}
• Tenorrafia (hilos):        ${patient.initial_data?.tenorrhaphy_threads || 'No registrado'}
• Tipo de Reparación:        ${patient.initial_data?.repair_type || 'No registrado'}
• Técnica de Reparación:     ${patient.initial_data?.repair_technique || 'No registrada'}
• Tenolisis:                 ${patient.initial_data?.tenolysis || 'No registrada'}
• Fecha Quirúrgica:          ${formatDate(patient.initial_data?.surgery_date)}
• Días para Cirugía:         ${patient.initial_data?.days_to_surgery || 0} días

──────────────────────────────────────────────────────────────────────────────────────

█ ÚLTIMO CONTROL DE SEGUIMIENTO █

${latestFollowUp ? `
• Semana de Control:         ${latestFollowUp.week}
• Fecha de Control:          ${formatDate(latestFollowUp.date)}
• Protocolo Utilizado:       ${latestFollowUp.protocol || 'No especificado'}
• Terapias Completas:        ${latestFollowUp.complete_therapies ? 'Sí' : 'No'}
• Complicaciones:            ${latestFollowUp.complicaciones || 'Ninguna'}
• Reintervención Quirúrgica: ${latestFollowUp.reintervencion_quirurgica || 'No especificada'}

▼ EVALUACIONES FUNCIONALES
• Quick DASH Score:          ${latestFollowUp.quickdash_score?.toFixed(2) || 'No calculado'}
• Clasificación Strickland:  ${latestFollowUp.strickland_result?.toFixed(1) || 'No calculado'}%
• Grado de Discapacidad:     ${latestFollowUp.dash_disability_grade || 'No calculado'}
• Retorno Laboral:           ${latestFollowUp.return_to_previous_occupation ? 'Sí' : 'No'}

▼ MEDICIONES GONIOMÉTRICAS (TAM por dedo)
${appData.fingers.map(finger => {
    const tamData = latestFollowUp?.tam_by_finger?.[`finger${finger.number}`];
    return `• ${finger.name}: ${tamData?.tam || 'No evaluado'}° (${tamData?.percentage?.toFixed(1) || 'N/A'}% - ${tamData?.classification || 'N/A'})`;
}).join('\n')}
` : '⚠️  No hay controles de seguimiento registrados.'}

──────────────────────────────────────────────────────────────────────────────────────

█ INFORMACIÓN DEL REGISTRO █

• Médico Registrante:        Dr(a). ${patient.created_by?.name || 'No especificado'}
• Fecha de Registro:         ${formatDate(patient.created_at)}
• ID del Paciente:           ${patient.id}

╚══════════════════════════════════════════════════════════════════════════════════════╝

Sistema de Evaluación - Tendones Flexores
Generado el: ${formatDateTime(new Date().toISOString())}
    `.trim();
}

// Copy to clipboard functions
function copyCompleteHistory() {
    if (!selectedPatientId) {
        showAlert('No hay paciente seleccionado', 'error');
        return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    const template = generateCompleteHistoryTemplate(patient);

    try {
        // Use the modern Clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(template).then(() => {
                showAlert('Historia clínica completa copiada al portapapeles exitosamente', 'success');
            }).catch(err => {
                console.error('Error copying to clipboard:', err);
                fallbackCopyTextToClipboard(template);
            });
        } else {
            // Fallback for older browsers
            fallbackCopyTextToClipboard(template);
        }
    } catch (error) {
        console.error('Error copiando historia:', error);
        showAlert('Error al copiar historia clínica', 'error');
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showAlert('Historia clínica completa copiada al portapapeles exitosamente', 'success');
    } catch (err) {
        console.error('Error copying text:', err);
        showAlert('Error al copiar historia clínica', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

// Dashboard update function
function updateDashboard() {
    // Actualizar estadísticas
    document.getElementById('totalPacientes').textContent = patients.length;
    
    // Calcular controles pendientes (simplificado)
    let controlesPendientes = 0;
    let pacientesIncompletos = 0;
    
    patients.forEach(patient => {
        if (!patient.followups || patient.followups.length < 4) {
            controlesPendientes++;
        }
        if (patient.followups && patient.followups.some(fu => !fu.complete_therapies)) {
            pacientesIncompletos++;
        }
    });
    
    document.getElementById('controlesPendientes').textContent = controlesPendientes;
    document.getElementById('pacientesIncompletos').textContent = pacientesIncompletos;
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
    patientData.audit_trail = [{
        timestamp: new Date().toISOString(),
        doctor_id: currentUser.id,
        doctor_name: currentUser.name,
        action: 'Creación',
        section: 'Registro inicial',
        changes: 'Paciente registrado'
    }];

    patients.push(patientData);
    savePatients();
    updateDashboard();

    showAlert('Paciente registrado exitosamente', 'success');
    document.getElementById('newPatientForm').reset();
    initializeDateFields();
    showSection('dashboard');
}

function handleFollowUpSubmit(event) {
    event.preventDefault();
    console.log('Procesando seguimiento...');

    if (!currentUser) {
        showAlert('Debe estar autenticado para registrar controles', 'error');
        return;
    }

    if (!selectedPatientId) {
        showAlert('Debe seleccionar un paciente', 'error');
        return;
    }

    if (!validateFollowUpForm()) {
        return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) {
        showAlert('Paciente no encontrado', 'error');
        return;
    }

    const followUpData = collectFollowUpData();
    followUpData.created_by = currentUser;
    followUpData.created_at = new Date().toISOString();

    if (!patient.followups) {
        patient.followups = [];
    }

    // Check if follow-up for this week already exists
    const existingIndex = patient.followups.findIndex(fu => fu.week === followUpData.week);
    if (existingIndex >= 0) {
        followUpData.modified_by = currentUser;
        followUpData.modified_at = new Date().toISOString();
        patient.followups[existingIndex] = followUpData;
        showAlert('Control de seguimiento actualizado exitosamente', 'success');
    } else {
        patient.followups.push(followUpData);
        showAlert('Control de seguimiento registrado exitosamente', 'success');
    }

    // Add audit trail
    if (!patient.audit_trail) {
        patient.audit_trail = [];
    }
    patient.audit_trail.push({
        timestamp: new Date().toISOString(),
        doctor_id: currentUser.id,
        doctor_name: currentUser.name,
        action: existingIndex >= 0 ? 'Modificación' : 'Creación',
        section: `Control Semana ${followUpData.week}`,
        changes: 'Control de seguimiento procesado'
    });

    savePatients();
    updateDashboard();
    cancelFollowUp();
    showSection('dashboard');
}

function validateNewPatientForm() {
    const requiredFields = ['admissionDate', 'evolutionTime', 'fullName', 'documentType', 'documentNumber', 'age', 'sex', 'educationLevel', 'occupation', 'originCountry', 'birthCity', 'address', 'department', 'city', 'phone', 'eps', 'affiliationType', 'laterality', 'object', 'etiology', 'traumaMechanism', 'estrato', 'miembroLesionado'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            const label = field?.labels?.[0]?.textContent || field?.previousElementSibling?.textContent || fieldId;
            showAlert(`El campo ${label} es requerido`, 'error');
            field?.focus();
            return false;
        }
    }

    // Validate that at least one zone is selected
    const hasZone = [1, 2, 3, 4, 5].some(zone => {
        const checkbox = document.getElementById(`zone${zone}`);
        return checkbox && checkbox.checked;
    });
    
    if (!hasZone) {
        showAlert('Debe seleccionar al menos una zona lesionada', 'error');
        return false;
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

    console.log('Validación exitosa para semana', week);
    return true;
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
    console.log(`Alert (${type}):`, message);
    
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;

    // Insert at top of container
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
    }

    // Auto remove after duration
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, duration);
}

// Placeholder for loading existing follow-up when week is selected
function loadExistingFollowUp() {
    // This function can be expanded to populate form with existing follow-up data
}

// Make ALL functions globally available IMMEDIATELY
window.showSection = showSection;
window.handleDoctorLogin = handleDoctorLogin;
window.logout = logout;
window.showProtocol = showProtocol;
window.startExercise = startExercise;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.closeExerciseModal = closeExerciseModal;
window.generateGoniometryGrid = generateGoniometryGrid;
window.calculateTAMByFingerAndStrickland = calculateTAMByFingerAndStrickland;
window.calculateDaysToSurgery = calculateDaysToSurgery;
window.calculateEditDaysToSurgery = calculateEditDaysToSurgery;
window.generateQuickDashQuestions = generateQuickDashQuestions;
window.calculateQuickDash = calculateQuickDash;
window.toggleIncompleteReason = toggleIncompleteReason;
window.toggleReturnTimeField = toggleReturnTimeField;
window.calculateDynamometerDifference = calculateDynamometerDifference;
window.exportData = exportData;
window.copyCompleteHistory = copyCompleteHistory;
window.searchPatientsForFollowUp = searchPatientsForFollowUp;
window.selectPatientForFollowUp = selectPatientForFollowUp;
window.showControlSelection = showControlSelection;
window.cancelFollowUp = cancelFollowUp;
window.showClinicalHistories = showClinicalHistories;
window.searchPatients = searchPatients;
window.searchClinicalHistories = searchClinicalHistories;
window.showIndividualClinicalHistory = showIndividualClinicalHistory;
window.loadExistingFollowUp = loadExistingFollowUp;
window.searchPatientsForEdit = searchPatientsForEdit;
window.editPatientIdentification = editPatientIdentification;
window.editPatientInitialData = editPatientInitialData;
window.editPatientFollowUps = editPatientFollowUps;
window.closeEditModal = closeEditModal;
window.handleEditSubmit = handleEditSubmit;

// Event listeners setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicación iniciando...');
    
    try {
        // Load saved data
        loadPatients();
        
        // Initialize UI
        initializeDateFields();
        
        // Setup form listeners
        const newPatientForm = document.getElementById('newPatientForm');
        if (newPatientForm) {
            newPatientForm.addEventListener('submit', handleNewPatientSubmit);
        }

        const followUpForm = document.getElementById('followUpForm');
        if (followUpForm) {
            followUpForm.addEventListener('submit', handleFollowUpSubmit);
        }

        const doctorLoginForm = document.getElementById('doctorLoginForm');
        if (doctorLoginForm) {
            doctorLoginForm.addEventListener('submit', handleDoctorLogin);
        }

        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', handleEditSubmit);
        }
        
        // Show access screen
        showSection('accessScreen');
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        showAlert('Error inicializando la aplicación', 'error');
    }
});