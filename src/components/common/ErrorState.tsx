import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export enum ErrorType {
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface ErrorStateProps {
  error: AppError | string;
  onRetry?: () => void;
}

/**
 * ErrorState Component
 * 
 * Muestra un estado de error consistente con mensajes útiles y acciones
 * Reduce frustración del usuario proporcionando contexto y soluciones
 * 
 * @param error - Objeto AppError o string con mensaje de error
 * @param onRetry - Función opcional para reintentar la acción
 * 
 * @example
 * // Error simple con retry
 * <ErrorState 
 *   error="Error al cargar datos" 
 *   onRetry={() => loadData()} 
 * />
 * 
 * @example
 * // Error tipado con acción personalizada
 * <ErrorState 
 *   error={{
 *     type: ErrorType.PERMISSION,
 *     message: 'Permission denied',
 *     userMessage: 'No tienes permisos para ver esta página',
 *     action: {
 *       label: 'Cerrar sesión',
 *       handler: () => logout()
 *     }
 *   }}
 * />
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  // Si error es string, convertir a AppError
  const appError: AppError = typeof error === 'string' 
    ? {
        type: ErrorType.UNKNOWN,
        message: error,
        userMessage: error,
      }
    : error;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      p={3}
      role="alert"
      aria-live="assertive"
    >
      <ErrorOutlineIcon 
        sx={{ fontSize: 64, color: 'error.main', mb: 2 }} 
        aria-hidden="true"
      />
      <Typography variant="h6" gutterBottom align="center">
        {appError.userMessage}
      </Typography>
      {appError.message !== appError.userMessage && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          mb={3}
          align="center"
        >
          {appError.message}
        </Typography>
      )}
      <Stack direction="row" spacing={2}>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Reintentar
          </Button>
        )}
        {appError.action && (
          <Button
            variant="outlined"
            onClick={appError.action.handler}
          >
            {appError.action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

/**
 * Helper function para convertir errores de Firebase/API a AppError
 * 
 * @param error - Error capturado
 * @returns AppError con mensaje apropiado
 * 
 * @example
 * try {
 *   await loadData();
 * } catch (err) {
 *   setError(handleError(err));
 * }
 */
export function handleError(error: any): AppError {
  // Error de permisos de Firestore
  if (error.code === 'permission-denied' || 
      error.message?.includes('Missing or insufficient permissions')) {
    return {
      type: ErrorType.PERMISSION,
      message: error.message,
      userMessage: 'No tienes permisos para realizar esta acción. Por favor, contacta al administrador.',
    };
  }

  // Error de red
  if (error.code === 'unavailable' || 
      error.message?.includes('Network') ||
      error.message?.includes('ECONNREFUSED')) {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      userMessage: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    };
  }

  // Error de cuota excedida
  if (error.code === 8 || error.message?.includes('Quota exceeded')) {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      userMessage: 'Se ha excedido la cuota de uso. Por favor, intenta más tarde.',
    };
  }

  // Error 404
  if (error.code === 'not-found' || error.status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: error.message,
      userMessage: 'No se encontró el recurso solicitado.',
    };
  }

  // Error de validación
  if (error.code === 'invalid-argument' || error.name === 'ValidationError') {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      userMessage: 'Los datos proporcionados no son válidos. Por favor, verifica e intenta de nuevo.',
    };
  }

  // Error genérico
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'Error desconocido',
    userMessage: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
  };
}
