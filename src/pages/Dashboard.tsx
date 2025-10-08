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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getFinancialSummary,
  getRecentPayments,
  formatCurrency,
  FinancialSummary,
  Payment,
} from '../services/financial';
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

  const isAdminOrEditor = user?.role === 'admin' || user?.role === 'editor' || user?.isDirector;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, paymentsData] = await Promise.all([
        getFinancialSummary(),
        getRecentPayments(5),
      ]);

      setSummary(summaryData);
      setRecentPayments(paymentsData);
    } catch (err) {
      setError('Error al cargar el dashboard. Por favor, intenta de nuevo.');
      console.error(err);
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
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Financiero
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resumen del mes de {new Date().toLocaleString('es-GT', { month: 'long', year: 'numeric' })}
        </Typography>
      </Box>

      {/* KPIs */}
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
