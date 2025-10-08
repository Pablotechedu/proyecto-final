import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { SessionFormData } from '../../types';
import { getAvailableEmotions } from '../../services/sessionForms';

interface Props {
  data: Partial<SessionFormData>;
  onChange: (data: Partial<SessionFormData>) => void;
}

export default function ExecutiveFunctionsSection({ data, onChange }: Props) {
  const handleChange = (field: keyof SessionFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleEmotionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('predominantEmotions', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        II. Funciones Ejecutivas
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Observaciones transversales
      </Typography>

      <Stack spacing={3}>
        {/* Inhibición de la conducta */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Inhibición de la Conducta
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Control de impulsos</InputLabel>
          <Select
            value={data.impulseControl || ''}
            label="Control de impulsos"
            onChange={(e) => handleChange('impulseControl', e.target.value)}
          >
            <MenuItem value="Adecuado">Adecuado</MenuItem>
            <MenuItem value="Presenta impulsividad ocasional">Presenta impulsividad ocasional</MenuItem>
            <MenuItem value="Dificultad para controlar impulsos">Dificultad para controlar impulsos</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Capacidad para seguir instrucciones</InputLabel>
          <Select
            value={data.followInstructions || ''}
            label="Capacidad para seguir instrucciones"
            onChange={(e) => handleChange('followInstructions', e.target.value)}
          >
            <MenuItem value="Inmediatamente">Inmediatamente</MenuItem>
            <MenuItem value="Requiere repetición">Requiere repetición</MenuItem>
            <MenuItem value="Muestra resistencia">Muestra resistencia</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Modulación Emocional */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Modulación Emocional
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Manejo de la frustración</InputLabel>
          <Select
            value={data.frustrationManagement || ''}
            label="Manejo de la frustración"
            onChange={(e) => handleChange('frustrationManagement', e.target.value)}
          >
            <MenuItem value="Regula sus emociones">Regula sus emociones</MenuItem>
            <MenuItem value="Expresa frustración verbalmente">Expresa frustración verbalmente</MenuItem>
            <MenuItem value="Abandona la tarea">Abandona la tarea</MenuItem>
            <MenuItem value="Actitud respetuosa a pesar del reto">Actitud respetuosa a pesar del reto</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Emociones predominantes en la sesión</InputLabel>
          <Select
            multiple
            value={data.predominantEmotions || []}
            onChange={handleEmotionsChange}
            input={<OutlinedInput label="Emociones predominantes en la sesión" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {getAvailableEmotions().map((emotion) => (
              <MenuItem key={emotion} value={emotion}>
                {emotion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        {/* Iniciativa y Automonitoreo */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Iniciativa y Automonitoreo
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Iniciativa en las tareas</InputLabel>
          <Select
            value={data.taskInitiative || ''}
            label="Iniciativa en las tareas"
            onChange={(e) => handleChange('taskInitiative', e.target.value)}
          >
            <MenuItem value="Espontánea y proactiva">Espontánea y proactiva</MenuItem>
            <MenuItem value="Requiere orientación para iniciar">Requiere orientación para iniciar</MenuItem>
            <MenuItem value="Muestra resistencia a tareas difíciles">Muestra resistencia a tareas difíciles</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Automonitoreo de errores</InputLabel>
          <Select
            value={data.selfMonitoring || ''}
            label="Automonitoreo de errores"
            onChange={(e) => handleChange('selfMonitoring', e.target.value)}
          >
            <MenuItem value="Identifica y corrige errores de forma autónoma">
              Identifica y corrige errores de forma autónoma
            </MenuItem>
            <MenuItem value="Identifica pero necesita ayuda para corregir">
              Identifica pero necesita ayuda para corregir
            </MenuItem>
            <MenuItem value="No percibe sus errores">No percibe sus errores</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Flexibilidad Cognitiva */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Flexibilidad Cognitiva (Control de Cambios)
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Adaptación a cambios de actividad</InputLabel>
          <Select
            value={data.cognitiveFlexibility || ''}
            label="Adaptación a cambios de actividad"
            onChange={(e) => handleChange('cognitiveFlexibility', e.target.value)}
          >
            <MenuItem value="Flexible y sin dificultad">Flexible y sin dificultad</MenuItem>
            <MenuItem value="Muestra resistencia inicial pero se adapta">
              Muestra resistencia inicial pero se adapta
            </MenuItem>
            <MenuItem value="Se desorganiza con los cambios">Se desorganiza con los cambios</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
