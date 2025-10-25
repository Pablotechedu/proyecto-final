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
      
      const [patientData, parentsData, professionalsData] = await Promise.all([
        getPatientById(patientId),
        getPatientParents(patientId),
        getRelatedProfessionals(patientId),
      ]);

      if (patientData) {
        setPatient(patientData);
        setParents(parentsData);
        setProfessionals(professionalsData);
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
          <Alert severity="info">
            El historial de sesiones se mostrará aquí próximamente.
          </Alert>
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
            Información de Contacto
          </Typography>
          <Alert severity="info">
            La información de contacto detallada se mostrará aquí.
          </Alert>
        </TabPanel>

        {/* Tab 5: Pagos */}
        <TabPanel value={currentTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Historial de Pagos
          </Typography>
          <Alert severity="info">
            El historial de pagos se mostrará aquí próximamente.
          </Alert>
        </TabPanel>
      </Card>
    </Container>
  );
}
