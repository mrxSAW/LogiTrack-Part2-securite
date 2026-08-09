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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import api from '../../api/axiosInstance'

function getStatusLabel(status) {
  if (status === 'EN_ATTENTE') {
    return 'En attente'
  }

  if (status === 'EXPEDIEE') {
    return 'Expédiée'
  }

  if (status === 'LIVREE') {
    return 'Livrée'
  }

  return status
}

function getStatusColor(status) {
  if (status === 'EN_ATTENTE') {
    return 'warning'
  }

  if (status === 'EXPEDIEE') {
    return 'primary'
  }

  if (status === 'LIVREE') {
    return 'success'
  }

  return 'default'
}

function calculateTotal(order) {
  let total = 0
  const lines = order?.lignes || []

  for (const line of lines) {
    const price = Number(
      line.produit?.prix || 0
    )

    const quantity = Number(
      line.quantite || 0
    )

    total = total + price * quantity
  }

  return total
}

export default function OrderDetails() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useParams()
  const navigate = useNavigate()

  const orderId = params.id

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          `/api/orders/${orderId}`
        )

        setOrder(response.data)
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger la commande'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  function goBack() {
    navigate('/orders')
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

  if (!order) {
    return (
      <Alert severity="error">
        Commande introuvable
      </Alert>
    )
  }

  const orderLines = order.lignes || []

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Détails de la commande #{order.id}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Informations générales et produits de la
        commande.
      </Typography>

      <Paper
        sx={{
          padding: 3,
          marginBottom: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Informations générales
        </Typography>

        <Divider sx={{ marginBottom: 2 }} />

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },

            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Numéro
            </Typography>

            <Typography>
              #{order.id}
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
              label={getStatusLabel(
                order.statut
              )}
              color={getStatusColor(
                order.statut
              )}
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          padding: 3,
          marginBottom: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Client
        </Typography>

        <Divider sx={{ marginBottom: 2 }} />

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },

            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Nom
            </Typography>

            <Typography>
              {order.client?.nom || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Email
            </Typography>

            <Typography>
              {order.client?.email || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Téléphone
            </Typography>

            <Typography>
              {order.client?.telephone || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Ville
            </Typography>

            <Typography>
              {order.client?.ville || '-'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography
        variant="h6"
        sx={{ marginBottom: 1 }}
      >
        Produits
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Quantité</TableCell>

              <TableCell align="right">
                Sous-total
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orderLines.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                >
                  Aucun produit dans cette commande
                </TableCell>
              </TableRow>
            )}

            {orderLines.map(function showLine(line) {
              const price = Number(
                line.produit?.prix || 0
              )

              const subtotal =
                price * line.quantite

              return (
                <TableRow key={line.id}>
                  <TableCell>
                    {line.produit?.nom ||
                      'Produit inconnu'}
                  </TableCell>

                  <TableCell>
                    {line.produit?.categorie || '-'}
                  </TableCell>

                  <TableCell>
                    {price.toFixed(2)} DH
                  </TableCell>

                  <TableCell>
                    {line.quantite}
                  </TableCell>

                  <TableCell align="right">
                    {subtotal.toFixed(2)} DH
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          marginTop: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={goBack}
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