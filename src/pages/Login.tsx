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
  Container,
  Divider
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../hooks/useAuth'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'therapist') {
        navigate('/therapist-hub')
      } else {
        navigate('/dashboard')
      }
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      await loginWithGoogle()
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google.')
      console.error('Google Sign-In error:', error)
    } finally {
      setGoogleLoading(false)
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
            Learning Models HUB
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign-In Button - Primary Option */}
          <Button
            fullWidth
            variant="contained"
            startIcon={googleLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: '#fff',
              color: '#757575',
              border: '1px solid #dadce0',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                border: '1px solid #dadce0',
              },
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              py: 1.5
            }}
          >
            {googleLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
          </Button>

          <Divider sx={{ my: 2, width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              o usa email y contraseña
            </Typography>
          </Divider>

          {/* Email/Password Form - Secondary Option */}
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
              variant="outlined"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || googleLoading}
            >
              {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Sistema de gestión para Learning Models
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
