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
        "Me siento menos capaz, menos seguro or menos útil"
    ],
    // TAM normal values by finger
    tam_normal_values: {
        1: 160,  // Dedo 1 (Pulgar)
        2: 260,  // Dedo 2 (Índice)
        3: 260,  // Dedo 3 (Medio)
        4: 260,  // Dedo 4 (Anular)
        5: 260   // Dedo 5 (Meñique)
    },
    exercise_protocols: {
        KLEINERT: {
            week_1: [
                {
                    name: "Extensión Activa",
                    description: "Estire los dedos hacia arriba hasta el límite de la férula",
                    duration: 30,
                    repetitions: 10,
                    frequency: "Cada hora despierto"
                },
                {
                    name: "Flexión Pasiva",
                    description: "Permita que la banda elástica flexione el dedo suavemente",
                    duration: 15,
                    repetitions: 10,
                    frequency: "Cada hora despierto"
                }
            ],
            week_3: [
                {
                    name: "Flexión Activa Suave",
                    description: "Doble los dedos suavemente hacia la palma sin fuerza",
                    duration: 45,
                    repetitions: 15,
                    frequency: "3 veces al día"
                }
            ]
        },
        DURAN: {
            week_1: [
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
        },
        "ACTIVE_MOTION": {
            week_1: [
                {
                    name: "Flexión Activa Controlada",
                    description: "Flexión activa del dedo hasta la base del dedo índice",
                    duration: 60,
                    repetitions: 10,
                    frequency: "3-5 veces al día"
                }
            ]
        }
    },
    // Updated finger names using numbers
    fingers: [
        { number: 1, name: "Dedo 1", joints: ["MCF", "IFP"] },  // Pulgar (no IFD)
        { number: 2, name: "Dedo 2", joints: ["MCF", "IFP", "IFD"] },
        { number: 3, name: "Dedo 3", joints: ["MCF", "IFP", "IFD"] },
        { number: 4, name: "Dedo 4", joints: ["MCF", "IFP", "IFD"] },
        { number: 5, name: "Dedo 5", joints: ["MCF", "IFP", "IFD"] }
    ],
    jointTypes: ["MCF", "IFP", "IFD", "Déficit_Ext"]
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
        } else if (sectionId === 'clinicalHistories') {
            loadClinicalHistoriesList();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    } else {
        console.error('Sección no encontrada:', sectionId);
    }
}

// Authentication functions
function handleDoctorLogin(event) {
    event.preventDefault();
    console.log('Procesando login de médico...');
    
    const doctorId = document.getElementById('doctorId').value;
    const doctorName = document.getElementById('doctorName').value;
    const password = document.getElementById('doctorPassword').value;
    
    console.log('Datos de login:', { doctorId, doctorName, password });
    
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
    selectedPatientId = null;
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
    Object.keys(protocol).forEach(weekKey => {
        const weekNumber = weekKey.replace('week_', '');
        html += `
            <div class="protocol-week">
                <h4>Semana ${weekNumber}</h4>
                <div class="exercise-list">
                    ${protocol[weekKey].map(exercise => `
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
    });
    
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
        const followUpCount = patient.follow_ups ? patient.follow_ups.length : 0;
        const lastControl = patient.follow_ups && patient.follow_ups.length > 0 
            ? patient.follow_ups[patient.follow_ups.length - 1]
            : null;
        
        return `
            <div class="clinical-history-item" onclick="showIndividualClinicalHistory('${patient.id}')">
                <div class="clinical-history-header">
                    <h3 class="clinical-history-patient-name">${patient.identification.full_name}</h3>
                    <div class="clinical-history-stats">
                        <span class="clinical-history-stat">${followUpCount} controles</span>
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zone ? 'Zona ' + patient.initial_data.injured_zone : 'Sin zona'}</span>
                    </div>
                </div>
                <div class="clinical-history-details">
                    <div class="clinical-history-detail">
                        <strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Fecha Ingreso:</strong> ${formatDate(patient.identification.admission_date)}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Último Control:</strong> ${lastControl ? `Semana ${lastControl.week} - ${formatDate(lastControl.date)}` : 'Sin controles'}
                    </div>
                </div>
                <div class="clinical-history-actions">
                    <button class="btn btn--sm btn--primary" onclick="event.stopPropagation(); showIndividualClinicalHistory('${patient.id}')">
                        Ver Historia Completa
                    </button>
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
        patient.identification.full_name.toLowerCase().includes(searchTerm) ||
        patient.identification.document_number.includes(searchTerm)
    );
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No se encontraron pacientes</h3><p>Intente con un término de búsqueda diferente.</p></div>';
        return;
    }
    
    // Similar rendering logic as loadClinicalHistoriesList but with filtered patients
    const html = filteredPatients.map(patient => {
        const followUpCount = patient.follow_ups ? patient.follow_ups.length : 0;
        const lastControl = patient.follow_ups && patient.follow_ups.length > 0 
            ? patient.follow_ups[patient.follow_ups.length - 1]
            : null;
        
        return `
            <div class="clinical-history-item" onclick="showIndividualClinicalHistory('${patient.id}')">
                <div class="clinical-history-header">
                    <h3 class="clinical-history-patient-name">${patient.identification.full_name}</h3>
                    <div class="clinical-history-stats">
                        <span class="clinical-history-stat">${followUpCount} controles</span>
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zone ? 'Zona ' + patient.initial_data.injured_zone : 'Sin zona'}</span>
                    </div>
                </div>
                <div class="clinical-history-details">
                    <div class="clinical-history-detail">
                        <strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Fecha Ingreso:</strong> ${formatDate(patient.identification.admission_date)}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Cirugía:</strong> ${patient.initial_data?.surgery_date ? formatDate(patient.initial_data.surgery_date) : 'No registrada'}
                    </div>
                    <div class="clinical-history-detail">
                        <strong>Último Control:</strong> ${lastControl ? `Semana ${lastControl.week} - ${formatDate(lastControl.date)}` : 'Sin controles'}
                    </div>
                </div>
                <div class="clinical-history-actions">
                    <button class="btn btn--sm btn--primary" onclick="event.stopPropagation(); showIndividualClinicalHistory('${patient.id}')">
                        Ver Historia Completa
                    </button>
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
        nameElement.textContent = `Historia Clínica - ${patient.identification.full_name}`;
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
                <button class="btn btn--sm btn--secondary" onclick="editSection('identification', '${patient.id}')">
                    Editar
                </button>
            </div>
            <div class="clinical-history-section-body">
                ${generateIdentificationHTML(patient.identification)}
            </div>
        </div>

        <!-- Datos Iniciales del Trauma -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Datos Iniciales del Trauma</h3>
                <button class="btn btn--sm btn--secondary" onclick="editSection('initial_data', '${patient.id}')">
                    Editar
                </button>
            </div>
            <div class="clinical-history-section-body">
                ${generateInitialDataHTML(patient.initial_data)}
            </div>
        </div>

        <!-- TAM por Dedo - Timeline de evolución -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Evolución TAM por Dedo</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateTAMEvolutionHTML(patient.follow_ups)}
            </div>
        </div>

        <!-- Controles de Seguimiento -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Controles de Seguimiento</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateFollowUpControlsHTML(patient.follow_ups, patient.id)}
            </div>
        </div>

        <!-- Registro de Auditoría -->
        <div class="clinical-history-section">
            <div class="clinical-history-section-header">
                <h3>Registro de Auditoría</h3>
            </div>
            <div class="clinical-history-section-body">
                ${generateAuditTrailHTML(patient.audit_trail)}
            </div>
        </div>
    `;
}

function generateIdentificationHTML(identification) {
    return `
        <div class="clinical-data-grid">
            <div class="clinical-data-item">
                <div class="clinical-data-label">Nombre Completo</div>
                <div class="clinical-data-value">${identification.full_name}</div>
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
                <div class="clinical-data-label">Fecha de Ingreso</div>
                <div class="clinical-data-value">${formatDate(identification.admission_date)}</div>
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
    if (!initialData) return '<p>No hay datos iniciales registrados.</p>';
    
    return `
        <div class="clinical-data-grid">
            <div class="clinical-data-item">
                <div class="clinical-data-label">Zona Lesionada</div>
                <div class="clinical-data-value">Zona ${initialData.injured_zone || 'No especificada'}</div>
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

function generateTAMEvolutionHTML(followUps) {
    if (!followUps || followUps.length === 0) {
        return '<p>No hay controles registrados para mostrar evolución TAM.</p>';
    }
    
    return `
        <div class="evolution-timeline">
            ${followUps.sort((a, b) => a.week - b.week).map(followUp => `
                <div class="evolution-item">
                    <div class="evolution-content">
                        <div class="evolution-header">
                            <h4>Semana ${followUp.week}</h4>
                            <span class="evolution-date">${formatDate(followUp.date)}</span>
                        </div>
                        ${generateTAMByFingerHTML(followUp.tam_by_finger)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateTAMByFingerHTML(tamByFinger) {
    if (!tamByFinger) return '<p>TAM por dedo no calculado.</p>';
    
    return `
        <div class="tam-by-finger-results">
            ${Object.keys(tamByFinger).map(fingerKey => {
                const fingerNum = fingerKey.replace('finger', '');
                const data = tamByFinger[fingerKey];
                return `
                    <div class="tam-finger-card">
                        <div class="tam-finger-title">Dedo ${fingerNum}</div>
                        <div class="tam-finger-score">${data.tam}°</div>
                        <div class="tam-finger-percentage">${data.percentage.toFixed(1)}%</div>
                        <div class="tam-finger-classification ${getClassificationClass(data.percentage)}">
                            ${getClassificationText(data.percentage)}
                        </div>
                    </div>
                `;
            }).join('')}
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
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <span class="evolution-date">${formatDate(followUp.date)}</span>
                                <button class="btn btn--sm btn--secondary" onclick="editFollowUp('${patientId}', ${followUp.week})">
                                    Editar
                                </button>
                            </div>
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
                                <div class="clinical-data-label">Quick DASH</div>
                                <div class="clinical-data-value">${followUp.quick_dash_score?.toFixed(2) || 'No calculado'}</div>
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

function generateAuditTrailHTML(auditTrail) {
    if (!auditTrail || auditTrail.length === 0) {
        return '<p>No hay registros de auditoría disponibles.</p>';
    }
    
    return `
        <div class="audit-trail">
            ${auditTrail.map(entry => `
                <div class="audit-entry">
                    <div class="audit-timestamp">${formatDateTime(entry.timestamp)}</div>
                    <div><strong>Médico:</strong> Dr(a). ${entry.doctor_name} (${entry.doctor_id})</div>
                    <div><strong>Acción:</strong> ${entry.action}</div>
                    <div><strong>Sección:</strong> ${entry.section}</div>
                    ${entry.changes ? `<div><strong>Cambios:</strong> ${entry.changes}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Edit Functions
function editSection(sectionName, patientId) {
    if (!currentUser) {
        showAlert('Debe estar autenticado para editar', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    editingSection = sectionName;
    selectedPatientId = patientId;
    
    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const content = document.getElementById('editFormContent');
    
    if (!modal || !title || !content) return;
    
    title.textContent = `Editar ${getSectionTitle(sectionName)}`;
    content.innerHTML = generateEditFormHTML(sectionName, patient[sectionName]);
    modal.classList.remove('hidden');
}

function editFollowUp(patientId, week) {
    if (!currentUser) {
        showAlert('Debe estar autenticado para editar', 'error');
        return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.follow_ups) return;
    
    const followUp = patient.follow_ups.find(fu => fu.week === week);
    if (!followUp) return;
    
    editingSection = 'follow_up';
    selectedPatientId = patientId;
    pendingEditData = { week: week };
    
    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const content = document.getElementById('editFormContent');
    
    if (!modal || !title || !content) return;
    
    title.textContent = `Editar Control - Semana ${week}`;
    content.innerHTML = generateFollowUpEditFormHTML(followUp);
    modal.classList.remove('hidden');
}

function getSectionTitle(sectionName) {
    const titles = {
        'identification': 'Identificación del Paciente',
        'initial_data': 'Datos Iniciales del Trauma',
        'follow_up': 'Control de Seguimiento'
    };
    return titles[sectionName] || 'Sección';
}

function generateEditFormHTML(sectionName, data) {
    if (sectionName === 'identification') {
        return generateIdentificationEditForm(data);
    } else if (sectionName === 'initial_data') {
        return generateInitialDataEditForm(data);
    }
    return '<p>Formulario de edición no disponible.</p>';
}

function generateIdentificationEditForm(data) {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="edit_full_name" class="form-control" value="${data.full_name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Edad</label>
                <input type="number" id="edit_age" class="form-control" value="${data.age}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Ocupación</label>
                <input type="text" id="edit_occupation" class="form-control" value="${data.occupation}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" id="edit_phone" class="form-control" value="${data.phone}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="edit_email" class="form-control" value="${data.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" id="edit_address" class="form-control" value="${data.address}" required>
            </div>
        </div>
    `;
}

function generateInitialDataEditForm(data) {
    if (!data) return '<p>No hay datos iniciales para editar.</p>';
    
    return `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Objeto</label>
                <input type="text" id="edit_object" class="form-control" value="${data.object || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Etiología</label>
                <select id="edit_etiology" class="form-control">
                    ${appData.etiology_types.map(type => 
                        `<option value="${type}" ${data.etiology === type ? 'selected' : ''}>${type}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Técnica Reparación</label>
                <input type="text" id="edit_repair_technique" class="form-control" value="${data.repair_technique || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Fecha Cirugía</label>
                <input type="date" id="edit_surgery_date" class="form-control" value="${data.surgery_date || ''}">
            </div>
        </div>
    `;
}

function generateFollowUpEditFormHTML(followUp) {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Protocolo</label>
                <select id="edit_protocol" class="form-control">
                    ${appData.protocols.map(protocol => 
                        `<option value="${protocol}" ${followUp.protocol === protocol ? 'selected' : ''}>${protocol}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Terapias Completas</label>
                <select id="edit_complete_therapies" class="form-control">
                    <option value="true" ${followUp.complete_therapies ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!followUp.complete_therapies ? 'selected' : ''}>No</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Retorno a Ocupación Previa</label>
                <select id="edit_return_to_occupation" class="form-control">
                    <option value="true" ${followUp.return_to_previous_occupation ? 'selected' : ''}>Sí</option>
                    <option value="false" ${!followUp.return_to_previous_occupation ? 'selected' : ''}>No</option>
                </select>
            </div>
            <div class="form-group col-span-2">
                <label class="form-label">Razón Terapias Incompletas</label>
                <textarea id="edit_incomplete_reason" class="form-control" rows="3">${followUp.incomplete_reason || ''}</textarea>
            </div>
        </div>
    `;
}

function handleEditSubmit(event) {
    event.preventDefault();
    
    if (!editingSection || !selectedPatientId || !currentUser) {
        showAlert('Error en el proceso de edición', 'error');
        return;
    }
    
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    
    if (confirmationModal && confirmationMessage) {
        confirmationMessage.textContent = `¿Está seguro que desea guardar los cambios en ${getSectionTitle(editingSection)}?`;
        confirmationModal.classList.remove('hidden');
    }
}

function confirmEdit() {
    if (!editingSection || !selectedPatientId || !currentUser) return;
    
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;
    
    const changes = collectEditChanges();
    if (!changes) return;
    
    // Apply changes to patient data
    if (editingSection === 'identification') {
        Object.assign(patient.identification, changes);
    } else if (editingSection === 'initial_data') {
        Object.assign(patient.initial_data, changes);
    } else if (editingSection === 'follow_up' && pendingEditData) {
        const followUp = patient.follow_ups.find(fu => fu.week === pendingEditData.week);
        if (followUp) {
            Object.assign(followUp, changes);
        }
    }
    
    // Add audit trail entry
    if (!patient.audit_trail) patient.audit_trail = [];
    patient.audit_trail.push({
        timestamp: new Date().toISOString(),
        doctor_id: currentUser.id,
        doctor_name: currentUser.name,
        action: 'Edición',
        section: getSectionTitle(editingSection),
        changes: Object.keys(changes).join(', ')
    });
    
    // Save changes
    savePatients();
    
    // Close modals and refresh view
    closeEditModal();
    document.getElementById('confirmationModal').classList.add('hidden');
    showIndividualClinicalHistory(selectedPatientId);
    showAlert(`${getSectionTitle(editingSection)} actualizado exitosamente`, 'success');
    
    // Reset edit state
    editingSection = null;
    pendingEditData = null;
}

function cancelEdit() {
    document.getElementById('confirmationModal').classList.add('hidden');
}

function collectEditChanges() {
    const changes = {};
    
    try {
        if (editingSection === 'identification') {
            changes.full_name = document.getElementById('edit_full_name')?.value || '';
            changes.age = parseInt(document.getElementById('edit_age')?.value) || 0;
            changes.occupation = document.getElementById('edit_occupation')?.value || '';
            changes.phone = document.getElementById('edit_phone')?.value || '';
            changes.email = document.getElementById('edit_email')?.value || '';
            changes.address = document.getElementById('edit_address')?.value || '';
        } else if (editingSection === 'initial_data') {
            changes.object = document.getElementById('edit_object')?.value || '';
            changes.etiology = document.getElementById('edit_etiology')?.value || '';
            changes.repair_technique = document.getElementById('edit_repair_technique')?.value || '';
            changes.surgery_date = document.getElementById('edit_surgery_date')?.value || '';
        } else if (editingSection === 'follow_up') {
            changes.protocol = document.getElementById('edit_protocol')?.value || '';
            changes.complete_therapies = document.getElementById('edit_complete_therapies')?.value === 'true';
            changes.return_to_previous_occupation = document.getElementById('edit_return_to_occupation')?.value === 'true';
            changes.incomplete_reason = document.getElementById('edit_incomplete_reason')?.value || '';
        }
    } catch (error) {
        console.error('Error recolectando cambios:', error);
        showAlert('Error recolectando cambios de edición', 'error');
        return null;
    }
    
    return changes;
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    editingSection = null;
    pendingEditData = null;
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

// Dashboard functions
function updateDashboard() {
    console.log('Actualizando dashboard...');
    const totalPatients = patients.length;
    const pendingControls = calculatePendingControls();
    const incompletePatients = calculateIncompletePatients();
    
    const totalElement = document.getElementById('totalPacientes');
    const pendingElement = document.getElementById('controlesPendientes');
    const incompleteElement = document.getElementById('pacientesIncompletos');
    
    if (totalElement) totalElement.textContent = totalPatients;
    if (pendingElement) pendingElement.textContent = pendingControls;
    if (incompleteElement) incompleteElement.textContent = incompletePatients;
    
    console.log('Dashboard actualizado - Pacientes:', totalPatients);
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
            
            // Check if patient is missing any follow-ups for 12-week period
            if (weeksPassedSinceSurgery >= 12) {
                const hasAllFollowUps = appData.follow_up_weeks.every(week => {
                    return patient.follow_ups && patient.follow_ups.some(fu => fu.week === week);
                });
                
                if (!hasAllFollowUps) {
                    incomplete++;
                }
            } else {
                // Check if patient is missing any controls they should have had by now
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
    
    // Store patient ID for edit functionality
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
        showAlert('Use las funciones de edición en "Historias Clínicas Completas" para una edición más detallada con auditoría', 'info');
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
            // Skip IFD for thumb (finger 1)
            if (finger.number === 1 && joint === 'IFD') {
                html += `<div></div>`;
            } else {
                const inputId = `gonio_finger${finger.number}_${joint}`;
                html += `<input type="number" id="${inputId}" class="gonio-input" min="0" max="180" placeholder="0°" onchange="calculateTAMByFingerAndStrickland()">`;
            }
        });
    });
    
    container.innerHTML = html;
}

// IMPROVED TAM CALCULATION BY FINGER
function calculateTAMByFingerAndStrickland() {
    const resultsContainer = document.getElementById('tamByFingerResults');
    if (!resultsContainer) return;
    
    let totalStrickland = 0;
    let fingerCount = 0;
    let tamByFinger = {};
    
    let html = '';
    
    appData.fingers.forEach(finger => {
        const mcf = parseFloat(document.getElementById(`gonio_finger${finger.number}_MCF`)?.value) || 0;
        const ifp = parseFloat(document.getElementById(`gonio_finger${finger.number}_IFP`)?.value) || 0;
        const ifd = finger.number === 1 ? 0 : (parseFloat(document.getElementById(`gonio_finger${finger.number}_IFD`)?.value) || 0);
        const deficit = parseFloat(document.getElementById(`gonio_finger${finger.number}_Déficit_Ext`)?.value) || 0;
        
        // Calculate TAM for this finger
        const fingerTAM = (mcf + ifp + ifd) - deficit;
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
                <div class="tam-finger-percentage">${tamPercentage.toFixed(1)}% de ${normalTAM}°</div>
                <div class="tam-finger-classification ${getClassificationClass(tamPercentage)}">
                    ${getClassificationText(tamPercentage)}
                </div>
            </div>
        `;
        
        // Calculate Strickland for fingers 2-5
        if (finger.number > 1 && (ifp > 0 || ifd > 0)) {
            const stricklandValue = ((ifp + ifd) / 175) * 100;
            totalStrickland += stricklandValue;
            fingerCount++;
        }
    });
    
    resultsContainer.innerHTML = html;
    
    // Update Strickland results
    const stricklandResult = document.getElementById('stricklandResult');
    const stricklandClassification = document.getElementById('stricklandClassification');
    
    const avgStrickland = fingerCount > 0 ? totalStrickland / fingerCount : 0;
    if (stricklandResult) stricklandResult.value = Math.round(avgStrickland);
    
    // Strickland classification
    let classification = '';
    if (avgStrickland >= 85) classification = 'Excelente (85-100%)';
    else if (avgStrickland >= 70) classification = 'Bueno (70-84%)';
    else if (avgStrickland >= 50) classification = 'Regular (50-69%)';
    else classification = 'Pobre (<50%)';
    
    if (stricklandClassification) stricklandClassification.value = classification;
    
    // Store TAM by finger data for form submission
    window.currentTAMByFinger = tamByFinger;
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
        // Need at least 10 out of 11 questions answered
        document.getElementById('quickDashScore').value = '';
        document.getElementById('dashDisabilityGrade').value = '';
        return;
    }
    
    // QuickDASH formula: ((sum of responses / number of responses) - 1) * 25
    const quickDashScore = ((totalScore / answeredQuestions) - 1) * 25;
    
    document.getElementById('quickDashScore').value = Math.round(quickDashScore * 100) / 100;
    
    // Disability grade
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

// CORRECCIÓN CRÍTICA: Fix for week selection persistence
function loadExistingFollowUp() {
    const weekSelect = document.getElementById('followUpWeek');
    const week = parseInt(weekSelect.value);
    
    if (!week || !selectedPatientId) {
        clearFollowUpForm();
        return;
    }
    
    // Ensure the selected value is visually maintained
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
    // Populate form with existing data
    populateFollowUpForm(existingFollowUp);
}

function populateFollowUpForm(followUp) {
    // Basic data
    if (followUp.protocol) document.getElementById('protocolUsed').value = followUp.protocol;
    if (followUp.complete_therapies !== undefined) document.getElementById('completeTherapies').value = followUp.complete_therapies ? 'true' : 'false';
    if (followUp.incomplete_reason) document.getElementById('incompleteReason').value = followUp.incomplete_reason;
    
    // QuickDASH scores
    if (followUp.quick_dash_score) document.getElementById('quickDashScore').value = followUp.quick_dash_score;
    if (followUp.dash_disability_grade) document.getElementById('dashDisabilityGrade').value = followUp.dash_disability_grade;
    
    // Work return
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
            } else if (input.id !== 'followUpWeek') { // Don't clear the week selector
                input.value = '';
            }
        });
        
        // Reset week select styling to normal
        const weekSelect = document.getElementById('followUpWeek');
        if (weekSelect) {
            weekSelect.style.fontWeight = 'normal';
            weekSelect.style.color = '';
        }
        
        toggleIncompleteReason();
        toggleReturnTimeField();
        
        // Clear TAM results
        const tamResultsContainer = document.getElementById('tamByFingerResults');
        if (tamResultsContainer) {
            tamResultsContainer.innerHTML = '';
        }
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

function collectNewPatientData() {
    // Collect compromised tendons
    const compromisedTendons = [];
    ['fds', 'fdp', 'fpl', 'fcu', 'fcr', 'pl'].forEach(tendon => {
        const checkbox = document.getElementById(`tendon_${tendon}`);
        if (checkbox && checkbox.checked) {
            compromisedTendons.push(tendon.toUpperCase());
        }
    });
    
    // Collect associated injuries
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
        
        // Update existing follow-up or add new one
        const existingIndex = patient.follow_ups.findIndex(fu => fu.week === followUpData.week);
        if (existingIndex >= 0) {
            followUpData.modified_by = currentUser;
            followUpData.modified_at = new Date().toISOString();
            patient.follow_ups[existingIndex] = followUpData;
            showAlert(`Control de semana ${followUpData.week} actualizado exitosamente`, 'success');
            
            // Add audit entry
            if (!patient.audit_trail) patient.audit_trail = [];
            patient.audit_trail.push({
                timestamp: new Date().toISOString(),
                doctor_id: currentUser.id,
                doctor_name: currentUser.name,
                action: 'Modificación',
                section: `Control Semana ${followUpData.week}`,
                changes: 'Control de seguimiento actualizado'
            });
        } else {
            followUpData.created_by = currentUser;
            followUpData.created_at = new Date().toISOString();
            patient.follow_ups.push(followUpData);
            showAlert(`Control de semana ${followUpData.week} guardado exitosamente`, 'success');
            
            // Add audit entry
            if (!patient.audit_trail) patient.audit_trail = [];
            patient.audit_trail.push({
                timestamp: new Date().toISOString(),
                doctor_id: currentUser.id,
                doctor_name: currentUser.name,
                action: 'Creación',
                section: `Control Semana ${followUpData.week}`,
                changes: 'Nuevo control de seguimiento'
            });
        }
        
        savePatients();
        updateDashboard();
        cancelFollowUp();
    }
}

function collectFollowUpData() {
    const week = parseInt(document.getElementById('followUpWeek').value);
    
    // Collect goniometry data
    const goniometry = {};
    appData.fingers.forEach(finger => {
        goniometry[`finger${finger.number}`] = {};
        appData.jointTypes.forEach(joint => {
            const inputId = `gonio_finger${finger.number}_${joint}`;
            const input = document.getElementById(inputId);
            if (input && input.value) {
                goniometry[`finger${finger.number}`][joint.toLowerCase()] = parseInt(input.value);
            }
        });
    });
    
    // Collect QuickDASH responses
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
        tam_by_finger: window.currentTAMByFinger || {},
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

// CORRECCIÓN: Export functionality with automatic download
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
        
        // Create and trigger automatic download
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
    
    // Add TAM by finger headers
    appData.fingers.forEach(finger => {
        headers.push(`TAM ${finger.name}`, `% TAM ${finger.name}`);
    });
    
    // Add follow-up headers
    appData.follow_up_weeks.forEach(week => {
        headers.push(
            `Control ${week}sem - Fecha`,
            `Control ${week}sem - Protocolo`,
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
        
        // Add latest TAM by finger data
        const latestFollowUp = patient.follow_ups && patient.follow_ups.length > 0 
            ? patient.follow_ups[patient.follow_ups.length - 1] 
            : null;
        
        appData.fingers.forEach(finger => {
            const tamData = latestFollowUp?.tam_by_finger?.[`finger${finger.number}`];
            row.push(
                tamData?.tam || '',
                tamData?.percentage?.toFixed(1) || ''
            );
        });
        
        // Add follow-up data
        appData.follow_up_weeks.forEach(week => {
            const followUp = patient.follow_ups?.find(fu => fu.week === week);
            if (followUp) {
                row.push(
                    followUp.date || '',
                    followUp.protocol || '',
                    followUp.strickland_result || '',
                    followUp.quick_dash_score || '',
                    followUp.dash_disability_grade || '',
                    followUp.return_to_previous_occupation ? 'Sí' : 'No',
                    followUp.created_by?.name || followUp.modified_by?.name || ''
                );
            } else {
                row.push('', '', '', '', '', '', '');
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

// Make functions globally available immediately
window.showSection = showSection;
window.showProtocol = showProtocol;
window.startExercise = startExercise;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.closeExerciseModal = closeExerciseModal;
window.searchPatients = searchPatients;
window.searchPatientsForFollowUp = searchPatientsForFollowUp;
window.searchClinicalHistories = searchClinicalHistories;
window.showControlSelection = showControlSelection;
window.showClinicalHistories = showClinicalHistories;
window.showIndividualClinicalHistory = showIndividualClinicalHistory;
window.exportData = exportData;
window.showPatientHistory = showPatientHistory;
window.selectPatientForFollowUp = selectPatientForFollowUp;
window.cancelFollowUp = cancelFollowUp;
window.showPatientEditDialog = showPatientEditDialog;
window.calculateDaysToSurgery = calculateDaysToSurgery;
window.calculateTAMByFingerAndStrickland = calculateTAMByFingerAndStrickland;
window.calculateQuickDash = calculateQuickDash;
window.toggleIncompleteReason = toggleIncompleteReason;
window.toggleReturnTimeField = toggleReturnTimeField;
window.calculateDynamometerDifference = calculateDynamometerDifference;
window.loadExistingFollowUp = loadExistingFollowUp;
window.editSection = editSection;
window.editFollowUp = editFollowUp;
window.closeEditModal = closeEditModal;
window.confirmEdit = confirmEdit;
window.cancelEdit = cancelEdit;
window.logout = logout;

// Event listener setup
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // New patient form
    const newPatientForm = document.getElementById('newPatientForm');
    if (newPatientForm) {
        newPatientForm.addEventListener('submit', handleNewPatientSubmit);
        console.log('Form listener agregado: newPatientForm');
    }
    
    // Follow-up form
    const followUpForm = document.getElementById('followUpForm');
    if (followUpForm) {
        followUpForm.addEventListener('submit', handleFollowUpSubmit);
        console.log('Form listener agregado: followUpForm');
    }
    
    // Doctor login form
    const doctorLoginForm = document.getElementById('doctorLoginForm');
    if (doctorLoginForm) {
        doctorLoginForm.addEventListener('submit', handleDoctorLogin);
        console.log('Form listener agregado: doctorLoginForm');
    }
    
    // Edit form
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
        console.log('Form listener agregado: editForm');
    }
    
    // Search functionality
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
    
    const clinicalHistorySearchInput = document.getElementById('clinicalHistorySearch');
    if (clinicalHistorySearchInput) {
        clinicalHistorySearchInput.addEventListener('input', debounce(searchClinicalHistories, 300));
        console.log('Search listener agregado: clinicalHistorySearch');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicación iniciando...');
    
    // Load saved data
    loadPatients();
    
    // Initialize UI
    initializeDateFields();
    setupEventListeners();
    
    // Show access screen
    showSection('accessScreen');
    
    // Add some sample data for testing if no patients exist
    if (patients.length === 0) {
        console.log('Agregando datos de muestra para pruebas...');
        const samplePatient = {
            id: 'PAT000001',
            identification: {
                admission_date: '2024-01-15',
                evolution_time_hours: 6,
                full_name: 'María García Rodríguez',
                document_type: 'Cédula de Ciudadanía',
                document_number: '12345678',
                age: 35,
                sex: 'Femenino',
                education_level: 'Universitario',
                occupation: 'Enfermera',
                birth_city: 'Bogotá',
                address: 'Calle 123 #45-67',
                department: 'Cundinamarca',
                city: 'Bogotá',
                phone: '3001234567',
                email: 'maria.garcia@email.com',
                eps: 'Sanitas',
                affiliation_type: 'CONTRIBUTIVO',
                religion: 'Católica',
                companion_name: 'Pedro García',
                companion_relation: 'Esposo',
                companion_phone: '3009876543'
            },
            initial_data: {
                compromised_flexor_tendon: ['FDP'],
                injured_zone: 'II',
                object: 'Cuchillo',
                etiology: 'CORTOPUNZANTE',
                trauma_mechanism: 'ABIERTO',
                presurgical_description: 'Lesión en zona II del dedo índice',
                tendon_description: 'Sección completa de FDP',
                associated_injuries: ['NERVIOSO'],
                specific_associated_injury: 'Nervio digital',
                tenorrhaphy_threads: '4-0 Prolene',
                repair_type: 'CENTRAL',
                repair_technique: 'Sutura de Kessler modificada',
                tenolysis: 'No',
                days_to_surgery: 1,
                surgery_date: '2024-01-16',
                bmrc_sensory: { median: 3, ulnar: 5, radial: 5 },
                bmrc_motor: {
                    fds: { finger2: 2, finger3: 5, finger4: 5, finger5: 5 },
                    fdp: { finger2: 1, finger3: 5, finger4: 5, finger5: 5 },
                    fpl: 5, fcu: 5, fcr: 5, pl: 5
                }
            },
            follow_ups: [
                {
                    week: 3,
                    date: '2024-02-05',
                    protocol: 'KLEINERT',
                    complete_therapies: true,
                    incomplete_reason: '',
                    tam_by_finger: {
                        finger1: { tam: 120, percentage: 75.0, classification: 'Bueno' },
                        finger2: { tam: 180, percentage: 69.2, classification: 'Regular' }
                    },
                    strickland_result: 75,
                    strickland_classification: 'Bueno (70-84%)',
                    quick_dash_score: 25.5,
                    dash_disability_grade: 'Moderado (20-40)',
                    return_to_previous_occupation: false,
                    occupation_change: 'false',
                    return_time_months: 0,
                    created_by: { id: '123456', name: 'Dr. Juan Pérez' },
                    created_at: '2024-02-05T10:30:00'
                }
            ],
            created_by: { id: '123456', name: 'Dr. Juan Pérez' },
            created_at: '2024-01-15T14:20:00',
            audit_trail: [
                {
                    timestamp: '2024-01-15T14:20:00',
                    doctor_id: '123456',
                    doctor_name: 'Dr. Juan Pérez',
                    action: 'Creación',
                    section: 'Registro inicial',
                    changes: 'Paciente registrado'
                }
            ]
        };
        
        patients.push(samplePatient);
        savePatients();
        console.log('Datos de muestra agregados');
    }
    
    console.log('Aplicación iniciada correctamente');
});