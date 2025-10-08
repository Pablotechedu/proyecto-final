import { Box, Typography, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent } from '@mui/material';
import { CognitiveRehabilitationData } from '../../types';
import { getCognitiveFunctions } from '../../services/sessionForms';

interface Props {
  data: Partial<CognitiveRehabilitationData>;
  onChange: (data: Partial<CognitiveRehabilitationData>) => void;
}

export default function CognitiveRehabSection({ data, onChange }: Props) {
  const handleChange = (field: keyof CognitiveRehabilitationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFunctionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('functionsWorked', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>VI. Rehabilitación Cognitiva (NeuronUP)</Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Funciones trabajadas</InputLabel>
          <Select multiple value={data.functionsWorked || []} onChange={handleFunctionsChange} input={<OutlinedInput label="Funciones trabajadas" />} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={value} size="small" />)}</Box>}>
            {getCognitiveFunctions().map((func) => <MenuItem key={func} value={func}>{func}</MenuItem>)}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2}>
          <TextField size="small" label="Score General" type="number" value={data.generalScore || ''} onChange={(e) => handleChange('generalScore', Number(e.target.value))} />
          <TextField size="small" label="Score Atención" type="number" value={data.attentionScore || ''} onChange={(e) => handleChange('attentionScore', Number(e.target.value))} />
          <TextField size="small" label="Score Memoria" type="number" value={data.memoryScore || ''} onChange={(e) => handleChange('memoryScore', Number(e.target.value))} />
        </Stack>
      </Stack>
    </Box>
  );
}
