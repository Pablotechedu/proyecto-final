import { Box, Typography, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent } from '@mui/material';
import { EmotionalTherapyData } from '../../types';
import { getEmotionalSkills } from '../../services/sessionForms';

interface Props {
  data: Partial<EmotionalTherapyData>;
  onChange: (data: Partial<EmotionalTherapyData>) => void;
}

export default function EmotionalTherapySection({ data, onChange }: Props) {
  const handleChange = (field: keyof EmotionalTherapyData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('skillsPracticed', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>V. Terapia Emocional</Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Programa</InputLabel>
          <Select value={data.program || ''} label="Programa" onChange={(e) => handleChange('program', e.target.value)}>
            <MenuItem value="Terapia Racional Emotiva Conductual (REBT)">REBT</MenuItem>
            <MenuItem value="Mentalidad de Crecimiento (Growth Mindset)">Growth Mindset</MenuItem>
            <MenuItem value="Regulación emocional">Regulación emocional</MenuItem>
            <MenuItem value="Habilidades sociales">Habilidades sociales</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth size="small" label="Situación abordada" multiline rows={2} value={data.situationAddressed || ''} onChange={(e) => handleChange('situationAddressed', e.target.value)} placeholder="Ej: Repetición de grado, conflicto familiar..." />
        <FormControl fullWidth size="small">
          <InputLabel>Habilidades practicadas</InputLabel>
          <Select multiple value={data.skillsPracticed || []} onChange={handleSkillsChange} input={<OutlinedInput label="Habilidades practicadas" />} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={value} size="small" />)}</Box>}>
            {getEmotionalSkills().map((skill) => <MenuItem key={skill} value={skill}>{skill}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField fullWidth size="small" label="Progreso observado" multiline rows={2} value={data.progressObserved || ''} onChange={(e) => handleChange('progressObserved', e.target.value)} />
      </Stack>
    </Box>
  );
}
