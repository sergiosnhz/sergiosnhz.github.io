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
    // COMPLETE EXERCISE PROTOCOLS
    exercise_protocols: {
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
                        },
                        {
                            name: "Movimiento de Muñeca",
                            description: "Flexión y extensión suave de muñeca dentro de férula",
                            duration: 30,
                            repetitions: 10,
                            frequency: "3 veces al día"
                        }
                    ]
                },
                phase_3: {
                    name: "Semana 4 - 6",
                    objective: "Progresión a movimiento activo controlado",
                    exercises: [
                        {
                            name: "Flexión Activa Suave",
                            description: "Doble los dedos suavemente hacia la palma sin fuerza ni resistencia",
                            duration: 60,
                            repetitions: 15,
                            frequency: "3 veces al día"
                        },
                        {
                            name: "Extensión Activa Completa",
                            description: "Extensión completa de dedos sin férula por períodos cortos",
                            duration: 45,
                            repetitions: 20,
                            frequency: "4 veces al día"
                        },
                        {
                            name: "Trabajo de Pinza",
                            description: "Ejercicios de pinza suave con objetos blandos",
                            duration: 30,
                            repetitions: 10,
                            frequency: "2 veces al día"
                        }
                    ]
                },
                phase_4: {
                    name: "Semana 6 - 12",
                    objective: "Fortalecimiento progresivo y retorno funcional",
                    exercises: [
                        {
                            name: "Fortalecimiento Gradual",
                            description: "Ejercicios de resistencia progresiva con banda elástica",
                            duration: 120,
                            repetitions: 20,
                            frequency: "2 veces al día"
                        },
                        {
                            name: "Actividades Funcionales",
                            description: "Tareas específicas de la vida diaria y ocupación del paciente",
                            duration: 180,
                            repetitions: 1,
                            frequency: "Diario"
                        },
                        {
                            name: "Ejercicios de Destreza",
                            description: "Manipulación de objetos pequeños y coordinación fina",
                            duration: 90,
                            repetitions: 15,
                            frequency: "2 veces al día"
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
                },
                phase_2: {
                    name: "Día 3 - Semana 4",
                    objective: "Movilización pasiva controlada",
                    exercises: [
                        {
                            name: "Movimiento Pasivo PIP",
                            description: "Mueva pasivamente la articulación PIP de 0° a 90° suavemente",
                            duration: 30,
                            repetitions: 10,
                            frequency: "Cada 2 horas"
                        },
                        {
                            name: "Movimiento Pasivo DIP",
                            description: "Mueva pasivamente la articulación DIP manteniendo PIP extendida",
                            duration: 30,
                            repetitions: 10,
                            frequency: "Cada 2 horas"
                        },
                        {
                            name: "Flexión Compuesta Pasiva",
                            description: "Flexión pasiva simultánea de MCF, PIP y DIP",
                            duration: 45,
                            repetitions: 8,
                            frequency: "3 veces al día"
                        }
                    ]
                },
                phase_3: {
                    name: "Semana 4 - 6",
                    objective: "Transición a movimiento activo",
                    exercises: [
                        {
                            name: "Flexión Activa Asistida",
                            description: "Flexión activa con asistencia manual mínima",
                            duration: 60,
                            repetitions: 12,
                            frequency: "4 veces al día"
                        },
                        {
                            name: "Extensión Activa",
                            description: "Extensión activa completa de todos los dedos",
                            duration: 45,
                            repetitions: 15,
                            frequency: "4 veces al día"
                        }
                    ]
                },
                phase_4: {
                    name: "Semana 6 - 12",
                    objective: "Fortalecimiento y función",
                    exercises: [
                        {
                            name: "Fortalecimiento Resistido",
                            description: "Ejercicios contra resistencia manual y con implementos",
                            duration: 90,
                            repetitions: 20,
                            frequency: "2 veces al día"
                        },
                        {
                            name: "Reeducación Funcional",
                            description: "Actividades específicas de trabajo y vida diaria",
                            duration: 120,
                            repetitions: 1,
                            frequency: "Diario"
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
                        },
                        {
                            name: "Extensión Pasiva",
                            description: "Extensión pasiva completa con férula",
                            duration: 30,
                            repetitions: 10,
                            frequency: "Cada 2 horas"
                        }
                    ]
                },
                phase_2: {
                    name: "Día 3 - Semana 2",
                    objective: "Progresión del rango de movimiento activo",
                    exercises: [
                        {
                            name: "Flexión Activa Progresiva",
                            description: "Flexión activa progresiva hasta palma distal",
                            duration: 45,
                            repetitions: 10,
                            frequency: "Cada hora despierto"
                        },
                        {
                            name: "Extensión Activa",
                            description: "Extensión activa completa contra gravedad",
                            duration: 45,
                            repetitions: 15,
                            frequency: "Cada hora despierto"
                        },
                        {
                            name: "Ejercicio de Lugar y Mantén",
                            description: "Flexión activa con mantenimiento de la posición por 5 segundos",
                            duration: 60,
                            repetitions: 8,
                            frequency: "3 veces al día"
                        }
                    ]
                },
                phase_3: {
                    name: "Semana 2 - 6",
                    objective: "Maximización del rango de movimiento",
                    exercises: [
                        {
                            name: "Flexión Activa Completa",
                            description: "Flexión activa completa a puño cerrado",
                            duration: 60,
                            repetitions: 15,
                            frequency: "4 veces al día"
                        },
                        {
                            name: "Ejercicios de Diferenciación",
                            description: "Movimiento diferencial de FDS y FDP",
                            duration: 90,
                            repetitions: 12,
                            frequency: "3 veces al día"
                        },
                        {
                            name: "Trabajo de Pinza",
                            description: "Ejercicios de pinza lateral y pulpar",
                            duration: 45,
                            repetitions: 20,
                            frequency: "3 veces al día"
                        }
                    ]
                },
                phase_4: {
                    name: "Semana 6 - 12",
                    objective: "Fortalecimiento y retorno funcional",
                    exercises: [
                        {
                            name: "Fortalecimiento Intensivo",
                            description: "Ejercicios de resistencia progresiva alta intensidad",
                            duration: 120,
                            repetitions: 25,
                            frequency: "2 veces al día"
                        },
                        {
                            name: "Simulación Ocupacional",
                            description: "Tareas específicas del trabajo del paciente",
                            duration: 180,
                            repetitions: 1,
                            frequency: "2 veces al día"
                        },
                        {
                            name: "Condicionamiento Físico",
                            description: "Ejercicios generales de fuerza y resistencia de la extremidad",
                            duration: 150,
                            repetitions: 1,
                            frequency: "Diario"
                        }
                    ]
                }
            }
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

// Authentication functions
function handleDoctorLogin(event) {
    event.preventDefault();
    console.log('Procesando login de médico...');
    
    try {
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
                                    ${exercise.duration > 0 ? `
                                        <button class="btn btn--sm btn--primary" onclick="startExercise('${exercise.name}', '${exercise.description}', ${exercise.duration})">
                                            Iniciar Ejercicio
                                        </button>
                                    ` : ''}
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
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
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
                        <span class="clinical-history-stat">${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'Sin zona'}</span>
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
                <div class="clinical-data-label">País de Origen</div>
                <div class="clinical-data-value">${identification.origin_country || 'No registrado'}</div>
            </div>
            <div class="clinical-data-item">
                <div class="clinical-data-label">Lateralidad</div>
                <div class="clinical-data-value">${identification.laterality || 'No registrada'}</div>
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
                <div class="clinical-data-label">Zona(s) Lesionada(s)</div>
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

// CORRECTED Edit Functions
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

// CORRECTED Clinical History Copy Function with Extended Descriptions
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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
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

function generateCompleteHistoryTemplate(patient) {
    const getBmrcDescription = (value, scale) => {
        const scaleData = scale === 'motor' ? appData.bmrc_motor_scale : appData.bmrc_sensory_scale;
        const item = scaleData.find(s => s.value == value);
        return item ? item.description : 'No evaluado';
    };

    const latestFollowUp = patient.follow_ups && patient.follow_ups.length > 0 
        ? patient.follow_ups[patient.follow_ups.length - 1] 
        : null;

    return `📋 HISTORIA CLÍNICA COMPLETA - TENDONES FLEXORES

===============================================
IDENTIFICACIÓN DEL PACIENTE
===============================================
Fecha de Ingreso: ${formatDate(patient.identification.admission_date)}
Tiempo de Evolución: ${patient.identification.evolution_time_hours} horas
Nombre Completo: ${patient.identification.full_name}
Tipo de Documento: ${patient.identification.document_type}
Número de Documento: ${patient.identification.document_number}
Edad: ${patient.identification.age} años
Sexo: ${patient.identification.sex}
Nivel Educativo: ${patient.identification.education_level}
Ocupación: ${patient.identification.occupation}
País de Origen: ${patient.identification.origin_country || 'No registrado'}
Ciudad de Nacimiento: ${patient.identification.birth_city}
Dirección: ${patient.identification.address}
Departamento: ${patient.identification.department}
Ciudad de Residencia: ${patient.identification.city}
Teléfono: ${patient.identification.phone}
Email: ${patient.identification.email || 'No registrado'}
EPS: ${patient.identification.eps}
Tipo de Afiliación: ${patient.identification.affiliation_type}
Lateralidad: ${patient.identification.laterality || 'No registrada'}
Religión: ${patient.identification.religion || 'No registrada'}

Acompañante: ${patient.identification.companion_name || 'No registrado'}
Relación: ${patient.identification.companion_relation || 'No registrada'}
Teléfono Acompañante: ${patient.identification.companion_phone || 'No registrado'}

===============================================
DATOS INICIALES DEL TRAUMA
===============================================
Zona(s) Lesionada(s): ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No registradas'}
Objeto: ${patient.initial_data?.object || 'No registrado'}
Etiología: ${patient.initial_data?.etiology || 'No registrada'}
Mecanismo de Trauma: ${patient.initial_data?.trauma_mechanism || 'No registrado'}
Descripción Prequirúrgica: ${patient.initial_data?.presurgical_description || 'No registrada'}

Tendones Flexores Comprometidos: ${patient.initial_data?.compromised_flexor_tendon?.join(', ') || 'No registrados'}
Descripción Tendones: ${patient.initial_data?.tendon_description || 'No registrada'}

Lesiones Asociadas: ${patient.initial_data?.associated_injuries?.join(', ') || 'Ninguna'}
Lesión Asociada Específica: ${patient.initial_data?.specific_associated_injury || 'Ninguna'}

Tenorrafia (hilos): ${patient.initial_data?.tenorrhaphy_threads || 'No registrado'}
Tipo de Reparación: ${patient.initial_data?.repair_type || 'No registrado'}
Técnica de Reparación: ${patient.initial_data?.repair_technique || 'No registrada'}
Tenolisis: ${patient.initial_data?.tenolysis || 'No registrada'}

Fecha Quirúrgica: ${formatDate(patient.initial_data?.surgery_date)}
Días para Cirugía: ${patient.initial_data?.days_to_surgery || 0} días

===============================================
EVALUACIÓN MOTORA INICIAL (BMRC)
===============================================
FDS Dedo 2: ${patient.initial_data?.bmrc_motor?.fds?.finger2 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fds?.finger2, 'motor')}
FDS Dedo 3: ${patient.initial_data?.bmrc_motor?.fds?.finger3 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fds?.finger3, 'motor')}
FDS Dedo 4: ${patient.initial_data?.bmrc_motor?.fds?.finger4 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fds?.finger4, 'motor')}
FDS Dedo 5: ${patient.initial_data?.bmrc_motor?.fds?.finger5 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fds?.finger5, 'motor')}

FDP Dedo 2: ${patient.initial_data?.bmrc_motor?.fdp?.finger2 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fdp?.finger2, 'motor')}
FDP Dedo 3: ${patient.initial_data?.bmrc_motor?.fdp?.finger3 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fdp?.finger3, 'motor')}
FDP Dedo 4: ${patient.initial_data?.bmrc_motor?.fdp?.finger4 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fdp?.finger4, 'motor')}
FDP Dedo 5: ${patient.initial_data?.bmrc_motor?.fdp?.finger5 || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fdp?.finger5, 'motor')}

FPL: ${patient.initial_data?.bmrc_motor?.fpl || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fpl, 'motor')}
FCU: ${patient.initial_data?.bmrc_motor?.fcu || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fcu, 'motor')}
FCR: ${patient.initial_data?.bmrc_motor?.fcr || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.fcr, 'motor')}
PL: ${patient.initial_data?.bmrc_motor?.pl || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_motor?.pl, 'motor')}

===============================================
EVALUACIÓN DE LA SENSIBILIDAD INICIAL (BMRC)
===============================================
Nervio Mediano: ${patient.initial_data?.bmrc_sensory?.median || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_sensory?.median, 'sensory')}
Nervio Cubital: ${patient.initial_data?.bmrc_sensory?.ulnar || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_sensory?.ulnar, 'sensory')}
Nervio Radial: ${patient.initial_data?.bmrc_sensory?.radial || 'NE'} - ${getBmrcDescription(patient.initial_data?.bmrc_sensory?.radial, 'sensory')}

===============================================
CONTROLES DE SEGUIMIENTO
===============================================
${patient.follow_ups && patient.follow_ups.length > 0 ? 
    patient.follow_ups.sort((a, b) => a.week - b.week).map(fu => `
--- CONTROL SEMANA ${fu.week} (${formatDate(fu.date)}) ---
Protocolo Utilizado: ${fu.protocol || 'No registrado'}
Terapias Completas: ${fu.complete_therapies ? 'Sí' : 'No'}
${fu.incomplete_reason ? `Razón Incompletas: ${fu.incomplete_reason}` : ''}

Quick DASH: ${fu.quick_dash_score?.toFixed(2) || 'No calculado'}
Grado de Discapacidad: ${fu.dash_disability_grade || 'No calculado'}
Strickland: ${fu.strickland_result?.toFixed(1) || 'No calculado'}%
Clasificación Strickland: ${fu.strickland_classification || 'No calculada'}

Retorno a Ocupación Previa: ${fu.return_to_previous_occupation ? 'Sí' : 'No'}
Cambio de Ocupación: ${fu.occupation_change || 'No registrado'}
Tiempo Retorno Laboral: ${fu.return_time_months || 0} meses

EVALUACIÓN MOTORA (BMRC):
FPL: ${fu.bmrc_motor?.fpl || 'NE'} - ${getBmrcDescription(fu.bmrc_motor?.fpl, 'motor')}
FCU: ${fu.bmrc_motor?.fcu || 'NE'} - ${getBmrcDescription(fu.bmrc_motor?.fcu, 'motor')}
FCR: ${fu.bmrc_motor?.fcr || 'NE'} - ${getBmrcDescription(fu.bmrc_motor?.fcr, 'motor')}
PL: ${fu.bmrc_motor?.pl || 'NE'} - ${getBmrcDescription(fu.bmrc_motor?.pl, 'motor')}

EVALUACIÓN DE LA SENSIBILIDAD (BMRC):
Nervio Mediano: ${fu.bmrc_sensory?.median || 'NE'} - ${getBmrcDescription(fu.bmrc_sensory?.median, 'sensory')}
Nervio Cubital: ${fu.bmrc_sensory?.ulnar || 'NE'} - ${getBmrcDescription(fu.bmrc_sensory?.ulnar, 'sensory')}
Nervio Radial: ${fu.bmrc_sensory?.radial || 'NE'} - ${getBmrcDescription(fu.bmrc_sensory?.radial, 'sensory')}

TAM por Dedo:
${fu.tam_by_finger ? Object.keys(fu.tam_by_finger).map(fingerKey => {
    const fingerNum = fingerKey.replace('finger', '');
    const data = fu.tam_by_finger[fingerKey];
    return `Dedo ${fingerNum}: ${data.tam}° (${data.percentage.toFixed(1)}%) - ${data.classification}`;
}).join('\n') : 'No calculado'}

Dinamómetro: Izq ${fu.dynamometer?.left || 0}lb - Der ${fu.dynamometer?.right || 0}lb (Diff: ${fu.dynamometer?.difference || 0}lb)

Distancia Uña-Palma:
Dedo 2: ${fu.nail_palm_distance?.finger2 || 0}mm
Dedo 3: ${fu.nail_palm_distance?.finger3 || 0}mm
Dedo 4: ${fu.nail_palm_distance?.finger4 || 0}mm
Dedo 5: ${fu.nail_palm_distance?.finger5 || 0}mm
`).join('\n') : 'No hay controles de seguimiento registrados'}

===============================================
REGISTRO MÉDICO
===============================================
Paciente registrado por: Dr(a). ${patient.created_by?.name || 'No registrado'} (${patient.created_by?.id || 'N/A'})
Fecha de registro: ${formatDate(patient.created_at)}

${latestFollowUp ? `Último control por: Dr(a). ${latestFollowUp.created_by?.name || latestFollowUp.modified_by?.name || 'No registrado'}` : ''}

===============================================
ID del Sistema: ${patient.id}
Generado el: ${formatDateTime(new Date().toISOString())}
===============================================`;
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
        <div class="search-result-item" onclick="showIndividualClinicalHistory('${patient.id}')">
            <h4>${patient.identification.full_name}</h4>
            <p><strong>Documento:</strong> ${patient.identification.document_type} - ${patient.identification.document_number}</p>
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No especificada'}</p>
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
            <p><strong>Zona lesionada:</strong> ${patient.initial_data?.injured_zones ? 'Zonas ' + patient.initial_data.injured_zones.join(', ') : 'No especificada'}</p>
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

    // Collect injured zones (MULTIPLE ZONES SUPPORT)
    const injuredZones = [];
    ['1', '2', '3', '4', '5'].forEach(zone => {
        const checkbox = document.getElementById(`zone_${zone}`);
        if (checkbox && checkbox.checked) {
            injuredZones.push(zone === '1' ? 'I' : zone === '2' ? 'II' : zone === '3' ? 'III' : zone === '4' ? 'IV' : 'V');
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
            companion_phone: document.getElementById('companionPhone').value
        },
        initial_data: {
            compromised_flexor_tendon: compromisedTendons,
            injured_zones: injuredZones, // CORRECTED: Multiple zones support
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

// Form validation functions
function validateNewPatientForm() {
    const requiredFields = [
        'admissionDate', 'evolutionTime', 'fullName', 'documentType', 'documentNumber',
        'age', 'sex', 'educationLevel', 'occupation', 'originCountry', 'birthCity', 'address',
        'department', 'city', 'phone', 'eps', 'affiliationType', 'laterality',
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
    
    // Validate that at least one zone is selected
    const hasZone = ['1', '2', '3', '4', '5'].some(zone => {
        const checkbox = document.getElementById(`zone_${zone}`);
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
        'ID Paciente', 'Nombre Completo', 'Documento', 'Edad', 'Sexo', 'Ocupación', 'País Origen', 'Lateralidad',
        'Fecha Ingreso', 'Zona(s) Lesionada(s)', 'Objeto', 'Etiología', 'Mecanismo Trauma',
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
            patient.identification.origin_country || '',
            patient.identification.laterality || '',
            patient.identification.admission_date,
            patient.initial_data?.injured_zones ? patient.initial_data.injured_zones.join(', ') : '',
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

// Make ALL functions globally available IMMEDIATELY
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
window.copyCompleteHistory = copyCompleteHistory;
window.exportData = exportData;
window.selectPatientForFollowUp = selectPatientForFollowUp;
window.cancelFollowUp = cancelFollowUp;
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

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicación iniciando...');
    
    try {
        // Load saved data
        loadPatients();
        
        // Initialize UI
        initializeDateFields();
        setupEventListeners();
        
        // Show access screen
        showSection('accessScreen');
        
        console.log('Aplicación iniciada correctamente');
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        showAlert('Error iniciando aplicación', 'error');
    }
});