const { google } = require('googleapis');
const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Mapeo de calendarios a IDs de terapeutas en Firestore
const CALENDAR_THERAPIST_MAP = {
  'monica@learningmodels.com.gt': 'gENhg7u2GJdQnnRuge6ZRleu1ih1',
  'ximena@learningmodels.com.gt': 'ximena_therapist_id', // TODO: Actualizar con ID real
  'miranda@learningmodels.com.gt': 'miranda_therapist_id', // TODO: Actualizar con ID real
  'fernanda@learningmodels.com.gt': 'fernanda_therapist_id', // TODO: Actualizar con ID real
  'mariajimena@learningmodels.com.gt': 'jimena_therapist_id' // TODO: Actualizar con ID real
};

/**
 * Extrae el código del paciente de la descripción del evento
 * Formato esperado: Nombre_Apellido## (ej: Alexia_Urcuyo01)
 */
function extractPatientCode(description) {
  if (!description) return null;
  
  // Regex para formato: Nombre_Apellido##
  const match = description.match(/([A-Za-z]+_[A-Za-z]+\d+)/);
  return match ? match[1] : null;
}

/**
 * Busca un paciente en Firestore por su código
 */
async function findPatientByCode(patientCode) {
  try {
    const patientsRef = db.collection('patients');
    const snapshot = await patientsRef.where('patientCode', '==', patientCode).limit(1).get();
    
    if (snapshot.empty) {
      console.log(`No se encontró paciente con código: ${patientCode}`);
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error(`Error buscando paciente ${patientCode}:`, error);
    return null;
  }
}

/**
 * Crea o actualiza una sesión en Firestore
 */
async function createOrUpdateSession(eventData) {
  try {
    const { eventId, patientId, therapistId, startTime, endTime, title, location, calendarId } = eventData;
    
    // Calcular duración en horas
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Crear ID único basado en el eventId de Google Calendar
    const sessionId = `gcal_${eventId}`;
    
    const sessionData = {
      patientId,
      therapistId,
      startTime: admin.firestore.Timestamp.fromDate(startTime),
      endTime: admin.firestore.Timestamp.fromDate(endTime),
      duration: durationHours,
      title: title || '',
      location: location || '',
      source: 'google_calendar',
      calendarId,
      googleEventId: eventId,
      status: 'Scheduled',
      formCompleted: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Usar set con merge para crear o actualizar
    await db.collection('sessions').doc(sessionId).set(sessionData, { merge: true });
    
    console.log(`✅ Sesión ${sessionId} creada/actualizada para paciente ${patientId}`);
    return sessionId;
  } catch (error) {
    console.error('Error creando/actualizando sesión:', error);
    throw error;
  }
}

/**
 * Sincroniza eventos de un calendario específico
 */
async function syncCalendar(calendar, calendarId, therapistId, startDate, endDate) {
  try {
    console.log(`📅 Sincronizando calendario: ${calendarId}`);
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    console.log(`   Encontrados ${events.length} eventos`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const event of events) {
      // Extraer código de paciente de la descripción
      const patientCode = extractPatientCode(event.description);
      
      if (!patientCode) {
        console.log(`   ⚠️  Evento sin código de paciente: ${event.summary}`);
        skippedCount++;
        continue;
      }
      
      // Buscar paciente en Firestore
      const patient = await findPatientByCode(patientCode);
      
      if (!patient) {
        console.log(`   ⚠️  Paciente no encontrado: ${patientCode}`);
        skippedCount++;
        continue;
      }
      
      // Crear/actualizar sesión
      const eventData = {
        eventId: event.id,
        patientId: patient.id,
        therapistId: therapistId,
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        title: event.summary,
        location: event.location,
        calendarId: calendarId
      };
      
      await createOrUpdateSession(eventData);
      syncedCount++;
    }
    
    console.log(`   ✅ Sincronizadas: ${syncedCount} | ⚠️  Omitidas: ${skippedCount}`);
    
    return { syncedCount, skippedCount };
  } catch (error) {
    console.error(`Error sincronizando calendario ${calendarId}:`, error);
    throw error;
  }
}

/**
 * Función principal de sincronización
 */
async function syncAllCalendars(startDate, endDate) {
  try {
    console.log('🚀 Iniciando sincronización de calendarios...');
    console.log(`   Rango: ${startDate.toISOString()} - ${endDate.toISOString()}`);
    
    // Configurar autenticación con Service Account
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    let totalSynced = 0;
    let totalSkipped = 0;
    
    // Sincronizar cada calendario
    for (const [calendarId, therapistId] of Object.entries(CALENDAR_THERAPIST_MAP)) {
      const result = await syncCalendar(calendar, calendarId, therapistId, startDate, endDate);
      totalSynced += result.syncedCount;
      totalSkipped += result.skippedCount;
    }
    
    console.log('✅ Sincronización completada');
    console.log(`   Total sincronizadas: ${totalSynced}`);
    console.log(`   Total omitidas: ${totalSkipped}`);
    
    return {
      success: true,
      totalSynced,
      totalSkipped,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    throw error;
  }
}

/**
 * Cloud Function HTTP endpoint
 */
exports.syncCalendarEvents = async (req, res) => {
  try {
    // Obtener rango de fechas (por defecto: hoy)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().setHours(0, 0, 0, 0));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(new Date().setHours(23, 59, 59, 999));
    
    const result = await syncAllCalendars(startDate, endDate);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en Cloud Function:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Función para ejecutar localmente (testing)
 */
async function runLocal() {
  const today = new Date();
  const startDate = new Date(today.setHours(0, 0, 0, 0));
  const endDate = new Date(today.setHours(23, 59, 59, 999));
  
  await syncAllCalendars(startDate, endDate);
}

// Si se ejecuta directamente (no como Cloud Function)
if (require.main === module) {
  runLocal()
    .then(() => {
      console.log('Sincronización local completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en sincronización local:', error);
      process.exit(1);
    });
}

module.exports = { syncAllCalendars, syncCalendarEvents: exports.syncCalendarEvents };
