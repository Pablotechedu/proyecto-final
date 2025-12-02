import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState Component
 * 
 * Muestra un estado vacío con CTA para guiar al usuario
 * Mejora la experiencia cuando no hay datos disponibles
 * 
 * @param icon - Icono opcional a mostrar (MUI Icon component)
 * @param title - Título del estado vacío
 * @param description - Descripción del estado vacío
 * @param action - Acción opcional con label y handler
 * 
 * @example
 * // Estado vacío con acción
 * <EmptyState
 *   icon={<ReceiptIcon />}
 *   title="No hay pagos registrados"
 *   description="Comienza registrando el primer pago del mes"
 *   action={{
 *     label: 'Registrar Pago',
 *     onClick: () => navigate('/payments/new')
 *   }}
 * />
 * 
 * @example
 * // Estado vacío sin acción
 * <EmptyState
 *   icon={<EventNoteIcon />}
 *   title="No hay sesiones programadas"
 *   description="Las sesiones aparecerán aquí cuando sean creadas"
 * />
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      p={4}
      textAlign="center"
      role="status"
      aria-label={`${title}. ${description}`}
    >
      {icon && (
        <Box 
          sx={{ 
            fontSize: 80, 
            color: 'text.secondary', 
            mb: 2,
            opacity: 0.5,
          }}
          aria-hidden="true"
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        mb={3}
        sx={{ maxWidth: 400 }}
      >
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          size="large"
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
