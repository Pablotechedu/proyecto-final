import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getAvailableObjectives } from '../../services/sessionForms';

interface Props {
  selectedObjectives: string[];
  onChange: (objectives: string[]) => void;
}

export default function ObjectivesSelector({ selectedObjectives, onChange }: Props) {
  const handleToggle = (objective: string) => {
    const currentIndex = selectedObjectives.indexOf(objective);
    const newSelected = [...selectedObjectives];

    if (currentIndex === -1) {
      newSelected.push(objective);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onChange(newSelected);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Objetivos de la Sesión
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Selecciona los objetivos trabajados en esta sesión. Las secciones correspondientes aparecerán dinámicamente abajo.
      </Typography>

      {/* Resumen de selección */}
      {selectedObjectives.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Objetivos seleccionados ({selectedObjectives.length}):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedObjectives.map((objective) => (
              <Chip
                key={objective}
                label={objective}
                color="primary"
                size="small"
                icon={<CheckCircleIcon />}
                onDelete={() => handleToggle(objective)}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
        <FormControl component="fieldset" fullWidth>
          <FormGroup>
            {getAvailableObjectives().map((objective) => (
              <FormControlLabel
                key={objective}
                control={
                  <Checkbox
                    checked={selectedObjectives.includes(objective)}
                    onChange={() => handleToggle(objective)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={selectedObjectives.includes(objective) ? 600 : 400}>
                    {objective}
                  </Typography>
                }
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Paper>
    </Box>
  );
}
