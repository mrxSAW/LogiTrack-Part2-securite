import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import api from '../../api/axiosInstance'
import { clientSchema } from '../../schemas/clientSchema'

export default function ClientForm() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] =
    useState('')

  const navigate = useNavigate()
  const params = useParams()

  const clientId = params.id
  const isEditMode = Boolean(clientId)

  const form = useForm({
    resolver: yupResolver(clientSchema),

    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      ville: '',
    },
  })

  const errors = form.formState.errors
  const isSubmitting =
    form.formState.isSubmitting

  useEffect(() => {
    if (!clientId) {
      return
    }

    async function loadClient() {
      try {
        setLoading(true)
        setServerError('')

        const response = await api.get(
          `/api/clients/${clientId}`
        )

        form.reset({
          nom: response.data.nom,
          email: response.data.email,
          telephone: response.data.telephone,
          ville: response.data.ville,
        })
      } catch (error) {
        const backendMessage =
          error.response?.data?.message

        setServerError(
          backendMessage ||
          'Impossible de charger le client'
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [clientId, form])

  async function onSubmit(data) {
    setServerError('')

    try {
      if (isEditMode) {
        await api.put(
          `/api/clients/${clientId}`,
          data
        )
      } else {
        await api.post(
          '/api/clients',
          data
        )
      }

      navigate('/clients', {
        replace: true,
      })
    } catch (error) {
      const backendMessage =
        error.response?.data?.message

      setServerError(
        backendMessage ||
        "Impossible d'enregistrer le client"
      )
    }
  }

  function cancelForm() {
    navigate('/clients')
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: 5,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        {isEditMode
          ? 'Modifier le client'
          : 'Ajouter un client'}
      </Typography>

      <Paper
        sx={{
          maxWidth: 650,
          padding: 3,
        }}
      >
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
            {...form.register('nom')}
            label="Nom"
            fullWidth
            margin="normal"
            error={Boolean(errors.nom)}
            helperText={errors.nom?.message}
          />

          <TextField
            {...form.register('email')}
            label="Adresse email"
            type="email"
            fullWidth
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            {...form.register('telephone')}
            label="Téléphone"
            fullWidth
            margin="normal"
            error={Boolean(errors.telephone)}
            helperText={errors.telephone?.message}
          />

          <TextField
            {...form.register('ville')}
            label="Ville"
            fullWidth
            margin="normal"
            error={Boolean(errors.ville)}
            helperText={errors.ville?.message}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              marginTop: 3,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={cancelForm}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Enregistrement...'
                : 'Enregistrer'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}