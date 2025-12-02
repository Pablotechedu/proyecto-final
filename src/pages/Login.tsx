import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, user, error, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Redirect based on user permissions
      // Terapeutas van a Mi Hub, otros van a Dashboard
      if (user.permissions?.isTherapist && !user.permissions?.isAdmin && !user.permissions?.isEditor && !user.permissions?.isDirector) {
        navigate('/therapist-hub')
      } else if (user.permissions?.isDirector && !user.permissions?.isAdmin && !user.permissions?.isEditor) {
        navigate('/therapist-hub')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(email, password)
      // La redirección se maneja en el useEffect
    } catch (error: any) {
      console.error('Login error:', error)
      // El error ya se maneja en el hook useAuth
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Hub Terapias
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Sistema de gestión de terapias
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
