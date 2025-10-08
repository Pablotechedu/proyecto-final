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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  getRelatedProfessionalById,
  addRelatedProfessional,
  updateRelatedProfessional,
  RelatedProfessional,
} from '../services/patients';

export default function ProfessionalForm() {
  const { patientId, professionalId } = useParams<{ patientId: string; professionalId: string }>();
  const navigate = useNavigate();
  const isEditMode = professionalId !== undefined && professionalId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    specialty: '',
    institution: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && patientId && professionalId) {
      loadProfessional(patientId, professionalId);
    }
  }, [patientId, professionalId, isEditMode]);

  const loadProfessional = async (pId: string, profId: string) => {
    try {
      setLoading(true);
      const professional = await getRelatedProfessionalById(pId, profId);
      if (professional) {
        setFormData({
          name: professional.name,
          profession: professional.profession,
          specialty: professional.specialty,
          institution: professional.institution,
          email: professional.email,
          phone: professional.phone,
          notes: professional.notes || '',
        });
      } else {
        setError('Profesional no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el profesional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.profession.trim()) {
      setError('La profesión es requerida');
      return false;
    }
    if (!formData.specialty.trim()) {
      setError('La especialidad es requerida');
      return false;
    }
    if (!formData.institution.trim()) {
      setError('La institución es requerida');
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
        profession: formData.profession.trim(),
        specialty: formData.specialty.trim(),
        institution: formData.institution.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim() || '',
      };

      if (isEditMode && professionalId) {
        await updateRelatedProfessional(patientId, professionalId, dataToSave);
      } else {
        await addRelatedProfessional(patientId, dataToSave);
      }

      navigate(`/patients/${patientId}`);
    } catch (err) {
      setError('Error al guardar el profesional. Por favor, intenta de nuevo.');
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
          {isEditMode ? 'Editar Profesional Relacionado' : 'Nuevo Profesional Relacionado'}
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Profesión"
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  placeholder="Ej: Psicólogo, Neurólogo, Terapeuta"
                  required
                />
                <TextField
                  fullWidth
                  label="Especialidad"
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  placeholder="Ej: Neuropsicología Infantil"
                  required
                />
              </Stack>

              <TextField
                fullWidth
                label="Institución"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                placeholder="Ej: Hospital Roosevelt, Clínica Privada"
                required
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              </Stack>

              <TextField
                fullWidth
                label="Notas Adicionales"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                multiline
                rows={3}
                placeholder="Información adicional relevante..."
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
