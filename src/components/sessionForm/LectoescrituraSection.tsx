import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent, Alert } from '@mui/material';
import { LectoescrituraData } from '../../types';
import { calculatePPM, getWritingSkills } from '../../services/sessionForms';

interface Props {
  data: Partial<LectoescrituraData>;
  onChange: (data: Partial<LectoescrituraData>) => void;
}

export default function LectoescrituraSection({ data, onChange }: Props) {
  const [ppm, setPpm] = useState<number>(0);

  useEffect(() => {
    if (data.itemsRead && (data.timeMinutes || data.timeSeconds)) {
      const calculated = calculatePPM(data.itemsRead, data.timeMinutes || 0, data.timeSeconds || 0);
      setPpm(calculated);
      onChange({ ...data, wordsPerMinute: calculated });
    }
  }, [data.itemsRead, data.timeMinutes, data.timeSeconds]);

  const handleChange = (field: keyof LectoescrituraData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('writingSkills', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>III. Lectoescritura</Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de lectura</InputLabel>
          <Select value={data.readingType || ''} label="Tipo de lectura" onChange={(e) => handleChange('readingType', e.target.value)}>
            <MenuItem value="Sílabas (CV, CCV)">Sílabas (CV, CCV)</MenuItem>
            <MenuItem value="Palabras (monosílabas, bisílabas)">Palabras (monosílabas, bisílabas)</MenuItem>
            <MenuItem value="Texto">Texto</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2}>
          <TextField fullWidth size="small" label="Items leídos" type="number" value={data.itemsRead || ''} onChange={(e) => handleChange('itemsRead', Number(e.target.value))} />
          <TextField fullWidth size="small" label="Minutos" type="number" value={data.timeMinutes || ''} onChange={(e) => handleChange('timeMinutes', Number(e.target.value))} />
          <TextField fullWidth size="small" label="Segundos" type="number" value={data.timeSeconds || ''} onChange={(e) => handleChange('timeSeconds', Number(e.target.value))} />
        </Stack>

        {ppm > 0 && (
          <Alert severity="info">
            <strong>PPM Calculado:</strong> {ppm} palabras por minuto
          </Alert>
        )}

        <TextField fullWidth size="small" label="PPM esperadas" type="number" value={data.expectedPPM || ''} onChange={(e) => handleChange('expectedPPM', Number(e.target.value))} />
        <TextField fullWidth size="small" label="% Exactitud" type="number" value={data.accuracy || ''} onChange={(e) => handleChange('accuracy', Number(e.target.value))} />
        
        <FormControl fullWidth size="small">
          <InputLabel>Habilidades de escritura</InputLabel>
          <Select multiple value={data.writingSkills || []} onChange={handleSkillsChange} input={<OutlinedInput label="Habilidades de escritura" />} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={value} size="small" />)}</Box>}>
            {getWritingSkills().map((skill) => <MenuItem key={skill} value={skill}>{skill}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField fullWidth size="small" label="Observaciones" multiline rows={2} value={data.writingObservations || ''} onChange={(e) => handleChange('writingObservations', e.target.value)} />
      </Stack>
    </Box>
  );
}
