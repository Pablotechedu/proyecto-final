import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getFinancialSummary,
  getRecentPayments,
  formatCurrency,
  FinancialSummary,
  Payment,
} from '../services/financial';
import { getDashboardStats, DashboardStats } from '../services/stats';
import { useAuth } from '../hooks/useAuth';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

function KPICard({ title, value, trend, icon, color = 'primary' }: KPICardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                {trend.isPositive ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography
                  variant="caption"
                  color={trend.isPositive ? 'success.main' : 'error.main'}
                >
                  {trend.percentage.toFixed(1)}% vs mes anterior
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: 'white',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // Estado para el selector de mes/año
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const isAdminOrEditor = user?.permissions?.isAdmin || user?.permissions?.isEditor || user?.permissions?.isDirector;

  useEffect(() => {
    // Solo cargar datos si es admin o editor
    if (isAdminOrEditor) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAdminOrEditor, selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, paymentsData, statsData] = await Promise.all([
        getFinancialSummary(selectedMonth, selectedYear),
        getRecentPayments(5),
        getDashboardStats(selectedMonth, selectedYear),
      ]);

      setSummary(summaryData);
      setRecentPayments(paymentsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      
      // Si es error de permisos de Firestore
      if (err.message?.includes('Missing or insufficient permissions') || 
          err.message?.includes('FirebaseError')) {
        setError('Error de permisos. Por favor, cierra sesión y vuelve a iniciar sesión para actualizar tus permisos.');
      } else {
        setError('Error al cargar el dashboard. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !summary) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Error al cargar datos'}</Alert>
      </Container>
    );
  }

  // Si es terapeuta, mostrar mensaje diferente
  if (!isAdminOrEditor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenido, {user?.name}
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Para ver tu agenda y tareas del día, ve a "Mi Hub" en el menú lateral.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard General
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resumen del mes seleccionado
            </Typography>
          </Box>
          
          {/* Selector de Mes y Año */}
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={selectedMonth}
                label="Mes"
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                <MenuItem value={1}>Enero</MenuItem>
                <MenuItem value={2}>Febrero</MenuItem>
                <MenuItem value={3}>Marzo</MenuItem>
                <MenuItem value={4}>Abril</MenuItem>
                <MenuItem value={5}>Mayo</MenuItem>
                <MenuItem value={6}>Junio</MenuItem>
                <MenuItem value={7}>Julio</MenuItem>
                <MenuItem value={8}>Agosto</MenuItem>
                <MenuItem value={9}>Septiembre</MenuItem>
                <MenuItem value={10}>Octubre</MenuItem>
                <MenuItem value={11}>Noviembre</MenuItem>
                <MenuItem value={12}>Diciembre</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                label="Año"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <MenuItem value={2024}>2024</MenuItem>
                <MenuItem value={2025}>2025</MenuItem>
                <MenuItem value={2026}>2026</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      {/* Estadísticas Generales */}
      {stats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <KPICard
            title="Total Pacientes"
            value={stats.patients.total.toString()}
            icon={<PeopleIcon />}
            color="primary"
          />
          <KPICard
            title="Sesiones Completadas"
            value={stats.sessions.completed.toString()}
            icon={<CheckCircleIcon />}
            color="success"
          />
          <KPICard
            title="Sesiones Este Mes"
            value={stats.sessions.thisMonth.toString()}
            icon={<EventNoteIcon />}
            color="primary"
          />
        </Box>
      )}

      {/* KPIs Financieros */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Resumen Financiero
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <KPICard
          title="Ingresos Cobrados"
          value={formatCurrency(summary.totalCollected)}
          icon={<MoneyIcon />}
          color="success"
        />
        <KPICard
          title="Cuentas por Cobrar"
          value={formatCurrency(summary.accountsReceivable)}
          icon={<WarningIcon />}
          color="warning"
        />
        <KPICard
          title="Gastos del Mes"
          value={formatCurrency(summary.totalExpenses)}
          icon={<ReceiptIcon />}
          color="error"
        />
        <KPICard
          title="Ingreso Neto"
          value={formatCurrency(summary.netIncome)}
          icon={<AccountBalanceIcon />}
          color={summary.netIncome >= 0 ? 'success' : 'error'}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 3,
        }}
      >
        {/* Desglose de Ingresos */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Desglose de Ingresos
              </Typography>
              <Stack spacing={2} mt={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Terapias
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(summary.incomeByType.terapia)}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(summary.incomeByType.terapia / summary.totalCollected) * 100}%`,
                        bgcolor: 'primary.main',
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Evaluaciones
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(summary.incomeByType.evaluacion)}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(summary.incomeByType.evaluacion / summary.totalCollected) * 100}%`,
                        bgcolor: 'success.main',
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Otros
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(summary.incomeByType.otro)}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(summary.incomeByType.otro / summary.totalCollected) * 100}%`,
                        bgcolor: 'info.main',
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Últimos Pagos */}
        <Box>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Últimos Pagos Registrados
                </Typography>
                <Chip
                  label={`${recentPayments.length} pagos`}
                  size="small"
                  color="primary"
                />
              </Stack>

              {recentPayments.length === 0 ? (
                <Alert severity="info">
                  No hay pagos registrados este mes.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.patientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.patientCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.type}
                              size="small"
                              color={
                                payment.type === 'Terapia'
                                  ? 'primary'
                                  : payment.type === 'Evaluacion'
                                  ? 'success'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(payment.paymentDate).toLocaleDateString('es-GT')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(payment.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => navigate('/payments')}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
