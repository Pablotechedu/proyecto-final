import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { 
  getPatientById, 
  getPatientParents, 
  getRelatedProfessionals,
  calculateAge, 
  getFullName, 
  Patient, 
  ParentTutor,
  RelatedProfessional 
} from '../services/patients';
import { getPatientPayments, Payment, formatCurrency } from '../services/payments';
import { getPatientSessions, Session, formatTime } from '../services/sessions';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [parents, setParents] = useState<ParentTutor[]>([]);
  const [professionals, setProfessionals] = useState<RelatedProfessional[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Determinar el texto y destino del botón "Volver"
  const isTherapist = user?.role === 'therapist' && !user?.isDirector;
  const backButtonText = isTherapist ? 'Volver a Mi Hub' : 'Volver a Pacientes';
  const backButtonPath = isTherapist ? '/hub' : '/patients';

  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [patientData, parentsData, professionalsData, paymentsData, sessionsData] = await Promise.all([
        getPatientById(patientId),
        getPatientParents(patientId),
        getRelatedProfessionals(patientId),
        getPatientPayments(patientId),
        getPatientSessions(patientId),
      ]);

      if (patientData) {
        setPatient(patientData);
        setParents(parentsData);
        setProfessionals(professionalsData);
        setPayments(paymentsData.data || []);
        setSessions(sessionsData.data || []);
      } else {
        setError('Paciente no encontrado');
      }
    } catch (err) {
      setError('Error al cargar la información del paciente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo pendiente
  const calculatePendingBalance = () => {
    if (!patient) return { totalPending: 0, monthlyFee: 0, monthsElapsed: 0, totalExpected: 0, totalPaid: 0 };
    
    const monthlyFee = patient.monthlyFee || 0;
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Calcular cuántos meses han pasado desde el inicio del tratamiento
    const startDate = new Date(patient.startDate);
    const today = new Date();
    const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                          (today.getMonth() - startDate.getMonth()) + 1;
    
    const totalExpected = monthlyFee * monthsElapsed;
    const totalPending = Math.max(0, totalExpected - totalPaid);
    
    return { 
      totalPending, 
      monthlyFee,
      monthsElapsed,
      totalExpected,
      totalPaid
    };
  };

  const pendingBalance = calculatePendingBalance();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Paciente no encontrado'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backButtonPath)}
          sx={{ mt: 2 }}
        >
          {backButtonText}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(backButtonPath)}
          sx={{ mb: 2 }}
        >
          {backButtonText}
        </Button>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {getFullName(patient)}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={patient.patientCode}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={patient.status === 'active' ? 'Activo' : 'Inactivo'}
                size="small"
                color={patient.status === 'active' ? 'success' : 'default'}
              />
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Editar
          </Button>
        </Stack>
      </Box>

      {/* Información Rápida */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <PersonIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Información Personal
                </Typography>
              </Stack>
              <Typography variant="body1">
                {calculateAge(patient.birthDate)} años
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Nacimiento: {new Date(patient.birthDate).toLocaleDateString('es-GT')}
              </Typography>
            </Box>

            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <SchoolIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Información Académica
                </Typography>
              </Stack>
              <Typography variant="body1">{patient.school}</Typography>
              <Typography variant="caption" color="text.secondary">
                {patient.grade}
              </Typography>
            </Box>

            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <MedicalIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">
                  Diagnóstico
                </Typography>
              </Stack>
              <Typography variant="body1">{patient.diagnosis}</Typography>
              <Typography variant="caption" color="text.secondary">
                Inicio: {new Date(patient.startDate).toLocaleDateString('es-GT')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="patient detail tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Historial Clínico" />
          <Tab label="Padres y Tutores" />
          <Tab label="Profesionales Relacionados" />
          <Tab label="Información de Contacto" />
          <Tab label="Pagos" />
        </Tabs>

        {/* Tab 1: Historial Clínico */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Historial de Sesiones
          </Typography>
          
          {sessions.length === 0 ? (
            <Alert severity="info">
              No hay historial clínico registrado para este paciente.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {sessions
                .sort((a, b) => {
                  const dateA = a.startTime?.toDate ? a.startTime.toDate() : new Date(a.startTime);
                  const dateB = b.startTime?.toDate ? b.startTime.toDate() : new Date(b.startTime);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((session) => {
                  const sessionDate = session.startTime?.toDate 
                    ? session.startTime.toDate() 
                    : new Date(session.startTime);
                  
                  return (
                    <Card key={session.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="subtitle1" fontWeight="medium">
                                {sessionDate.toLocaleDateString('es-GT', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              <Chip
                                label={session.status}
                                size="small"
                                color={
                                  session.status === 'Completed' 
                                    ? 'success' 
                                    : session.status === 'Cancelled' 
                                    ? 'error' 
                                    : 'default'
                                }
                              />
                            </Stack>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              🕐 {formatTime(session.startTime)}
                              {session.duration && ` • Duración: ${session.duration} min`}
                              {session.therapistName && ` • Terapeuta: ${session.therapistName}`}
                            </Typography>
                            
                            {session.sessionType && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Tipo:</strong> {session.sessionType}
                              </Typography>
                            )}
                            
                            {session.notes && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Notas:</strong> {session.notes}
                              </Typography>
                            )}
                            
                            {session.formCompleted && (
                              <Chip
                                label="Formulario completado"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/sessions/${session.id}/form`)}
                            title={session.formCompleted ? "Ver formulario" : "Completar formulario"}
                          >
                            {session.formCompleted ? <VisibilityIcon /> : <EditIcon />}
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
            </Stack>
          )}
        </TabPanel>

        {/* Tab 2: Padres y Tutores */}
        <TabPanel value={currentTab} index={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Padres y Tutores
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/patients/${id}/parents/new`)}
            >
              Agregar Padre/Tutor
            </Button>
          </Stack>

          {parents.length === 0 ? (
            <Alert severity="info">
              No hay padres o tutores registrados para este paciente.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {parents.map((parent) => (
                <Card key={parent.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6">
                          {parent.name}
                          {parent.isPrimary && (
                            <Chip
                              label="Principal"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {parent.relationship}
                        </Typography>
                        <Stack spacing={0.5} mt={1}>
                          <Typography variant="body2">
                            📧 {parent.email}
                          </Typography>
                          <Typography variant="body2">
                            📱 {parent.phone}
                          </Typography>
                        </Stack>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/patients/${id}/parents/${parent.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Tab 3: Profesionales Relacionados */}
        <TabPanel value={currentTab} index={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Profesionales Relacionados
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/patients/${id}/professionals/new`)}
            >
              Agregar Profesional
            </Button>
          </Stack>

          {professionals.length === 0 ? (
            <Alert severity="info">
              No hay profesionales relacionados registrados para este paciente.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {professionals.map((professional) => (
                <Card key={professional.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="h6">
                          {professional.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {professional.profession} - {professional.specialty}
                        </Typography>
                        <Stack spacing={0.5} mt={1}>
                          <Typography variant="body2">
                            🏥 {professional.institution}
                          </Typography>
                          <Typography variant="body2">
                            📧 {professional.email}
                          </Typography>
                          <Typography variant="body2">
                            📱 {professional.phone}
                          </Typography>
                          {professional.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              📝 {professional.notes}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/patients/${id}/professionals/${professional.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Tab 4: Información de Contacto */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Información de Contacto del Paciente
          </Typography>
          
          <Stack spacing={3}>
            {/* Datos del Paciente */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Datos del Paciente
                </Typography>
                <Stack spacing={1.5}>
                  {patient.email && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" minWidth={120}>
                        📧 Email:
                      </Typography>
                      <Typography variant="body2">{patient.email}</Typography>
                    </Box>
                  )}
                  {patient.studentEmail && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" minWidth={120}>
                        📧 Email Estudiante:
                      </Typography>
                      <Typography variant="body2">{patient.studentEmail}</Typography>
                    </Box>
                  )}
                  {patient.phone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" minWidth={120}>
                        📱 Teléfono:
                      </Typography>
                      <Typography variant="body2">{patient.phone}</Typography>
                    </Box>
                  )}
                  {patient.address && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary" minWidth={120}>
                        🏠 Dirección:
                      </Typography>
                      <Typography variant="body2">{patient.address}</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Contactos de Emergencia */}
            {parents.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Contactos de Emergencia (Padres/Tutores)
                  </Typography>
                  <Stack spacing={2} mt={2}>
                    {parents.map((parent) => (
                      <Box key={parent.id}>
                        <Typography variant="body2" fontWeight="medium">
                          {parent.name} ({parent.relationship})
                          {parent.isPrimary && (
                            <Chip
                              label="Principal"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Stack spacing={0.5} mt={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            📧 {parent.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📱 {parent.phone}
                          </Typography>
                        </Stack>
                        {parent !== parents[parents.length - 1] && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </TabPanel>

        {/* Tab 5: Pagos */}
        <TabPanel value={currentTab} index={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Información Financiera
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate('/payments/new', { 
                state: { 
                  patientId: id, 
                  patientName: getFullName(patient),
                  amount: pendingBalance.monthlyFee,
                  monthCovered: new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })
                } 
              })}
            >
              Registrar Pago Pendiente
            </Button>
          </Stack>

          {/* Resumen Financiero */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: pendingBalance.totalPending > 0 ? 'warning.lighter' : 'success.lighter' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Resumen Financiero
              </Typography>
              <Stack spacing={2} mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Cuota Mensual:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(pendingBalance.monthlyFee)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Meses Transcurridos:
                  </Typography>
                  <Typography variant="body1">
                    {pendingBalance.monthsElapsed} {pendingBalance.monthsElapsed === 1 ? 'mes' : 'meses'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Esperado:
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(pendingBalance.totalExpected)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Pagado:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {formatCurrency(pendingBalance.totalPaid)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="text.primary">
                    Saldo Pendiente:
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    color={pendingBalance.totalPending > 0 ? 'error.main' : 'success.main'}
                  >
                    {formatCurrency(pendingBalance.totalPending)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Historial de Pagos */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Historial de Pagos
          </Typography>
          
          {payments.length === 0 ? (
            <Alert severity="info">
              No hay pagos registrados para este paciente.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {payments
                .sort((a, b) => {
                  const dateA = a.paymentDate?.toDate ? a.paymentDate.toDate() : new Date(a.paymentDate);
                  const dateB = b.paymentDate?.toDate ? b.paymentDate.toDate() : new Date(b.paymentDate);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((payment) => {
                  const paymentDate = payment.paymentDate?.toDate 
                    ? payment.paymentDate.toDate() 
                    : new Date(payment.paymentDate);
                  
                  return (
                    <Card key={payment.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <Typography variant="h6" color="primary">
                                {formatCurrency(payment.amount)}
                              </Typography>
                              <Chip
                                label={payment.status || 'Completed'}
                                size="small"
                                color={payment.status === 'Completed' ? 'success' : 'warning'}
                              />
                            </Stack>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              📅 {paymentDate.toLocaleDateString('es-GT', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            
                            <Stack spacing={0.5} mt={1}>
                              {payment.monthCovered && (
                                <Typography variant="body2">
                                  <strong>Mes cubierto:</strong> {payment.monthCovered}
                                </Typography>
                              )}
                              
                              {payment.paymentMethod && (
                                <Typography variant="body2">
                                  <strong>Método de pago:</strong> {payment.paymentMethod}
                                </Typography>
                              )}
                              
                              {payment.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  📝 {payment.notes}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
            </Stack>
          )}
        </TabPanel>
      </Card>
    </Container>
  );
}
