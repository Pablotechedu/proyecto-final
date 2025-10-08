import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import {
  getPaymentById,
  createPayment,
  updatePayment,
  getCurrentMonth,
  Payment,
} from '../services/payments';
import { getAllPatients, Patient } from '../services/patients';

export default function PaymentForm() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const isEditMode = paymentId !== undefined && paymentId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    patientCode: '',
    patientName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia',
    monthCovered: getCurrentMonth(),
    type: 'Terapia' as 'Terapia' | 'Evaluacion' | 'Otro',
    driveLink: '',
    notes: '',
  });

  useEffect(() => {
    loadPatients();
    if (isEditMode && paymentId) {
      loadPayment(paymentId);
    }
  }, [paymentId, isEditMode]);

  const loadPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const loadPayment = async (id: string) => {
    try {
      setLoading(true);
      const payment = await getPaymentById(id);
      if (payment) {
        setFormData({
          patientCode: payment.patientCode,
          patientName: payment.patientName,
          amount: payment.amount.toString(),
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          monthCovered: payment.monthCovered,
          type: payment.type,
          driveLink: payment.driveLink || '',
          notes: payment.notes || '',
        });

        // Buscar el paciente seleccionado
        const patient = patients.find(p => p.patientCode === payment.patientCode);
        if (patient) {
          setSelectedPatient(patient);
        }
      } else {
        setError('Pago no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el pago');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (_event: any, newValue: Patient | null) => {
    setSelectedPatient(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        patientCode: newValue.patientCode,
        patientName: `${newValue.firstName} ${newValue.lastName}`,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patientCode: '',
        patientName: '',
      }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.patientCode) {
      setError('Debes seleccionar un paciente');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }
    if (!formData.paymentDate) {
      setError('La fecha de pago es requerida');
      return false;
    }
    if (!formData.monthCovered) {
      setError('El mes cubierto es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Crear objeto base sin campos opcionales undefined
      const paymentData: any = {
        patientCode: formData.patientCode,
        patientName: formData.patientName,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        monthCovered: formData.monthCovered,
        type: formData.type,
      };

      // Solo agregar campos opcionales si tienen valor
      if (formData.driveLink && formData.driveLink.trim()) {
        paymentData.driveLink = formData.driveLink.trim();
      }
      
      if (formData.notes && formData.notes.trim()) {
        paymentData.notes = formData.notes.trim();
      }

      if (isEditMode && paymentId) {
        await updatePayment(paymentId, paymentData);
      } else {
        await createPayment(paymentData);
      }

      navigate('/payments');
    } catch (err) {
      setError('Error al guardar el pago. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/payments')}
          sx={{ mb: 2 }}
        >
          Volver a Pagos
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Pago' : 'Registrar Nuevo Pago'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Selección de Paciente */}
              <Autocomplete
                options={patients}
                value={selectedPatient}
                onChange={handlePatientChange}
                getOptionLabel={(option) => 
                  `${option.firstName} ${option.lastName} (${option.patientCode})`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Paciente"
                    required
                    placeholder="Buscar paciente..."
                  />
                )}
                disabled={isEditMode}
              />

              {/* Tipo de Pago */}
              <FormControl fullWidth required>
                <InputLabel>Tipo de Pago</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo de Pago"
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <MenuItem value="Terapia">Terapia</MenuItem>
                  <MenuItem value="Evaluacion">Evaluación</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>

              {/* Monto y Fecha */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Monto"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  fullWidth
                  label="Fecha de Pago"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              {/* Método de Pago y Mes Cubierto */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    label="Método de Pago"
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  >
                    <MenuItem value="Transferencia">Transferencia</MenuItem>
                    <MenuItem value="Efectivo">Efectivo</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                    <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Mes Cubierto"
                  value={formData.monthCovered}
                  onChange={(e) => handleChange('monthCovered', e.target.value)}
                  required
                  placeholder="Ej: octubre 2025"
                />
              </Stack>

              {/* Link de Google Drive */}
              <TextField
                fullWidth
                label="Link de Boleta (Google Drive)"
                value={formData.driveLink}
                onChange={(e) => handleChange('driveLink', e.target.value)}
                placeholder="https://drive.google.com/..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Pega el link de la boleta desde Google Drive"
              />

              {/* Notas */}
              <TextField
                fullWidth
                label="Notas Adicionales"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                multiline
                rows={3}
                placeholder="Información adicional sobre el pago..."
              />

              {/* Botones */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/payments')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Registrar'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
