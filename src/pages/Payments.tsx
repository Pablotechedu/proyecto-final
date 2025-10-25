import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
  getAllPayments,
  deletePayment,
  formatCurrency,
  Payment,
} from "../services/payments";
import { useAuth } from "../hooks/useAuth";

export default function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const isAdminOrEditor =
    user?.role === "admin" || user?.role === "editor" || user?.isDirector;

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, typeFilter, monthFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPayments(100);
      setPayments(data);
    } catch (err) {
      setError("Error al cargar los pagos. Por favor, intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.patientName.toLowerCase().includes(search) ||
          payment.patientCode.toLowerCase().includes(search)
      );
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((payment) => payment.type === typeFilter);
    }

    // Filtro por mes
    if (monthFilter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.monthCovered === monthFilter
      );
    }

    setFilteredPayments(filtered);
  };

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) {
      return;
    }

    try {
      await deletePayment(paymentId);
      await loadPayments();
    } catch (err) {
      setError("Error al eliminar el pago.");
      console.error(err);
    }
  };

  // Obtener meses únicos para el filtro
  const uniqueMonths = Array.from(
    new Set(payments.map((p) => p.monthCovered))
  ).sort();

  // Calcular totales
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  if (!isAdminOrEditor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          No tienes permisos para ver esta página.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Pagos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredPayments.length} pagos registrados
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/payments/new")}
          >
            Registrar Pago
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente o código..."
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
              <InputLabel>Tipo de Pago</InputLabel>
              <Select
                value={typeFilter}
                label="Tipo de Pago"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Terapia">Terapia</MenuItem>
                <MenuItem value="Evaluacion">Evaluación</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={monthFilter}
                label="Mes"
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {uniqueMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Total Filtrado</Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(totalAmount)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de Pagos */}
      <Card>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <Alert severity="info">
              No se encontraron pagos con los filtros seleccionados.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Mes Cubierto</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Boleta</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.paymentDate).toLocaleDateString(
                            "es-GT"
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.patientCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.monthCovered}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.type}
                          size="small"
                          color={
                            payment.type === "Terapia"
                              ? "primary"
                              : payment.type === "Evaluacion"
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.paymentMethod}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {payment.driveLink ? (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              window.open(payment.driveLink, "_blank")
                            }
                          >
                            <AttachFileIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin boleta
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/payments/${payment.id}/edit`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {(user?.role === "admin" || user?.isDirector) && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(payment.id)}
                              title="Eliminar pago"
                            >
                              <DeleteIcon fontSize="small" />
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
