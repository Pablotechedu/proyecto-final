import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Divider,
} from '@mui/material';
import { SessionFormData } from '../../types';

interface Props {
  data: Partial<SessionFormData>;
  onChange: (data: Partial<SessionFormData>) => void;
}

export default function GeneralInfoSection({ data, onChange }: Props) {
  const handleChange = (field: keyof SessionFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        I. Información General y Conducta
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Esta sección aplica a todas las sesiones
      </Typography>

      <Stack spacing={3}>
        {/* Asistencia */}
        <FormControl component="fieldset" required>
          <FormLabel component="legend">Asistencia</FormLabel>
          <RadioGroup
            row
            value={data.attendance || ''}
            onChange={(e) => handleChange('attendance', e.target.value)}
          >
            <FormControlLabel value="Presente" control={<Radio />} label="Presente" />
            <FormControlLabel value="Ausente con aviso" control={<Radio />} label="Ausente con aviso" />
            <FormControlLabel value="Ausente sin aviso" control={<Radio />} label="Ausente sin aviso" />
          </RadioGroup>
        </FormControl>

        {/* Modalidad */}
        <FormControl component="fieldset" required>
          <FormLabel component="legend">Modalidad</FormLabel>
          <RadioGroup
            row
            value={data.modality || ''}
            onChange={(e) => handleChange('modality', e.target.value)}
          >
            <FormControlLabel value="En línea" control={<Radio />} label="En línea" />
            <FormControlLabel value="Presencial" control={<Radio />} label="Presencial" />
          </RadioGroup>
        </FormControl>

        <Divider />

        {/* Nivel de energía y estado de ánimo */}
        <FormControl fullWidth>
          <Typography variant="subtitle2" gutterBottom>
            Nivel de energía y estado de ánimo al inicio
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Escala 1-5 (1 = bajo/negativo, 5 = alto/positivo)
          </Typography>
          <Select
            value={data.energyLevel || ''}
            onChange={(e) => handleChange('energyLevel', Number(e.target.value))}
          >
            <MenuItem value={1}>1 - Muy bajo/negativo</MenuItem>
            <MenuItem value={2}>2 - Bajo/negativo</MenuItem>
            <MenuItem value={3}>3 - Neutral</MenuItem>
            <MenuItem value={4}>4 - Alto/positivo</MenuItem>
            <MenuItem value={5}>5 - Muy alto/positivo</MenuItem>
          </Select>
        </FormControl>

        {/* Adherencia y participación */}
        <FormControl fullWidth>
          <InputLabel>Adherencia y participación</InputLabel>
          <Select
            value={data.adherence || ''}
            label="Adherencia y participación"
            onChange={(e) => handleChange('adherence', e.target.value)}
          >
            <MenuItem value="Excelente">Excelente</MenuItem>
            <MenuItem value="Buena">Buena</MenuItem>
            <MenuItem value="Variable">Variable</MenuItem>
            <MenuItem value="Requiere motivación constante">Requiere motivación constante</MenuItem>
          </Select>
        </FormControl>

        {/* Comentarios sobre adherencia */}
        <TextField
          fullWidth
          label="Comentarios sobre la adherencia"
          multiline
          rows={2}
          value={data.adherenceComments || ''}
          onChange={(e) => handleChange('adherenceComments', e.target.value)}
          placeholder="Ej: Mostró gran iniciativa al principio, pero decayó al final"
        />

        {/* Dificultades técnicas */}
        <FormControl component="fieldset">
          <FormLabel component="legend">¿Se observaron dificultades técnicas?</FormLabel>
          <RadioGroup
            row
            value={data.technicalDifficulties ? 'Sí' : data.technicalDifficulties === false ? 'No' : ''}
            onChange={(e) => handleChange('technicalDifficulties', e.target.value === 'Sí')}
          >
            <FormControlLabel value="Sí" control={<Radio />} label="Sí" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {data.technicalDifficulties && (
          <TextField
            fullWidth
            label="Descripción de dificultades técnicas"
            multiline
            rows={2}
            value={data.technicalDifficultiesDescription || ''}
            onChange={(e) => handleChange('technicalDifficultiesDescription', e.target.value)}
          />
        )}

        {/* Independencia en la sesión */}
        <FormControl fullWidth>
          <InputLabel>Independencia en la sesión</InputLabel>
          <Select
            value={data.independence || ''}
            label="Independencia en la sesión"
            onChange={(e) => handleChange('independence', e.target.value)}
          >
            <MenuItem value="Autónomo">Autónomo</MenuItem>
            <MenuItem value="Requiere guía mínima">Requiere guía mínima</MenuItem>
            <MenuItem value="Requiere apoyo constante">Requiere apoyo constante</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
