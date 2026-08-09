import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material'

import api from '../../api/axiosInstance'
import useAuth from '../../context/useAuth'

function getStockLabel(quantity) {
  if (quantity === 0) {
    return 'Rupture de stock'
  }

  if (quantity < 5) {
    return 'Stock faible'
  }

  return 'Disponible'
}

function getStockColor(quantity) {
  if (quantity === 0) {
    return 'error'
  }

  if (quantity < 5) {
    return 'warning'
  }

  return 'success'
}

export default function ProductDetails() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useParams()
  const navigate = useNavigate()
  const auth = useAuth()

  const productId = params.id

  const canManage = auth.hasRole(
    'ADMIN',
    'MANAGER'
  )

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          `/api/products/${productId}`
        )

        setProduct(response.data)
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger le produit'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  function goBack() {
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

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          {error}
        </Alert>

        <Button
          variant="outlined"
          sx={{ marginTop: 2 }}
          onClick={goBack}
        >
          Retour
        </Button>
      </Box>
    )
  }

  if (!product) {
    return (
      <Alert severity="error">
        Produit introuvable
      </Alert>
    )
  }

  const stockQuantity = Number(
    product.quantiteStock
  )

  const productPrice = Number(
    product.prix || 0
  )

  const stockValue =
    productPrice * stockQuantity

  const outOfStock = stockQuantity === 0
  const lowStock = stockQuantity < 5

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',

          flexDirection: {
            xs: 'column',
            sm: 'row',
          },

          justifyContent: 'space-between',

          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },

          gap: 2,
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            gutterBottom
          >
            Détails du produit
          </Typography>

          <Typography color="text.secondary">
            Informations et état du stock.
          </Typography>
        </Box>

        {canManage && (
          <Button
            component={Link}
            to={`/products/${product.id}/edit`}
            variant="contained"
          >
            Modifier
          </Button>
        )}
      </Box>

      {outOfStock && (
        <Alert
          severity="error"
          sx={{ marginBottom: 2 }}
        >
          Ce produit est en rupture de stock.
        </Alert>
      )}

      {!outOfStock && lowStock && (
        <Alert
          severity="warning"
          sx={{ marginBottom: 2 }}
        >
          Le stock de ce produit est faible.
        </Alert>
      )}

      <Paper
        sx={{
          padding: 3,
          maxWidth: 900,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h5">
            {product.nom ||
              `Produit #${product.id}`}
          </Typography>

          <Chip
            label={getStockLabel(
              stockQuantity
            )}
            color={getStockColor(
              stockQuantity
            )}
          />
        </Box>

        <Divider sx={{ marginY: 3 }} />

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },

            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Identifiant
            </Typography>

            <Typography>
              #{product.id}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Nom
            </Typography>

            <Typography>
              {product.nom || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Catégorie
            </Typography>

            <Typography>
              {product.categorie || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Prix
            </Typography>

            <Typography variant="h6">
              {productPrice.toFixed(2)} DH
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Quantité en stock
            </Typography>

            <Typography variant="h6">
              {stockQuantity}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Valeur du stock
            </Typography>

            <Typography variant="h6">
              {stockValue.toFixed(2)} DH
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Button
        variant="outlined"
        sx={{ marginTop: 3 }}
        onClick={goBack}
      >
        Retour
      </Button>
    </Box>
  )
}