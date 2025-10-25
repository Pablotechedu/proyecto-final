import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  getTodaySessions,
  getPendingTasks,
  formatTime,
  calculateDuration,
  Session,
  PendingTask,
} from '../services/sessions';
import { useAuth } from '../hooks/useAuth';

export default function TherapistHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid && (user?.role === 'therapist' || user?.isDirector)) {
      loadHubData();
    }
  }, [user]);

  const loadHubData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const [sessionsData, tasksData] = await Promise.all([
        getTodaySessions(user.uid),
        getPendingTasks(user.uid),
      ]);

      setSessions(sessionsData);
      setTasks(tasksData);
    } catch (err) {
      setError('Error al cargar la información. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
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

  // Si no es terapeuta ni director, mostrar mensaje
  if (user && user.role !== 'therapist' && !user.isDirector) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Esta página es solo para terapeutas. Ve al Dashboard para ver información financiera.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          ¿Qué vamos a hacer hoy?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, {user?.name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date().toLocaleDateString('es-GT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Columna Izquierda: Tareas Pendientes */}
        <Box>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">
                  Tareas Pendientes
                </Typography>
                {tasks.length > 0 && (
                  <Chip 
                    label={tasks.length} 
                    size="small" 
                    color="primary"
                  />
                )}
              </Stack>

              {tasks.length === 0 ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  ¡Excelente! No tienes tareas pendientes.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {tasks.map((task) => (
                    <Card 
                      key={task.id} 
                      variant="outlined"
                      sx={{
                        borderLeft: 4,
                        borderLeftColor: `${getPriorityColor(task.priority)}.main`,
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {task.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {task.description}
                              </Typography>
                            </Box>
                            <Chip
                              label={task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Medio' : 'Bajo'}
                              size="small"
                              color={getPriorityColor(task.priority) as any}
                            />
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {task.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({task.patientCode})
                            </Typography>
                          </Stack>

                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => {
                              if (task.sessionId) {
                                navigate(`/sessions/${task.sessionId}/form`);
                              }
                            }}
                          >
                            Ir ahora
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Columna Derecha: Agenda del Día */}
        <Box>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <ScheduleIcon color="primary" />
                <Typography variant="h6">
                  Agenda del Día
                </Typography>
                {sessions.length > 0 && (
                  <Chip 
                    label={`${sessions.length} sesiones`} 
                    size="small" 
                    color="primary"
                  />
                )}
              </Stack>

              {sessions.length === 0 ? (
                <Alert severity="info">
                  No tienes sesiones programadas para hoy.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {sessions.map((session, index) => {
                    const duration = calculateDuration(session.startTime, session.endTime);
                    const isPast = new Date(session.startTime) < new Date();

                    return (
                      <Box key={session.id}>
                        <Card 
                          variant="outlined"
                          sx={{
                            bgcolor: isPast ? 'action.hover' : 'background.paper',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.selected',
                            },
                          }}
                          onClick={() => {
                            // Al hacer clic en la tarjeta, ir al formulario de la sesión
                            navigate(`/sessions/${session.id}/form`);
                          }}
                        >
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              {/* Hora */}
                              <Box
                                sx={{
                                  minWidth: 80,
                                  textAlign: 'center',
                                  pt: 0.5,
                                }}
                              >
                                <Typography variant="h6" color="primary">
                                  {formatTime(session.startTime)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {duration} min
                                </Typography>
                              </Box>

                              <Divider orientation="vertical" flexItem />

                              {/* Información */}
                              <Box flex={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight="medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const patientRef = session.patientId || session.patientCode;
                                      navigate(`/patients/${patientRef}`);
                                    }}
                                    sx={{
                                      cursor: 'pointer',
                                      '&:hover': {
                                        color: 'primary.main',
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {session.patientName}
                                  </Typography>
                                  <Chip
                                    label={session.status}
                                    size="small"
                                    color={getStatusColor(session.status) as any}
                                  />
                                </Stack>

                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {session.patientCode} • {session.sessionType}
                                </Typography>

                                {!session.formCompleted && session.status === 'Completed' && (
                                  <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                                    <WarningIcon fontSize="small" color="warning" />
                                    <Typography variant="caption" color="warning.main">
                                      Formulario pendiente
                                    </Typography>
                                  </Stack>
                                )}
                              </Box>

                              {/* Acción */}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sessions/${session.id}/form`);
                                }}
                                title="Completar formulario"
                              >
                                <ArrowForwardIcon />
                              </IconButton>
                            </Stack>
                          </CardContent>
                        </Card>

                        {index < sessions.length - 1 && (
                          <Box sx={{ textAlign: 'center', my: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ⬇
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Resumen */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} divider={<Divider orientation="vertical" flexItem />}>
            <Box flex={1} textAlign="center">
              <Typography variant="h3" color="primary">
                {sessions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sesiones hoy
              </Typography>
            </Box>
            <Box flex={1} textAlign="center">
              <Typography variant="h3" color="warning.main">
                {tasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tareas pendientes
              </Typography>
            </Box>
            <Box flex={1} textAlign="center">
              <Typography variant="h3" color="success.main">
                {sessions.filter(s => s.status === 'Completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completadas
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
