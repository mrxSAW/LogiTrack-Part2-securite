import { useState } from 'react'
import {Link, useLocation,useNavigate,} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {Alert,Box,Button,Container,Paper,TextField,Typography,} from '@mui/material'
import useAuth from '../../context/useAuth'
import { loginSchema } from '../../schemas/authSchemas'

export default function Login() {
  const [serverError, setServerError] = useState('')

  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm({
    resolver: yupResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  })

  const errors = form.formState.errors
  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(data) {
    setServerError('')

    try {
      await auth.login(data)

      const previousPage =location.state?.from?.pathname

      const destination = previousPage || '/dashboard'

      navigate(destination, {
        replace: true,
      })
    } catch (error) {
      const backendMessage =
        error.response?.data?.message

      setServerError(
        backendMessage ||
        'Email ou mot de passe incorrect'
      )
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper
        elevation={4}
        sx={{
          marginTop: 8,
          padding: 4,
          borderRadius: 3,
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom >
          Connexion
        </Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ marginBottom: 3 }}
        >
          Connectez-vous à LogiTrack
        </Typography>

        {location.state?.success && (
          <Alert severity="success"  sx={{ marginBottom: 2 }}>
            {location.state.success}
          </Alert>
        )}

        {serverError && (
          <Alert
            severity="error"
            sx={{ marginBottom: 2 }}
          >
            {serverError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <TextField
            {...form.register('email')}
            label="Adresse email"
            type="email"
            autoComplete="email"
            fullWidth
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            {...form.register('password')}
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            fullWidth
            margin="normal"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              marginTop: 3,
              marginBottom: 2,
              padding: 1.3,
            }}
          >
            {isSubmitting
              ? 'Connexion...'
              : 'Se connecter'}
          </Button>
        </Box>

        <Typography align="center">
          Pas encore de compte ?{' '}

          <Link to="/register">
            Créer un compte
          </Link>
        </Typography>
      </Paper>
    </Container>
  )
}