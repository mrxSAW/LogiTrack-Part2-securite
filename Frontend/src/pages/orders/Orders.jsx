import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Pagination,
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

function getNextStatus(status) {
  if (status === 'EN_ATTENTE') {
    return 'EXPEDIEE'
  }

  if (status === 'EXPEDIEE') {
    return 'LIVREE'
  }

  return null
}

function getStatusButtonLabel(status) {
  if (status === 'EN_ATTENTE') {
    return 'Expédier'
  }

  if (status === 'EXPEDIEE') {
    return 'Marquer livrée'
  }

  return ''
}

function calculateOrderTotal(order) {
  const lignes = order.lignes || []

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

function sortOrderList(orders, sortValue) {
  const [property, direction] =
    sortValue.split(',')

  return [...orders].sort(
    (firstOrder, secondOrder) => {
      let comparison

      if (property === 'dateCommande') {
        comparison = (
          firstOrder.dateCommande || ''
        ).localeCompare(
          secondOrder.dateCommande || '',
        )
      } else {
        comparison = (
          firstOrder.statut || ''
        ).localeCompare(
          secondOrder.statut || '',
          'fr',
          {
            sensitivity: 'base',
          },
        )
      }

      if (direction === 'desc') {
        return -comparison
      }

      return comparison
    },
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])

  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)

  const [sort, setSort] = useState(
    'dateCommande,desc',
  )

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] =
    useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [
    updatingOrderId,
    setUpdatingOrderId,
  ] = useState(null)

  const [refreshKey, setRefreshKey] = useState(0)

  const [
    orderToDelete,
    setOrderToDelete,
  ] = useState(null)

  const [deleting, setDeleting] = useState(false)

  const { hasRole } = useAuth()

  const canManageOrders = hasRole(
    'ADMIN',
    'MANAGER',
  )

  const canDeleteOrders = hasRole('ADMIN')

  const filterActive =
    status !== '' || clientId !== ''

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Charger les clients
  useEffect(() => {
    let actif = true

    async function loadClients() {
      try {
        const response = await api.get(
          '/api/clients',
        )

        if (actif) {
          setClients(response.data)
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger les clients'

          setError(message)
        }
      }
    }

    loadClients()

    return () => {
      actif = false
    }
  }, [])

  // Charger les commandes
  useEffect(() => {
    let actif = true

    async function loadOrders() {
      try {
        setLoading(true)
        setError('')

        let response

        // Filtrer par client et/ou statut
        if (
          status !== '' ||
          clientId !== ''
        ) {
          const params = {}

          if (status !== '') {
            params.statut = status
          }

          if (clientId !== '') {
            params.clientId = clientId
          }

          response = await api.get(
            '/api/orders/filter',
            {
              params,
            },
          )

          if (actif) {
            const sortedOrders =
              sortOrderList(
                response.data,
                sort,
              )

            setOrders(sortedOrders)

            setTotalElements(
              sortedOrders.length,
            )

            setTotalPages(
              sortedOrders.length > 0 ? 1 : 0,
            )
          }

          return
        }

        // Liste paginée et triée
        response = await api.get(
          '/api/orders/page',
          {
            params: {
              page,
              size,
              sort,
            },
          },
        )

        if (actif) {
          setOrders(response.data.content)

          setTotalPages(
            response.data.totalPages,
          )

          setTotalElements(
            response.data.totalElements,
          )
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger les commandes'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      actif = false
    }
  }, [
    status,
    clientId,
    page,
    size,
    sort,
    refreshKey,
  ])

  function handleClientChange(event) {
    setClientId(event.target.value)
    setPage(0)
  }

  function handleStatusChange(event) {
    setStatus(event.target.value)
    setPage(0)
  }

  function handleSortChange(event) {
    setSort(event.target.value)
    setPage(0)
  }

  function handleSizeChange(event) {
    setSize(Number(event.target.value))
    setPage(0)
  }

  function handlePageChange(event, newPage) {
    void event
    setPage(newPage - 1)
  }

  function clearFilters() {
    setClientId('')
    setStatus('')
    setPage(0)
  }

  async function handleChangeStatus(order) {
    const nextStatus = getNextStatus(
      order.statut,
    )

    if (!nextStatus) {
      return
    }

    // Empêcher l’expédition d’une commande vide
    if (
      order.statut === 'EN_ATTENTE' &&
      (!order.lignes ||
        order.lignes.length === 0)
    ) {
      setError(
        'Ajoutez au moins un produit avant d’expédier la commande',
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    try {
      setUpdatingOrderId(order.id)
      setError('')

      await api.put(
        `/api/orders/${order.id}/status`,
        {
          statut: nextStatus,
        },
      )

      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de changer le statut'

      setError(message)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  function openDeleteDialog(order) {
    setOrderToDelete(order)
  }

  function closeDeleteDialog() {
    if (!deleting) {
      setOrderToDelete(null)
    }
  }

  async function handleDeleteOrder() {
    if (!orderToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/orders/${orderToDelete.id}`,
      )

      setOrderToDelete(null)

      if (
        !filterActive &&
        orders.length === 1 &&
        page > 0
      ) {
        setPage((currentPage) => currentPage - 1)
      } else {
        setRefreshKey((current) => current + 1)
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de supprimer la commande'

      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      {/* Titre et création */}
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
            Gestion des commandes
          </Typography>

          <Typography color="text.secondary">
            Consultez et gérez les commandes.
          </Typography>
        </Box>

        {canManageOrders && (
          <Button
            component={Link}
            to="/orders/new"
            variant="contained"
          >
            Nouvelle commande
          </Button>
        )}
      </Box>

      {/* Filtres et tri */}
      <Paper
        sx={{
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {/* Client */}
          <TextField
            select
            label="Client"
            value={clientId}
            onChange={handleClientChange}
            size="small"
          >
            <MenuItem value="">
              Tous les clients
            </MenuItem>

            {clients.map((client) => (
              <MenuItem
                key={client.id}
                value={client.id}
              >
                {client.nom} — {client.email}
              </MenuItem>
            ))}
          </TextField>

          {/* Statut */}
          <TextField
            select
            label="Statut"
            value={status}
            onChange={handleStatusChange}
            size="small"
          >
            <MenuItem value="">
              Tous les statuts
            </MenuItem>

            <MenuItem value="EN_ATTENTE">
              En attente
            </MenuItem>

            <MenuItem value="EXPEDIEE">
              Expédiée
            </MenuItem>

            <MenuItem value="LIVREE">
              Livrée
            </MenuItem>
          </TextField>

          {/* Tri */}
          <TextField
            select
            label="Trier par"
            value={sort}
            onChange={handleSortChange}
            size="small"
          >
            <MenuItem value="dateCommande,desc">
              Date : plus récente
            </MenuItem>

            <MenuItem value="dateCommande,asc">
              Date : plus ancienne
            </MenuItem>

            <MenuItem value="statut,asc">
              Statut : A vers Z
            </MenuItem>

            <MenuItem value="statut,desc">
              Statut : Z vers A
            </MenuItem>
          </TextField>

          {/* Taille de page */}
          <TextField
            select
            label="Éléments par page"
            value={size}
            onChange={handleSizeChange}
            size="small"
            disabled={filterActive}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </TextField>
        </Box>

        {filterActive && (
          <Button
            variant="text"
            onClick={clearFilters}
            sx={{
              marginTop: 1,
            }}
          >
            Effacer les filtres
          </Button>
        )}
      </Paper>

      {/* Erreur */}
      {error && (
        <Alert
          severity="error"
          sx={{
            marginBottom: 2,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Chargement */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Numéro
                  </TableCell>

                  <TableCell>
                    Client
                  </TableCell>

                  <TableCell>
                    Date
                  </TableCell>

                  <TableCell>
                    Statut
                  </TableCell>

                  <TableCell>
                    Produits
                  </TableCell>

                  <TableCell align="right">
                    Total
                  </TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                    >
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                    >
                      <TableCell>
                        #{order.id}
                      </TableCell>

                      <TableCell>
                        {order.client?.nom ||
                          'Client inconnu'}
                      </TableCell>

                      <TableCell>
                        {order.dateCommande}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(
                            order.statut,
                          )}
                          color={getStatusColor(
                            order.statut,
                          )}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {order.lignes?.length || 0}
                      </TableCell>

                      <TableCell align="right">
                        {calculateOrderTotal(
                          order,
                        ).toFixed(2)}{' '}
                        DH
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent:
                              'flex-end',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          {/* Accessible à tous */}
                          <Button
                            component={Link}
                            to={`/orders/${order.id}`}
                            size="small"
                          >
                            Voir
                          </Button>

                          {/* ADMIN et MANAGER */}
                          {canManageOrders &&
                            order.statut ===
                              'EN_ATTENTE' && (
                              <Button
                                component={Link}
                                to={`/orders/${order.id}/products`}
                                size="small"
                              >
                                Gérer
                              </Button>
                            )}

                          {/* Changement de statut */}
                          {getNextStatus(
                            order.statut,
                          ) && (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={
                                updatingOrderId ===
                                order.id
                              }
                              onClick={() =>
                                handleChangeStatus(
                                  order,
                                )
                              }
                            >
                              {updatingOrderId ===
                              order.id
                                ? 'Modification...'
                                : getStatusButtonLabel(
                                    order.statut,
                                  )}
                            </Button>
                          )}

                          {order.statut ===
                            'LIVREE' && (
                            <Typography
                              variant="body2"
                              color="success.main"
                            >
                              Terminée
                            </Typography>
                          )}

                          {/* ADMIN uniquement */}
                          {canDeleteOrders && (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                openDeleteDialog(
                                  order,
                                )
                              }
                            >
                              Supprimer
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              marginTop: 2,
            }}
          >
            <Typography color="text.secondary">
              Total : {totalElements} commande(s)
            </Typography>

            {!filterActive &&
              totalPages > 1 && (
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              )}
          </Box>
        </>
      )}

      {/* Confirmation de suppression */}
      <Dialog
        open={Boolean(orderToDelete)}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Supprimer la commande
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer la commande{' '}
            <strong>
              #{orderToDelete?.id}
            </strong>
            {' '}du client{' '}
            <strong>
              {orderToDelete?.client?.nom ||
                'inconnu'}
            </strong>
            {' '}?
          </DialogContentText>

          {orderToDelete?.statut ===
            'EN_ATTENTE' && (
            <Alert
              severity="info"
              sx={{
                marginTop: 2,
              }}
            >
              Les quantités seront remises dans le stock.
            </Alert>
          )}

          {orderToDelete &&
            orderToDelete.statut !==
              'EN_ATTENTE' && (
              <Alert
                severity="warning"
                sx={{
                  marginTop: 2,
                }}
              >
                Cette commande n’est plus en attente.
                Les quantités ne seront pas remises dans
                le stock.
              </Alert>
            )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
          >
            Annuler
          </Button>

          <Button
            onClick={handleDeleteOrder}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting
              ? 'Suppression...'
              : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}