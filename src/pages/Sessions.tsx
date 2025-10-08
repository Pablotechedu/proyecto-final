import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

interface Session {
  id: string;
  patientName: string;
  patientCode: string;
  therapistName: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  formCompleted?: boolean;
  modality?: string;
}

export default function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isAdminOrEditor = user?.role === 'admin' || user?.role === 'editor' || user?.isDirector;

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let sessionsQuery;

      if (isAdminOrEditor) {
        // Admin/Editor ven todas las sesiones
        sessionsQuery = query(
          collection(db, 'sessions'),
          orderBy('startTime', 'desc'),
          limit(100)
        );
      } else {
        // Terapeutas solo ven sus sesiones
        sessionsQuery = query(
          collection(db, 'sessions'),
          where('therapistEmail', '==', user.email),
          orderBy('startTime', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(sessionsQuery);
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Session[];

      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Error al cargar las sesiones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        session =>
          session.patientName.toLowerCase().includes(search) ||
          session.patientCode.toLowerCase().includes(search) ||
          session.therapistName?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Completada';
      case 'Scheduled':
        return 'Programada';
      case 'Cancelled':
        return 'Cancelada';
      default:
        return status;
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
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Sesiones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {filteredSessions.length} sesiones encontradas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente, código o terapeuta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Scheduled">Programadas</MenuItem>
                <MenuItem value="Completed">Completadas</MenuItem>
                <MenuItem value="Cancelled">Canceladas</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de Sesiones */}
      <Card>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <Alert severity="info">
              No se encontraron sesiones con los filtros seleccionados.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Terapeuta</TableCell>
                    <TableCell>Modalidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Formulario</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(session.startTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {session.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.patientCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.therapistName || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.modality || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(session.status)}
                          size="small"
                          color={getStatusColor(session.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {session.formCompleted ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Completado"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : session.status === 'Completed' ? (
                          <Chip
                            icon={<ScheduleIcon />}
                            label="Pendiente"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {session.status === 'Completed' && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/sessions/${session.id}/form`)}
                              title={session.formCompleted ? 'Ver formulario' : 'Completar formulario'}
                            >
                              {session.formCompleted ? <VisibilityIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
