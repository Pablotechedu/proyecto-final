import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SessionFormData } from '../types';
import {
  createSessionForm,
  getSessionForm,
  getAvailableObjectives,
} from '../services/sessionForms';

// Importar secciones del formulario
import GeneralInfoSection from '../components/sessionForm/GeneralInfoSection';
import ExecutiveFunctionsSection from '../components/sessionForm/ExecutiveFunctionsSection';
import ObjectivesSelector from '../components/sessionForm/ObjectivesSelector';
import LectoescrituraSection from '../components/sessionForm/LectoescrituraSection';
import MathematicsSection from '../components/sessionForm/MathematicsSection';
import EmotionalTherapySection from '../components/sessionForm/EmotionalTherapySection';
import CognitiveRehabSection from '../components/sessionForm/CognitiveRehabSection';
import TutoringSection from '../components/sessionForm/TutoringSection';
import RecommendationsSection from '../components/sessionForm/RecommendationsSection';

export default function SessionForm() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Estado del formulario
  const [formData, setFormData] = useState<Partial<SessionFormData>>({
    sessionObjectives: [],
  });

  const steps = [
    'Información General',
    'Funciones Ejecutivas',
    'Objetivos de la Sesión',
    'Recomendaciones',
  ];

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar información de la sesión
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        setError('Sesión no encontrada');
        return;
      }

      const session = { id: sessionSnap.id, ...sessionSnap.data() };
      setSessionInfo(session);

      // Cargar formulario si ya existe
      if (session.formCompleted) {
        const existingForm = await getSessionForm(sessionId);
        if (existingForm) {
          setFormData(existingForm);
        }
      }
    } catch (err) {
      setError('Error al cargar la sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (sectionData: Partial<SessionFormData>) => {
    setFormData(prev => ({ ...prev, ...sectionData }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const validateForm = (): boolean => {
    // Validaciones básicas
    if (!formData.attendance) {
      setError('Debes seleccionar la asistencia');
      setActiveStep(0);
      return false;
    }

    if (!formData.modality) {
      setError('Debes seleccionar la modalidad');
      setActiveStep(0);
      return false;
    }

    if (!formData.sessionObjectives || formData.sessionObjectives.length === 0) {
      setError('Debes seleccionar al menos un objetivo de la sesión');
      setActiveStep(2);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!sessionId) {
      setError('ID de sesión no válido');
      return;
    }

    try {
      setSaving(true);
      await createSessionForm(sessionId, formData as SessionFormData);
      
      // Redirigir al hub de terapeuta
      navigate('/therapist-hub');
    } catch (err) {
      setError('Error al guardar el formulario. Por favor, intenta de nuevo.');
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

  if (!sessionInfo) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Sesión no encontrada</Alert>
      </Container>
    );
  }

  // Determinar qué secciones mostrar según objetivos seleccionados
  const showLectoescritura = formData.sessionObjectives?.includes('Lectoescritura');
  const showMathematics = formData.sessionObjectives?.includes('Matemáticas');
  const showEmotionalTherapy = formData.sessionObjectives?.includes('Terapia Emocional');
  const showCognitiveRehab = formData.sessionObjectives?.includes('Rehabilitación Cognitiva');
  const showTutoring = formData.sessionObjectives?.includes('Tutorías');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/therapist-hub')}
          sx={{ mb: 2 }}
        >
          Volver al Hub
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Formulario de Sesión
        </Typography>
        <Stack direction="row" spacing={1} mb={2}>
          <Chip label={sessionInfo.patientName} color="primary" />
          <Chip 
            label={new Date(sessionInfo.startTime).toLocaleDateString('es-GT')} 
            variant="outlined" 
          />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Secciones del Formulario */}
      <Card>
        <CardContent>
          {/* Paso 0: Información General */}
          {activeStep === 0 && (
            <GeneralInfoSection
              data={formData}
              onChange={handleSectionChange}
            />
          )}

          {/* Paso 1: Funciones Ejecutivas */}
          {activeStep === 1 && (
            <ExecutiveFunctionsSection
              data={formData}
              onChange={handleSectionChange}
            />
          )}

          {/* Paso 2: Objetivos y Secciones Condicionales */}
          {activeStep === 2 && (
            <Box>
              <ObjectivesSelector
                selectedObjectives={formData.sessionObjectives || []}
                onChange={(objectives) => handleFieldChange('sessionObjectives', objectives)}
              />

              {/* Mensaje informativo */}
              {formData.sessionObjectives && formData.sessionObjectives.length > 0 && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Las secciones seleccionadas aparecerán a continuación. Completa solo las que trabajaste en esta sesión.
                </Alert>
              )}

              {formData.sessionObjectives && formData.sessionObjectives.length === 0 && (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  Por favor, selecciona al menos un objetivo de la sesión para continuar.
                </Alert>
              )}

              {/* Secciones condicionales */}
              {showLectoescritura && (
                <Box mt={4}>
                  <LectoescrituraSection
                    data={formData.lectoescritura || {}}
                    onChange={(data) => handleFieldChange('lectoescritura', data)}
                  />
                </Box>
              )}

              {showMathematics && (
                <Box mt={4}>
                  <MathematicsSection
                    data={formData.mathematics || {}}
                    onChange={(data) => handleFieldChange('mathematics', data)}
                  />
                </Box>
              )}

              {showEmotionalTherapy && (
                <Box mt={4}>
                  <EmotionalTherapySection
                    data={formData.emotionalTherapy || {}}
                    onChange={(data) => handleFieldChange('emotionalTherapy', data)}
                  />
                </Box>
              )}

              {showCognitiveRehab && (
                <Box mt={4}>
                  <CognitiveRehabSection
                    data={formData.cognitiveRehabilitation || {}}
                    onChange={(data) => handleFieldChange('cognitiveRehabilitation', data)}
                  />
                </Box>
              )}

              {showTutoring && (
                <Box mt={4}>
                  <TutoringSection
                    data={formData.tutoring || {}}
                    onChange={(data) => handleFieldChange('tutoring', data)}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Paso 3: Recomendaciones */}
          {activeStep === 3 && (
            <RecommendationsSection
              data={formData}
              onChange={handleSectionChange}
            />
          )}

          {/* Botones de navegación */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Anterior
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Guardando...' : 'Guardar Formulario'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
