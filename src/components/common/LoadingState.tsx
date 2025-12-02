import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
}

/**
 * LoadingState Component
 * 
 * Muestra un estado de carga consistente en toda la aplicación
 * Mejora la percepción de velocidad y proporciona feedback al usuario
 * 
 * @param message - Mensaje opcional a mostrar (default: "Cargando...")
 * @param variant - 'spinner' para spinner circular | 'skeleton' para placeholders
 * 
 * @example
 * // Spinner con mensaje personalizado
 * <LoadingState message="Cargando pacientes..." />
 * 
 * @example
 * // Skeleton para listas
 * <LoadingState variant="skeleton" />
 */
export function LoadingState({ 
  message = 'Cargando...', 
  variant = 'spinner' 
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="400px"
      gap={2}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
