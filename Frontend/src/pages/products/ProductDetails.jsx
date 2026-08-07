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

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { hasRole } = useAuth()

  const canManage = hasRole(
    'ADMIN',
    'MANAGER',
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let actif = true

    async function loadProduct() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          `/api/products/${id}`,
        )

        if (actif) {
          setProduct(response.data)
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger le produit'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      actif = false
    }
  }, [id])

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
          sx={{
            marginTop: 2,
          }}
          onClick={() =>
            navigate('/products')
          }
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

  const lowStock =
    Number(product.quantiteStock) < 5

  const outOfStock =
    Number(product.quantiteStock) === 0

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
          <Typography variant="h4" gutterBottom>
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
          sx={{
            marginBottom: 2,
          }}
        >
          Ce produit est en rupture de stock.
        </Alert>
      )}

      {!outOfStock && lowStock && (
        <Alert
          severity="warning"
          sx={{
            marginBottom: 2,
          }}
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
            label={
              outOfStock
                ? 'Rupture de stock'
                : lowStock
                  ? 'Stock faible'
                  : 'Disponible'
            }
            color={
              outOfStock
                ? 'error'
                : lowStock
                  ? 'warning'
                  : 'success'
            }
          />
        </Box>

        <Divider
          sx={{
            marginY: 3,
          }}
        />

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
              {Number(
                product.prix || 0,
              ).toFixed(2)}{' '}
              DH
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Quantité en stock
            </Typography>

            <Typography variant="h6">
              {product.quantiteStock}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Valeur du stock
            </Typography>

            <Typography variant="h6">
              {(
                Number(product.prix || 0) *
                Number(
                  product.quantiteStock || 0,
                )
              ).toFixed(2)}{' '}
              DH
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Button
        variant="outlined"
        sx={{
          marginTop: 3,
        }}
        onClick={() => navigate('/products')}
      >
        Retour
      </Button>
    </Box>
  )
}
