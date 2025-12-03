import { useState, useEffect, useRef, useCallback } from 'react';
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
import { SessionFormData } from '../types';
import {
  createSessionForm,
  getSessionForm,
  getAvailableObjectives,
} from '../services/sessionForms';
import { getSessionById } from '../services/sessions';
import { formatDateShort } from '../utils/dateHelpers';

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

  // Estados para guardado automático
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialFormDataRef = useRef<Partial<SessionFormData>>({});

  // NOTA: useBlocker requiere createBrowserRouter (data router)
  // Por ahora usamos solo beforeunload para advertir al usuario
  // Si se necesita bloquear navegación interna, migrar a createBrowserRouter

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

  // Auto-save: Guardar cambios cada 30 segundos
  useEffect(() => {
    if (!hasUnsavedChanges || !sessionId) return;

    // Limpiar timer anterior
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Configurar nuevo timer
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30 segundos

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, hasUnsavedChanges, sessionId]);

  // Detectar cambios en el formulario
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Advertencia al cerrar ventana con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadSessionData = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar información de la sesión usando la API
      const response = await getSessionById(sessionId);
      
      if (!response || !response.data) {
        setError('Sesión no encontrada');
        return;
      }

      const session = response.data;
      setSessionInfo(session);

      // Cargar formulario si ya existe
      if (session.formCompleted) {
        const existingForm = await getSessionForm(sessionId);
        if (existingForm) {
          setFormData(existingForm);
          initialFormDataRef.current = existingForm;
        }
      } else {
        initialFormDataRef.current = { sessionObjectives: [] };
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

  // Guardado automático (sin validación completa)
  const handleAutoSave = useCallback(async () => {
    if (!sessionId || !hasUnsavedChanges) return;

    try {
      // Guardar como borrador sin validación estricta
      await createSessionForm(sessionId, formData as SessionFormData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      initialFormDataRef.current = formData;
    } catch (err) {
      console.error('Error en guardado automático:', err);
      // No mostrar error al usuario para no interrumpir su flujo
    }
  }, [sessionId, formData, hasUnsavedChanges]);

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
      
      // Marcar como guardado
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      initialFormDataRef.current = formData;
      
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
        <Stack direction="row" spacing={1} mb={2} alignItems="center">
          <Chip label={sessionInfo.patientName} color="primary" />
          <Chip 
            label={formatDateShort(sessionInfo.startTime)} 
            variant="outlined" 
          />
          {/* Indicador de guardado automático */}
          {hasUnsavedChanges && (
            <Chip 
              label="Cambios sin guardar" 
              color="warning" 
              size="small"
            />
          )}
          {lastSaved && !hasUnsavedChanges && (
            <Chip 
              icon={<CheckCircleIcon />}
              label={`Guardado ${lastSaved.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}`}
              color="success" 
              size="small"
            />
          )}
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
