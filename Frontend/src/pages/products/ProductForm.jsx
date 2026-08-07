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
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../api/axiosInstance'
import { productSchema } from '../../schemas/productSchema'

export default function ProductForm() {
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
    resolver: yupResolver(productSchema),

    defaultValues: {
      nom: '',
      categorie: '',
      prix: '',
      quantiteStock: '',
    },
  })

  useEffect(() => {
    let actif = true

    async function chargerProduit() {
      if (!isEditMode) {
        return
      }

      try {
        setLoading(true)
        setServerError('')

        const response = await api.get(
          `/api/products/${id}`,
        )

        if (actif) {
          reset({
            nom: response.data.nom,
            categorie: response.data.categorie,
            prix: response.data.prix,
            quantiteStock:
              response.data.quantiteStock,
          })
        }
      } catch (error) {
        if (actif) {
          const message =
            error.response?.data?.message ||
            'Impossible de charger le produit'

          setServerError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    chargerProduit()

    return () => {
      actif = false
    }
  }, [id, isEditMode, reset])

  async function onSubmit(data) {
    setServerError('')

    try {
      if (isEditMode) {
        await api.put(
          `/api/products/${id}`,
          data,
        )
      } else {
        await api.post(
          '/api/products',
          data,
        )
      }

      navigate('/products', {
        replace: true,
      })
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Impossible d'enregistrer le produit"

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
          ? 'Modifier le produit'
          : 'Ajouter un produit'}
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
            label="Nom du produit"
            fullWidth
            margin="normal"
            error={Boolean(errors.nom)}
            helperText={errors.nom?.message}
          />

          <TextField
            {...register('categorie')}
            label="Catégorie"
            fullWidth
            margin="normal"
            error={Boolean(errors.categorie)}
            helperText={errors.categorie?.message}
          />

          <TextField
            {...register('prix', {
              valueAsNumber: true,
            })}
            label="Prix"
            type="number"
            fullWidth
            margin="normal"
            error={Boolean(errors.prix)}
            helperText={errors.prix?.message}
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
          />

          <TextField
            {...register('quantiteStock', {
              valueAsNumber: true,
            })}
            label="Quantité en stock"
            type="number"
            fullWidth
            margin="normal"
            error={Boolean(errors.quantiteStock)}
            helperText={
              errors.quantiteStock?.message
            }
            slotProps={{
              htmlInput: {
                min: 0,
                step: 1,
              },
            }}
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
                navigate('/products')
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