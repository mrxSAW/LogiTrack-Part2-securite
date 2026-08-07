import { useState } from 'react'
import { Link,useLocation,useNavigate,} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Alert,Box, Button,Container, Paper, TextField,Typography,} from '@mui/material'
import useAuth from '../../context/useAuth'
import { loginSchema } from '../../schemas/authSchemas'

export default function Login() {
  const [serverError, setServerError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { register, handleSubmit,
    formState: { errors,isSubmitting,},} = useForm({
    resolver: yupResolver(loginSchema),

    defaultValues: { email: '', password: '',},
  })

  async function onSubmit(data) {
    setServerError('')

    try {
      await login(data)

      const destination = location.state?.from?.pathname ||'/dashboard'

      navigate(destination, { replace: true, }) } 
      catch (error) {
                    const message = error.response?.data?.message ||'Email ou mot de passe incorrect'

      setServerError(message)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={4}
        sx={{marginTop: 8, padding: 4,borderRadius: 3,}} >
        
        <Typography component="h1" variant="h4" align="center" gutterBottom >
          Connexion
        </Typography>

        <Typography color="text.secondary" align="center" sx={{marginBottom: 3,}}>
          Connectez-vous à LogiTrack
        </Typography>

        {/* Message affiché après une inscription */}
        {location.state?.success && (
          <Alert severity="success" sx={{ marginBottom: 2, }}>
            {location.state.success}
          </Alert>
        )}

        {/* Erreur retournée par le backend */}
        {serverError && (
          <Alert severity="error" sx={{ marginBottom: 2, }} >
            {serverError}
          </Alert>
        )}

        <Box component="form"  onSubmit={handleSubmit(onSubmit)} noValidate >
          
          <TextField {...register('email')}   label="Adresse email" type="email"
            autoComplete="email" fullWidth margin="normal"
            error={Boolean(errors.email)}  helperText={errors.email?.message}
          />

          <TextField
            {...register('password')}   label="Mot de passe"  type="password"
            autoComplete="current-password" fullWidth
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