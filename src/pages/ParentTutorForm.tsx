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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  getParentTutorById,
  addParentTutor,
  updateParentTutor,
  ParentTutor,
} from '../services/patients';

export default function ParentTutorForm() {
  const { patientId, parentId } = useParams<{ patientId: string; parentId: string }>();
  const navigate = useNavigate();
  const isEditMode = parentId !== undefined && parentId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (isEditMode && patientId && parentId) {
      loadParentTutor(patientId, parentId);
    }
  }, [patientId, parentId, isEditMode]);

  const loadParentTutor = async (pId: string, parentTutorId: string) => {
    try {
      setLoading(true);
      const parent = await getParentTutorById(pId, parentTutorId);
      if (parent) {
        setFormData({
          name: parent.name,
          relationship: parent.relationship,
          email: parent.email,
          phone: parent.phone,
          isPrimary: parent.isPrimary,
        });
      } else {
        setError('Padre/Tutor no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el padre/tutor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.relationship.trim()) {
      setError('La relación es requerida');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !patientId) {
      return;
    }

    try {
      setSaving(true);

      // Asegurar que todos los campos tengan valores válidos (no undefined)
      const dataToSave = {
        name: formData.name.trim(),
        relationship: formData.relationship,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isPrimary: formData.isPrimary || false,
      };

      if (isEditMode && parentId) {
        await updateParentTutor(patientId, parentId, dataToSave);
      } else {
        await addParentTutor(patientId, dataToSave);
      }

      navigate(`/patients/${patientId}`);
    } catch (err) {
      setError('Error al guardar el padre/tutor. Por favor, intenta de nuevo.');
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
          onClick={() => navigate(`/patients/${patientId}`)}
          sx={{ mb: 2 }}
        >
          Volver al Paciente
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Editar Padre/Tutor' : 'Nuevo Padre/Tutor'}
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
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Relación</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Relación"
                  onChange={(e) => handleChange('relationship', e.target.value)}
                >
                  <MenuItem value="Madre">Madre</MenuItem>
                  <MenuItem value="Padre">Padre</MenuItem>
                  <MenuItem value="Tutor Legal">Tutor Legal</MenuItem>
                  <MenuItem value="Abuelo/a">Abuelo/a</MenuItem>
                  <MenuItem value="Tío/a">Tío/a</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Ej: +502 1234-5678"
                required
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPrimary}
                    onChange={(e) => handleChange('isPrimary', e.target.checked)}
                  />
                }
                label="Contacto Principal"
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/patients/${patientId}`)}
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
                  {saving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
