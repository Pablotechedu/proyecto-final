import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  MedicalServices as MedicalIcon,
  AttachMoney as MoneyIcon,
  EventNote as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy as firestoreOrderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAllPatients, calculateAge, getFullName, Patient } from '../services/patients';
import { useAuth } from '../hooks/useAuth';

interface TherapistInfo {
  id: string;
  name: string;
  email: string;
}

interface PatientWithExtras extends Patient {
  therapistName?: string;
  lastSessionDate?: string;
  nextSessionDate?: string;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
}

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithExtras[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithExtras[]>([]);
  const [therapists, setTherapists] = useState<TherapistInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [therapistFilter, setTherapistFilter] = useState<string>('all');

  // Verificar si el usuario es admin o editor
  const isAdminOrEditor = user?.role === 'admin' || user?.role === 'editor' || user?.isDirector;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, therapistFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar pacientes
      const patientsData = await getAllPatients();

      // Cargar terapeutas
      const therapistsSnapshot = await getDocs(collection(db, 'users'));
      const therapistsData = therapistsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        }))
        .filter(t => t.name); // Solo terapeutas con nombre

      setTherapists(therapistsData);

      // Enriquecer pacientes con información adicional
      const enrichedPatients = await Promise.all(
        patientsData.map(async (patient) => {
          const enriched: PatientWithExtras = { ...patient };

          // Obtener nombre del terapeuta (si existe therapistEmail en el paciente)
          // Nota: Necesitarías agregar este campo a tus pacientes
          const therapist = therapistsData.find(t => t.email === patient.therapistEmail);
          if (therapist) {
            enriched.therapistName = therapist.name;
          }

          // Obtener última sesión
          try {
            const sessionsQuery = query(
              collection(db, 'sessions'),
              where('patientCode', '==', patient.patientCode),
              where('status', '==', 'Completed'),
              firestoreOrderBy('startTime', 'desc'),
              limit(1)
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            if (!sessionsSnapshot.empty) {
              const lastSession = sessionsSnapshot.docs[0].data();
              enriched.lastSessionDate = lastSession.startTime;
            }
          } catch (err) {
            console.log('Error loading sessions for patient:', patient.patientCode);
          }

          // Obtener próxima sesión
          try {
            const upcomingQuery = query(
              collection(db, 'sessions'),
              where('patientCode', '==', patient.patientCode),
              where('status', '==', 'Scheduled'),
              firestoreOrderBy('startTime', 'asc'),
              limit(1)
            );
            const upcomingSnapshot = await getDocs(upcomingQuery);
            if (!upcomingSnapshot.empty) {
              const nextSession = upcomingSnapshot.docs[0].data();
              enriched.nextSessionDate = nextSession.startTime;
            }
          } catch (err) {
            console.log('Error loading upcoming sessions for patient:', patient.patientCode);
          }

          // Obtener estado de pago (solo para admin/editor)
          if (isAdminOrEditor) {
            try {
              const currentMonth = new Date().toLocaleString('es-GT', { month: 'long', year: 'numeric' });
              const paymentsQuery = query(
                collection(db, 'payments'),
                where('patientCode', '==', patient.patientCode),
                where('monthCovered', '==', currentMonth)
              );
              const paymentsSnapshot = await getDocs(paymentsQuery);
              enriched.paymentStatus = paymentsSnapshot.empty ? 'pending' : 'paid';
            } catch (err) {
              console.log('Error loading payments for patient:', patient.patientCode);
            }
          }

          return enriched;
        })
      );

      setPatients(enrichedPatients);
      setFilteredPatients(enrichedPatients);
    } catch (err) {
      setError('Error al cargar los pacientes. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.patientCode.toLowerCase().includes(searchLower) ||
          patient.school.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((patient) => patient.status === statusFilter);
    }

    // Filtrar por terapeuta
    if (therapistFilter !== 'all') {
      filtered = filtered.filter((patient) => patient.therapistName === therapistFilter);
    }

    setFilteredPatients(filtered);
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getPaymentStatusColor = (status?: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusLabel = (status?: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return 'Al día';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Atrasado';
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Pacientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients/new')}
        >
          Nuevo Paciente
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, código o colegio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />
            <FormControl sx={{ flex: 1, minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 150 }}>
              <InputLabel>Terapeuta</InputLabel>
              <Select
                value={therapistFilter}
                label="Terapeuta"
                onChange={(e) => setTherapistFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {therapists.map((therapist) => (
                  <MenuItem key={therapist.id} value={therapist.name}>
                    {therapist.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Resultados */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          {filteredPatients.length} paciente(s) encontrado(s)
        </Typography>
      </Box>

      {/* Lista de Pacientes - Tarjetas Amplias */}
      <Stack spacing={2}>
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            sx={{
              '&:hover': {
                boxShadow: 4,
              },
              transition: 'box-shadow 0.3s',
            }}
          >
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Columna 1: Info Principal */}
                <Box flex={1}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                      {patient.firstName[0]}{patient.lastName[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {getFullName(patient)}
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label={patient.patientCode}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                        <Chip
                          label={patient.status === 'active' ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={patient.status === 'active' ? 'success' : 'default'}
                        />
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SchoolIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {patient.school} - {patient.grade}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {calculateAge(patient.birthDate)} años
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Columna 2: Info Adicional */}
                <Box flex={1}>
                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MedicalIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Diagnóstico:</strong> {patient.diagnosis}
                      </Typography>
                    </Box>
                    {patient.therapistName && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Terapeuta:</strong> {patient.therapistName}
                        </Typography>
                      </Box>
                    )}
                    <Box display="flex" alignItems="center" gap={1}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Última sesión:</strong> {formatDate(patient.lastSessionDate)}
                      </Typography>
                    </Box>
                    {patient.nextSessionDate && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Próxima sesión:</strong> {formatDate(patient.nextSessionDate)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Columna 3: Estado de Pago y Acciones */}
                <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-end" minWidth={150}>
                  <Stack spacing={1} alignItems="flex-end">
                    {isAdminOrEditor && patient.paymentStatus && (
                      <Chip
                        icon={<MoneyIcon />}
                        label={getPaymentStatusLabel(patient.paymentStatus)}
                        color={getPaymentStatusColor(patient.paymentStatus)}
                        size="small"
                      />
                    )}
                  </Stack>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewPatient(patient.id)}
                    sx={{ mt: 2 }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Sin resultados */}
      {filteredPatients.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' || therapistFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer paciente'}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
