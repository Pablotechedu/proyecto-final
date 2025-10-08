import { Box, Typography, TextField } from '@mui/material';
import { TutoringData } from '../../types';

interface Props {
  data: Partial<TutoringData>;
  onChange: (data: Partial<TutoringData>) => void;
}

export default function TutoringSection({ data, onChange }: Props) {
  return (
    <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>VII. Tutorías</Typography>
      <TextField fullWidth multiline rows={4} label="Enfoque de la sesión de tutoría" value={data.sessionFocus || ''} onChange={(e) => onChange({ ...data, sessionFocus: e.target.value })} placeholder="Describe el enfoque y contenido trabajado en la tutoría..." />
    </Box>
  );
}
