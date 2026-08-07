import {
  useEffect,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import api from '../../api/axiosInstance'

function calculateTotal(order) {
  const lignes = order?.lignes || []

  return lignes.reduce((total, ligne) => {
    const prix = Number(
      ligne.produit?.prix || 0,
    )

    const quantite = Number(
      ligne.quantite || 0,
    )

    return total + prix * quantite
  }, 0)
}

export default function OrderProducts() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [products, setProducts] = useState([])

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedProduct = products.find(
    (product) =>
      product.id === Number(productId),
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let actif = true

    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const [
          orderResponse,
          productsResponse,
        ] = await Promise.all([
          api.get(`/api/orders/${id}`),
          api.get('/api/products'),
        ])

        if (actif) {
          setOrder(orderResponse.data)
          setProducts(productsResponse.data)
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger la commande'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      actif = false
    }
  }, [id])

  async function handleAddProduct(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!productId) {
      setError('Veuillez sélectionner un produit')
      return
    }

    const numericQuantity = Number(quantity)

    if (
      !Number.isInteger(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setError(
        'La quantité doit être supérieure à zéro',
      )
      return
    }

    if (
      selectedProduct &&
      numericQuantity >
        selectedProduct.quantiteStock
    ) {
      setError(
        `Stock insuffisant. Stock disponible : ${selectedProduct.quantiteStock}`,
      )
      return
    }

    try {
      setSubmitting(true)

      const response = await api.post(
        `/api/orders/${id}/products`,
        {
          produitId: Number(productId),
          quantite: numericQuantity,
        },
      )

      setOrder(response.data)

      // Recharger les stocks des produits
      const productsResponse = await api.get(
        '/api/products',
      )

      setProducts(productsResponse.data)
      setProductId('')
      setQuantity(1)

      setSuccess(
        'Le produit a été ajouté à la commande',
      )
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible d’ajouter le produit'

      setError(message)
    } finally {
      setSubmitting(false)
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

  if (!order) {
    return (
      <Alert severity="error">
        Commande introuvable
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commande #{order.id}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          marginBottom: 3,
        }}
      >
        Ajoutez les produits et leurs quantités.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            marginBottom: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            marginBottom: 2,
          }}
        >
          {success}
        </Alert>
      )}

      {/* Informations de la commande */}
      <Paper
        sx={{
          padding: 3,
          marginBottom: 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Client
            </Typography>

            <Typography>
              {order.client?.nom ||
                'Client inconnu'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Date
            </Typography>

            <Typography>
              {order.dateCommande}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Statut
            </Typography>

            <Chip
              label={
                order.statut === 'EN_ATTENTE'
                  ? 'En attente'
                  : order.statut
              }
              color={
                order.statut === 'EN_ATTENTE'
                  ? 'warning'
                  : 'primary'
              }
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      {/* Formulaire d’ajout */}
      {order.statut === 'EN_ATTENTE' ? (
        <Paper
          component="form"
          onSubmit={handleAddProduct}
          sx={{
            padding: 3,
            marginBottom: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ajouter un produit
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr auto',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              select
              label="Produit"
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value)
                setQuantity(1)
              }}
              disabled={submitting}
            >
              {products.map((product) => (
                <MenuItem
                  key={product.id}
                  value={product.id}
                  disabled={
                    product.quantiteStock <= 0
                  }
                >
                  {product.nom || `Produit #${product.id}`}
                  {' — '}
                  Stock : {product.quantiteStock}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Quantité"
              type="number"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              disabled={submitting}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max:
                    selectedProduct
                      ?.quantiteStock,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                minHeight: 56,
              }}
            >
              {submitting
                ? 'Ajout...'
                : 'Ajouter'}
            </Button>
          </Box>

          {selectedProduct && (
            <Typography
              color="text.secondary"
              sx={{
                marginTop: 2,
              }}
            >
              Prix :{' '}
              {Number(
                selectedProduct.prix,
              ).toFixed(2)}{' '}
              DH — Stock disponible :{' '}
              {selectedProduct.quantiteStock}
            </Typography>
          )}
        </Paper>
      ) : (
        <Alert
          severity="info"
          sx={{
            marginBottom: 3,
          }}
        >
          Cette commande n’est plus en attente.
          Aucun produit ne peut être ajouté.
        </Alert>
      )}

      {/* Produits déjà ajoutés */}
      <Typography
        variant="h6"
        sx={{
          marginBottom: 1,
        }}
      >
        Produits de la commande
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell align="right">
                Sous-total
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!order.lignes ||
            order.lignes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  Aucun produit dans cette commande
                </TableCell>
              </TableRow>
            ) : (
              order.lignes.map((ligne) => {
                const prix = Number(
                  ligne.produit?.prix || 0,
                )

                const sousTotal =
                  prix * ligne.quantite

                return (
                  <TableRow key={ligne.id}>
                    <TableCell>
                      {ligne.produit?.nom ||
                        'Produit inconnu'}
                    </TableCell>

                    <TableCell>
                      {prix.toFixed(2)} DH
                    </TableCell>

                    <TableCell>
                      {ligne.quantite}
                    </TableCell>

                    <TableCell align="right">
                      {sousTotal.toFixed(2)} DH
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate('/orders')}
        >
          Retour
        </Button>

        <Typography variant="h6">
          Total :{' '}
          {calculateTotal(order).toFixed(2)} DH
        </Typography>
      </Box>
    </Box>
  )
}