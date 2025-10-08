import { Box, Typography, TextField, Stack } from '@mui/material';
import { SessionFormData } from '../../types';

interface Props {
  data: Partial<SessionFormData>;
  onChange: (data: Partial<SessionFormData>) => void;
}

export default function RecommendationsSection({ data, onChange }: Props) {
  const handleChange = (field: keyof SessionFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>VIII. Recomendaciones</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>Esta sección siempre es visible al final del formulario</Typography>
      
      <Stack spacing={3}>
        <TextField fullWidth multiline rows={3} label="Área Académica" value={data.academicRecommendations || ''} onChange={(e) => handleChange('academicRecommendations', e.target.value)} placeholder="Recomendaciones para el colegio. Ej: Presentar palabras de manera segmentada, dar tiempo adicional..." />
        <TextField fullWidth multiline rows={3} label="Apoyo en Casa" value={data.homeSupport || ''} onChange={(e) => handleChange('homeSupport', e.target.value)} placeholder="Recomendaciones para los padres. Ej: Incorporar juegos de vocabulario, establecer rutinas de lectura..." />
        <TextField fullWidth multiline rows={3} label="Estrategias Terapéuticas a Continuar" value={data.therapeuticStrategies || ''} onChange={(e) => handleChange('therapeuticStrategies', e.target.value)} placeholder="Notas para el equipo interno. Ej: Seguir reforzando el uso de 'I-Statements'..." />
      </Stack>
    </Box>
  );
}
