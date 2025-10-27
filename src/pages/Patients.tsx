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
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPatients, deletePatient, Patient, getFullName, calculateAge } from '../services/patients';
import { useAuth } from '../hooks/useAuth';

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadPatients();
  }, [page, searchTerm, statusFilter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPatients(page, limit, searchTerm, statusFilter);
      
      setPatients(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pacientes');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleDelete = async (patientId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deletePatient(patientId);
      await loadPatients();
    } catch (err) {
      setError('Error al eliminar el paciente.');
      console.error(err);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading && page === 1) {
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
              placeholder="Buscar por nombre, código o email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
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
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {totalItems} paciente(s) encontrado(s)
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      {/* Lista de Pacientes */}
      <Stack spacing={2}>
        {patients.map((patient) => (
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
                      {getFullName(patient)[0].toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {getFullName(patient)}
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label={patient.patientID || patient.patientCode || 'Sin código'}
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
                        {patient.email && (
                          <Typography variant="body2" color="text.secondary">
                            {patient.email}
                          </Typography>
                        )}
                        {patient.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {patient.phone}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Columna 2: Info Adicional */}
                <Box flex={1}>
                  <Stack spacing={1.5}>
                    {patient.birthDate && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Edad:</strong> {calculateAge(patient.birthDate)} años
                        </Typography>
                      </Box>
                    )}
                    {patient.gender && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Género:</strong> {patient.gender}
                        </Typography>
                      </Box>
                    )}
                    {patient.diagnosis && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Diagnóstico:</strong> {patient.diagnosis}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Columna 3: Acciones */}
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minWidth={100}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewPatient(patient.id)}
                      title="Ver detalle"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {isAdmin && (
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(patient.id)}
                        title="Eliminar paciente"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Sin resultados */}
      {patients.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer paciente'}
          </Typography>
        </Box>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
