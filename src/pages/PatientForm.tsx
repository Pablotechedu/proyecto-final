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
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getPatientById, Patient } from '../services/patients';

interface TherapistOption {
  id: string;
  name: string;
  email: string;
}

export default function PatientForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<TherapistOption[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patientCode: '',
    birthDate: '',
    school: '',
    grade: '',
    startDate: '',
    status: 'active' as 'active' | 'inactive',
    diagnosis: '',
    therapistEmail: '',
  });

  useEffect(() => {
    loadTherapists();
    if (isEditMode && id) {
      loadPatient(id);
    }
  }, [id, isEditMode]);

  const loadTherapists = async () => {
    try {
      const therapistsSnapshot = await getDocs(collection(db, 'users'));
      const therapistsData = therapistsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        }))
        .filter(t => t.name);
      setTherapists(therapistsData);
    } catch (err) {
      console.error('Error loading therapists:', err);
    }
  };

  const loadPatient = async (patientId: string) => {
    try {
      setLoading(true);
      const patient = await getPatientById(patientId);
      if (patient) {
        setFormData({
          firstName: patient.firstName,
          lastName: patient.lastName,
          patientCode: patient.patientCode,
          birthDate: patient.birthDate,
          school: patient.school,
          grade: patient.grade,
          startDate: patient.startDate,
          status: patient.status,
          diagnosis: patient.diagnosis,
          therapistEmail: patient.therapistEmail || '',
        });
      } else {
        setError('Paciente no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el paciente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!formData.patientCode.trim()) {
      setError('El código del paciente es requerido');
      return false;
    }
    if (!formData.birthDate) {
      setError('La fecha de nacimiento es requerida');
      return false;
    }
    if (!formData.school.trim()) {
      setError('El colegio es requerido');
      return false;
    }
    if (!formData.grade.trim()) {
      setError('El grado es requerido');
      return false;
    }
    if (!formData.startDate) {
      setError('La fecha de inicio es requerida');
      return false;
    }
    if (!formData.diagnosis.trim()) {
      setError('El diagnóstico es requerido');
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

      if (isEditMode && id) {
        // Actualizar paciente existente
        const patientRef = doc(db, 'patients', id);
        await updateDoc(patientRef, formData);
      } else {
        // Crear nuevo paciente
        await addDoc(collection(db, 'patients'), formData);
      }

      navigate('/patients');
    } catch (err) {
      setError('Error al guardar el paciente. Por favor, intenta de nuevo.');
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
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/patients')}
          sx={{ mb: 2 }}
        >
          Volver a Pacientes
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Información Personal */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Apellido"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Código del Paciente"
                      value={formData.patientCode}
                      onChange={(e) => handleChange('patientCode', e.target.value.toUpperCase())}
                      placeholder="Ej: AARRIO01"
                      required
                      helperText="Código único del paciente"
                    />
                    <TextField
                      fullWidth
                      label="Fecha de Nacimiento"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Información Académica */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información Académica
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Colegio"
                    value={formData.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Grado"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    placeholder="Ej: 3ro Primaria"
                    required
                  />
                </Stack>
              </Box>

              {/* Información Clínica */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información Clínica
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Diagnóstico"
                    value={formData.diagnosis}
                    onChange={(e) => handleChange('diagnosis', e.target.value)}
                    placeholder="Ej: Dislexia, TDAH, etc."
                    required
                  />
                  <TextField
                    fullWidth
                    label="Fecha de Inicio"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Fecha de inicio de terapias"
                  />
                </Stack>
              </Box>

              {/* Asignación */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Asignación
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Terapeuta Asignado</InputLabel>
                    <Select
                      value={formData.therapistEmail}
                      label="Terapeuta Asignado"
                      onChange={(e) => handleChange('therapistEmail', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Sin asignar</em>
                      </MenuItem>
                      {therapists.map((therapist) => (
                        <MenuItem key={therapist.id} value={therapist.email}>
                          {therapist.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.status}
                      label="Estado"
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <MenuItem value="active">Activo</MenuItem>
                      <MenuItem value="inactive">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              {/* Botones */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/patients')}
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
                  {saving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Paciente'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
