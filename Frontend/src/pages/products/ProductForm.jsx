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
import { productSchema } from '../../schemas/productSchema'

export default function ProductForm() {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] =
    useState('')

  const navigate = useNavigate()
  const params = useParams()

  const productId = params.id
  const isEditMode = Boolean(productId)

  const form = useForm({
    resolver: yupResolver(productSchema),

    defaultValues: {
      nom: '',
      categorie: '',
      prix: '',
      quantiteStock: '',
    },
  })

  const errors = form.formState.errors
  const isSubmitting =
    form.formState.isSubmitting

  const resetForm = form.reset

  useEffect(() => {
    if (!productId) {
      return
    }

    async function loadProduct() {
      try {
        setLoading(true)
        setServerError('')

        const response = await api.get(
          `/api/products/${productId}`
        )

        resetForm({
          nom: response.data.nom,
          categorie: response.data.categorie,
          prix: response.data.prix,
          quantiteStock:
            response.data.quantiteStock,
        })
      } catch (error) {
        const backendMessage =
          error.response?.data?.message

        setServerError(
          backendMessage ||
          'Impossible de charger le produit'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, resetForm])

  async function onSubmit(data) {
    setServerError('')

    try {
      if (isEditMode) {
        await api.put(
          `/api/products/${productId}`,
          data
        )
      } else {
        await api.post(
          '/api/products',
          data
        )
      }

      navigate('/products', {
        replace: true,
      })
    } catch (error) {
      const backendMessage =
        error.response?.data?.message

      setServerError(
        backendMessage ||
        "Impossible d'enregistrer le produit"
      )
    }
  }

  function cancelForm() {
    navigate('/products')
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
            label="Nom du produit"
            fullWidth
            margin="normal"
            error={Boolean(errors.nom)}
            helperText={errors.nom?.message}
          />

          <TextField
            {...form.register('categorie')}
            label="Catégorie"
            fullWidth
            margin="normal"
            error={Boolean(errors.categorie)}
            helperText={errors.categorie?.message}
          />

          <TextField
            {...form.register('prix', {
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
            {...form.register(
              'quantiteStock',
              {
                valueAsNumber: true,
              }
            )}
            label="Quantité en stock"
            type="number"
            fullWidth
            margin="normal"
            error={Boolean(
              errors.quantiteStock
            )}
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