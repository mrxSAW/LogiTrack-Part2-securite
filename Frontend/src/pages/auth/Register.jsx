import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {Alert,Box,Button,Container,Paper,TextField,Typography,} from '@mui/material'
import useAuth from '../../context/useAuth'
import { registerSchema } from '../../schemas/authSchemas'

export default function Register() {
  const [serverError, setServerError] = useState('')

  const { register: createAccount } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit,
    formState: { errors,isSubmitting,},} = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { nom: '', prenom: '', email: '', password: '', confirmationPassword: '', },
  })

  async function onSubmit(data) {
    setServerError('')

    const { confirmationPassword, ...registerRequest } = data

    
    void confirmationPassword

    try {
      await createAccount(registerRequest)

      navigate('/login', { replace: true,
        state: { success: 'Compte créé avec succès. Vous pouvez vous connecter.',},
      })
    } catch (error) {
      const message = error.response?.data?.message ||"Impossible de créer le compte"
      setServerError(message)
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={4}
        sx={{ marginTop: 5, padding: 4,}}  >
       
        <Typography  component="h1" variant="h4" align="center"  gutterBottom>
          Inscription
        </Typography>

        <Typography color="text.secondary"  align="center"
          sx={{ marginBottom: 3 }} >
          Créez votre compte LogiTrack
        </Typography>

        {serverError && (
          <Alert severity="error"
            sx={{ marginBottom: 2 }} >
            {serverError}
          </Alert>          )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}  noValidate  >
          <TextField  {...register('nom')} label="Nom" fullWidth margin="normal"
            error={Boolean(errors.nom)}  helperText={errors.nom?.message}
          />

          <TextField
            {...register('prenom')}
            label="Prénom"
            fullWidth
            margin="normal"
            error={Boolean(errors.prenom)}
            helperText={errors.prenom?.message}
          />

          <TextField
            {...register('email')}
            label="Adresse email"
            type="email"
            fullWidth
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            {...register('password')}
            label="Mot de passe"
            type="password"
            fullWidth
            margin="normal"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />

          <TextField
            {...register('confirmationPassword')}
            label="Confirmer le mot de passe"
            type="password"
            fullWidth
            margin="normal"
            error={Boolean(errors.confirmationPassword)}
            helperText={
              errors.confirmationPassword?.message
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{
              marginTop: 3,
              marginBottom: 2,
            }}
          >
            {isSubmitting
              ? 'Création...'
              : 'Créer le compte'}
          </Button>
        </Box>

        <Typography align="center">
          Vous avez déjà un compte ?{' '}
          <Link to="/login">
            Se connecter
          </Link>
        </Typography>
      </Paper>
    </Container>
  )
}