import { useEffect, useState,} from 'react'
import {useNavigate,useParams,} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box,Button, CircularProgress,Paper,TextField,Typography,} from '@mui/material'
import api from '../../api/axiosInstance'
import { clientSchema } from '../../schemas/clientSchema'

export default function ClientForm() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] =
    useState('')

  const { id } = useParams()
  const navigate = useNavigate()

  const isEditMode = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: yupResolver(clientSchema),

    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      ville: '',
    },
  })

  useEffect(() => {
    let actif = true

    async function chargerClient() {
      // En mode ajout, aucun client à charger.
      if (!isEditMode) {
        return
      }

      try {
        setLoading(true)
        setServerError('')

        const response = await api.get(
          `/api/clients/${id}`,
        )

        if (actif) {
          reset({
            nom: response.data.nom,
            email: response.data.email,
            telephone: response.data.telephone,
            ville: response.data.ville,
          })
        }
      } catch (error) {
        if (actif) {
          const message =
            error.response?.data?.message ||
            'Impossible de charger le client'

          setServerError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    chargerClient()

    return () => {
      actif = false
    }
  }, [id, isEditMode, reset])

  async function onSubmit(data) {
    setServerError('')

    try {
      if (isEditMode) {
        await api.put(
          `/api/clients/${id}`,
          data,
        )
      } else {
        await api.post(
          '/api/clients',
          data,
        )
      }

      navigate('/clients', {
        replace: true,
      })
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Impossible d'enregistrer le client"

      setServerError(message)
    }
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
          <Typography
            color="error"
            sx={{
              marginBottom: 2,
            }}
          >
            {serverError}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <TextField
            {...register('nom')}
            label="Nom"
            fullWidth
            margin="normal"
            error={Boolean(errors.nom)}
            helperText={errors.nom?.message}
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
            {...register('telephone')}
            label="Téléphone"
            fullWidth
            margin="normal"
            error={Boolean(errors.telephone)}
            helperText={errors.telephone?.message}
          />

          <TextField
            {...register('ville')}
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
              onClick={() =>
                navigate('/clients')
              }
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