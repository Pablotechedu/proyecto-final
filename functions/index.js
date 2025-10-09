const functions = require('firebase-functions');
const { syncCalendarEvents } = require('./syncCalendar');

// Cloud Function HTTP para sincronización manual
exports.syncCalendarEvents = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540, // 9 minutos
    memory: '512MB'
  })
  .https.onRequest(syncCalendarEvents);

// Cloud Function programada para 12:30 PM (Guatemala, UTC-6)
exports.syncCalendarNoon = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB'
  })
  .pubsub.schedule('30 12 * * 1-5') // 12:30 PM Lunes-Viernes
  .timeZone('America/Guatemala')
  .onRun(async (context) => {
    const { syncAllCalendars } = require('./syncCalendar');
    
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));
    
    try {
      const result = await syncAllCalendars(startDate, endDate);
      console.log('Sincronización 12:30 PM completada:', result);
      return result;
    } catch (error) {
      console.error('Error en sincronización 12:30 PM:', error);
      throw error;
    }
  });

// Cloud Function programada para 9:00 PM (Guatemala, UTC-6)
exports.syncCalendarEvening = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB'
  })
  .pubsub.schedule('0 21 * * 1-5') // 9:00 PM Lunes-Viernes
  .timeZone('America/Guatemala')
  .onRun(async (context) => {
    const { syncAllCalendars } = require('./syncCalendar');
    
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));
    
    try {
      const result = await syncAllCalendars(startDate, endDate);
      console.log('Sincronización 9:00 PM completada:', result);
      return result;
    } catch (error) {
      console.error('Error en sincronización 9:00 PM:', error);
      throw error;
    }
  });
