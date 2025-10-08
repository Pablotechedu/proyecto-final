import { Box, Typography, TextField, Stack, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, SelectChangeEvent } from '@mui/material';
import { MathematicsData } from '../../types';
import { getMathStrategies } from '../../services/sessionForms';

interface Props {
  data: Partial<MathematicsData>;
  onChange: (data: Partial<MathematicsData>) => void;
}

export default function MathematicsSection({ data, onChange }: Props) {
  const handleChange = (field: keyof MathematicsData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleStrategiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    handleChange('strategiesUsed', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>IV. Matemáticas</Typography>
      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Estrategias utilizadas</InputLabel>
          <Select multiple value={data.strategiesUsed || []} onChange={handleStrategiesChange} input={<OutlinedInput label="Estrategias utilizadas" />} renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => <Chip key={value} label={value} size="small" />)}</Box>}>
            {getMathStrategies().map((strategy) => <MenuItem key={strategy} value={strategy}>{strategy}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField fullWidth size="small" label="Observaciones cualitativas" multiline rows={3} value={data.qualitativeObservations || ''} onChange={(e) => handleChange('qualitativeObservations', e.target.value)} placeholder="Ej: Confunde reglas de divisibilidad, se frustra con cálculo mental..." />
      </Stack>
    </Box>
  );
}
