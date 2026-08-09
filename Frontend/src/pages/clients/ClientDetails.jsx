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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import api from '../../api/axiosInstance'
import useAuth from '../../context/useAuth'

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

function calculateOrderTotal(order) {
  let total = 0
  const lines = order.lignes || []

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

export default function ClientDetails() {
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useParams()
  const navigate = useNavigate()
  const auth = useAuth()

  const clientId = params.id

  const canManage = auth.hasRole(
    'ADMIN',
    'MANAGER'
  )

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true)
        setError('')

        const clientResponse = await api.get(
          `/api/clients/${clientId}`
        )

        const ordersResponse = await api.get(
          '/api/orders/filter',
          {
            params: {
              clientId,
            },
          }
        )

        setClient(clientResponse.data)
        setOrders(ordersResponse.data)
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger le client'
        )
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [clientId])

  function goBack() {
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

  if (!client) {
    return (
      <Alert severity="error">
        Client introuvable
      </Alert>
    )
  }

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
            Détails du client
          </Typography>

          <Typography color="text.secondary">
            Informations et commandes du client.
          </Typography>
        </Box>

        {canManage && (
          <Button
            component={Link}
            to={`/clients/${client.id}/edit`}
            variant="contained"
          >
            Modifier
          </Button>
        )}
      </Box>

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
          {client.nom}
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
              {client.nom}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Email
            </Typography>

            <Typography>
              {client.email}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Téléphone
            </Typography>

            <Typography>
              {client.telephone}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Ville
            </Typography>

            <Typography>
              {client.ville}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography
        variant="h5"
        sx={{ marginBottom: 2 }}
      >
        Commandes du client
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Produits</TableCell>

              <TableCell align="right">
                Total
              </TableCell>

              <TableCell align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                >
                  Ce client n’a aucune commande
                </TableCell>
              </TableRow>
            )}

            {orders.map(function showOrder(order) {
              return (
                <TableRow
                  key={order.id}
                  hover
                >
                  <TableCell>
                    #{order.id}
                  </TableCell>

                  <TableCell>
                    {order.dateCommande}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(
                        order.statut
                      )}
                      color={getStatusColor(
                        order.statut
                      )}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {order.lignes?.length || 0}
                  </TableCell>

                  <TableCell align="right">
                    {calculateOrderTotal(
                      order
                    ).toFixed(2)}{' '}
                    DH
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/orders/${order.id}`}
                      size="small"
                    >
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

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