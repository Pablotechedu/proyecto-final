import admin from 'firebase-admin';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar locale español
faker.locale = 'es';

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class MockDataGenerator {
  constructor() {
    this.users = [];
    this.patients = [];
    this.sessions = [];
    this.payments = [];
  }

  /**
   * Limpiar base de datos antes de generar nuevos datos
   */
  async cleanDatabase() {
    console.log('\n🗑️  Limpiando base de datos antes de generar datos...\n');

    const collections = [
      'users',
      'patients',
      'sessions',
      'sessionForms',
      'payments',
      'parentTutors',
      'professionals',
      'calendarEvents',
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get();

        if (snapshot.empty) {
          continue;
        }

        const batch = db.batch();
        let count = 0;

        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          count++;
        });

        await batch.commit();
        totalDeleted += count;
        console.log(`   ✅ ${count} documentos eliminados de ${collectionName}`);
      } catch (error) {
        console.error(`   ❌ Error limpiando ${collectionName}:`, error.message);
      }
    }

    console.log(`\n📊 Total de documentos eliminados: ${totalDeleted}\n`);
  }

  /**
   * Generar usuarios mock
   */
  async generateUsers(count = 10) {
    console.log('📝 Generando usuarios...');
    
    const roles = [
      { isAdmin: true, isEditor: false, isTherapist: false, isDirector: true },
      { isAdmin: false, isEditor: true, isTherapist: false, isDirector: false },
      { isAdmin: false, isEditor: false, isTherapist: true, isDirector: false }
    ];

    // Usuarios predefinidos para testing
    const predefinedUsers = [
      {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', 10),
        permissions: { isAdmin: true, isEditor: false, isTherapist: false, isDirector: true },
        createdAt: new Date(),
        isActive: true
      },
      {
        name: 'Editor Test',
        email: 'editor@test.com',
        password: await bcrypt.hash('editor123', 10),
        permissions: { isAdmin: false, isEditor: true, isTherapist: false, isDirector: false },
        createdAt: new Date(),
        isActive: true
      },
      {
        name: 'Terapeuta Test',
        email: 'therapist@test.com',
        password: await bcrypt.hash('therapist123', 10),
        permissions: { isAdmin: false, isEditor: false, isTherapist: true, isDirector: false },
        createdAt: new Date(),
        isActive: true
      }
    ];

    // Crear usuarios predefinidos
    for (const user of predefinedUsers) {
      const docRef = await db.collection('users').add(user);
      this.users.push({ id: docRef.id, ...user });
      console.log(`✅ Usuario creado: ${user.name} (${user.email})`);
    }

    // Generar usuarios adicionales
    for (let i = 0; i < count - 3; i++) {
      const user = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: await bcrypt.hash('password123', 10),
        permissions: roles[i % roles.length],
        createdAt: faker.date.past({ years: 2 }),
        isActive: true
      };

      const docRef = await db.collection('users').add(user);
      this.users.push({ id: docRef.id, ...user });
      console.log(`✅ Usuario creado: ${user.name}`);
    }
  }

  /**
   * Generar pacientes mock
   */
  async generatePatients(count = 50) {
    console.log('\n📝 Generando pacientes...');
    
    const diagnoses = [
      'TDAH',
      'Dislexia',
      'Discalculia',
      'TEA',
      'Ansiedad',
      'Depresión',
      'Trastorno del Aprendizaje',
      'Dificultades de Aprendizaje'
    ];

    const genders = ['Masculino', 'Femenino'];
    const grades = ['Kinder', '1ro Primaria', '2do Primaria', '3ro Primaria', '4to Primaria', '5to Primaria', '6to Primaria', '1ro Básico', '2do Básico', '3ro Básico'];
    const schools = ['Colegio San José', 'Liceo Guatemala', 'Colegio Americano', 'Colegio Maya', 'Instituto Central'];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const birthDate = faker.date.birthdate({ min: 5, max: 18, mode: 'age' });
      
      const patient = {
        patientCode: `PAC-${String(i + 1).padStart(4, '0')}`,
        patientID: `PAC-${String(i + 1).padStart(4, '0')}`,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        birthDate,
        gender: faker.helpers.arrayElement(genders),
        diagnosis: faker.helpers.arrayElement(diagnoses),
        status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive']), // 75% activos
        email: faker.internet.email().toLowerCase(),
        studentEmail: faker.internet.email().toLowerCase(),
        phone: faker.phone.number('####-####'),
        address: faker.location.streetAddress(),
        school: faker.helpers.arrayElement(schools),
        grade: faker.helpers.arrayElement(grades),
        hourlyRate: faker.helpers.arrayElement([150, 175, 200, 225, 250]),
        paymentFrequency: faker.helpers.arrayElement(['Semanal', 'Mensual']),
        medication: faker.datatype.boolean() ? faker.lorem.sentence() : '',
        notes: faker.lorem.paragraph(),
        startDate: faker.date.past({ years: 2 }),
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date()
      };

      const docRef = await db.collection('patients').add(patient);
      this.patients.push({ id: docRef.id, ...patient });
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ ${i + 1}/${count} pacientes creados...`);
      }
    }
  }

  /**
   * Generar sesiones mock
   */
  async generateSessions(count = 200) {
    console.log('\n📝 Generando sesiones...');
    
    const therapists = this.users.filter(u => u.permissions.isTherapist);
    if (therapists.length === 0) {
      console.warn('⚠️  No hay terapeutas, usando todos los usuarios');
      therapists.push(...this.users);
    }

    const statuses = ['Scheduled', 'Completed', 'Completed', 'Completed', 'Cancelled']; // 60% completadas
    const types = ['Terapia Individual', 'Evaluación', 'Tutoría', 'Terapia Grupal'];

    for (let i = 0; i < count; i++) {
      const patient = faker.helpers.arrayElement(this.patients);
      const therapist = faker.helpers.arrayElement(therapists);
      const startTime = faker.date.between({ 
        from: new Date(2024, 0, 1), 
        to: new Date() 
      });
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hora

      const session = {
        patientId: patient.id,
        patientName: patient.name,
        patientCode: patient.patientCode,
        therapistId: therapist.id,
        therapistName: therapist.name,
        startTime,
        endTime,
        duration: 1,
        type: faker.helpers.arrayElement(types),
        status: faker.helpers.arrayElement(statuses),
        formCompleted: faker.datatype.boolean(),
        notes: faker.lorem.sentence(),
        createdAt: startTime,
        updatedAt: new Date()
      };

      await db.collection('sessions').add(session);
      this.sessions.push(session);
      
      if ((i + 1) % 20 === 0) {
        console.log(`✅ ${i + 1}/${count} sesiones creadas...`);
      }
    }
  }

  /**
   * Generar pagos mock
   */
  async generatePayments(count = 100) {
    console.log('\n📝 Generando pagos...');
    
    const statuses = ['completed', 'completed', 'completed', 'pending']; // 75% completados
    const paymentMethods = ['Transferencia', 'Efectivo', 'Cheque', 'Tarjeta'];

    for (let i = 0; i < count; i++) {
      const patient = faker.helpers.arrayElement(this.patients);
      const paymentDate = faker.date.between({ 
        from: new Date(2024, 0, 1), 
        to: new Date() 
      });

      const payment = {
        patientId: patient.id,
        patientName: patient.name,
        patientCode: patient.patientCode,
        amount: faker.helpers.arrayElement([600, 800, 1000, 1200, 1500, 2000]),
        paymentDate,
        monthCovered: `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`,
        paymentMethod: faker.helpers.arrayElement(paymentMethods),
        status: faker.helpers.arrayElement(statuses),
        receiptUrl: faker.datatype.boolean() ? faker.internet.url() : null,
        notes: faker.lorem.sentence(),
        createdAt: paymentDate,
        updatedAt: new Date()
      };

      await db.collection('payments').add(payment);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ ${i + 1}/${count} pagos creados...`);
      }
    }
  }

  /**
   * Generar padres/tutores mock
   */
  async generateParentTutors() {
    console.log('\n📝 Generando padres/tutores...');
    
    for (const patient of this.patients) {
      const parentTutor = {
        patientId: patient.id,
        patientName: patient.name,
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement(['Madre', 'Padre', 'Tutor Legal', 'Abuelo/a']),
        phone: faker.phone.number('####-####'),
        email: faker.internet.email().toLowerCase(),
        address: patient.address,
        createdAt: patient.createdAt,
        updatedAt: new Date()
      };

      await db.collection('parentTutors').add(parentTutor);
    }
    console.log(`✅ ${this.patients.length} padres/tutores creados`);
  }

  /**
   * Ejecutar generación completa
   */
  async generateAll() {
    console.log('🚀 Iniciando generación de mock data...\n');
    console.log('⚠️  IMPORTANTE: Asegúrate de estar usando la base de datos de DESARROLLO\n');

    try {
      // Limpiar base de datos primero
      await this.cleanDatabase();

      await this.generateUsers(10);
      await this.generatePatients(50);
      await this.generateSessions(200);
      await this.generatePayments(100);
      await this.generateParentTutors();

      console.log('\n✅ Mock data generado exitosamente!');
      console.log(`
📊 Resumen:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Usuarios: ${this.users.length}
- Pacientes: ${this.patients.length}
- Sesiones: ${this.sessions.length}
- Pagos: 100
- Padres/Tutores: ${this.patients.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 Credenciales de prueba:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:     admin@test.com / admin123
Editor:    editor@test.com / editor123
Terapeuta: therapist@test.com / therapist123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } catch (error) {
      console.error('❌ Error generando mock data:', error);
      throw error;
    }
  }
}

// Ejecutar
const generator = new MockDataGenerator();
generator.generateAll()
  .then(() => {
    console.log('\n✅ Proceso completado. Puedes cerrar esta ventana.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
