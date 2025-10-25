const { google } = require('googleapis');
require('dotenv').config();

async function testCalendarAccess() {
  try {
    console.log('🔍 Probando acceso a Google Calendar...\n');
    
    // Configurar autenticación con delegación de usuario
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      // IMPORTANTE: Delegar como el usuario que tiene acceso al calendario
      clientOptions: {
        subject: 'monica@learningmodels.com.gt' // Usuario a impersonar
      }
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Probar con el calendario de Mónica
    const calendarId = 'monica@learningmodels.com.gt';
    
    console.log(`📅 Intentando leer calendario: ${calendarId}`);
    
    // Obtener eventos de hoy
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    console.log(`   Rango: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}\n`);
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    
    console.log('✅ ¡Acceso exitoso!\n');
    console.log(`📊 Eventos encontrados hoy: ${events.length}\n`);
    
    if (events.length > 0) {
      console.log('📋 Primeros 5 eventos:\n');
      events.slice(0, 5).forEach((event, index) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${index + 1}. ${event.summary || 'Sin título'}`);
        console.log(`   Hora: ${new Date(start).toLocaleString('es-GT')}`);
        console.log(`   Descripción: ${event.description || 'Sin descripción'}`);
        console.log(`   Ubicación: ${event.location || 'Sin ubicación'}\n`);
      });
    } else {
      console.log('ℹ️  No hay eventos programados para hoy.');
      console.log('   Esto es normal si no hay sesiones hoy.\n');
    }
    
    console.log('✨ Prueba completada exitosamente!');
    console.log('   El Service Account está configurado correctamente.\n');
    
  } catch (error) {
    console.error('❌ Error al acceder a Google Calendar:\n');
    
    if (error.code === 403) {
      console.error('🔒 Error de permisos (403)');
      console.error('   Posibles causas:');
      console.error('   1. Domain-Wide Delegation no está habilitado');
      console.error('   2. Los scopes no están autorizados en Google Workspace Admin');
      console.error('   3. El Service Account no tiene acceso al calendario\n');
      console.error('   Verifica: https://admin.google.com → Security → API Controls → Domain-wide delegation\n');
    } else if (error.code === 404) {
      console.error('📅 Calendario no encontrado (404)');
      console.error('   Verifica que el email del calendario sea correcto\n');
    } else {
      console.error('   Código de error:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('\n   Error completo:', error);
    }
    
    process.exit(1);
  }
}

// Ejecutar prueba
testCalendarAccess()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
