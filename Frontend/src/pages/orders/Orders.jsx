import { useEffect,useState,} from 'react'
import { Link } from 'react-router-dom'
import {Alert,Box, Button,Chip,CircularProgress, MenuItem,Pagination, Paper,Table, TableBody,TableCell,TableContainer, TableHead,TableRow,TextField,Typography,} from '@mui/material'
import api from '../../api/axiosInstance'
import ConfirmDialog from '../../components/common/ConfirmDialog'
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
  let total = 0
  const lines = order.lignes || []

  for (const line of lines) {
    const price = Number(  line.produit?.prix || 0)

    const quantity = Number(line.quantite || 0)

    total = total + price * quantity
  }

  return total
}
 
function sortOrderList(orders, sort) {
  const parts = sort.split(',')
  const property = parts[0]
  const direction = parts[1]

  const sortedOrders = [...orders]

  sortedOrders.sort(function compareOrders(firstOrder,secondOrder) {
    const firstValue = firstOrder[property] || ''

    const secondValue =secondOrder[property] || ''

    const result = firstValue.localeCompare( secondValue,'fr')

    if (direction === 'desc') {return -result}

    return result
  })

  return sortedOrders
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [sort, setSort] = useState('dateCommande,desc')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const auth = useAuth()
  const canManage = auth.hasRole( 'ADMIN','MANAGER')
  const canDelete = auth.hasRole('ADMIN')
  const filterActive = status !== '' || clientId !== ''

  useEffect(() => {
    async function loadClients() {
      try { 
        const response = await api.get( '/api/clients')

        setClients(response.data)
      } catch (requestError) {
        const backendMessage = requestError.response?.data?.message

        setError(
          backendMessage || 'Impossible de charger les clients'
        )
      }
    }

    loadClients()
  }, [])

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        setError('')

        if (filterActive) {
          const params = {}

          if (status) {
            params.statut = status
          }

          if (clientId) {
            params.clientId = clientId
          }

          const response = await api.get('/api/orders/filter',
            {
              params,
            }
          )

          const sortedOrders = sortOrderList(
            response.data,
            sort
          )

          setOrders(sortedOrders)
          setTotalElements(sortedOrders.length)
          setTotalPages(
            sortedOrders.length > 0 ? 1 : 0
          )

          return
        }

        const response = await api.get( '/api/orders/page',
          {
            params: {
              page,
              size,
              sort,
            },
          }
        )

        setOrders(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)

      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(  backendMessage ||'Impossible de charger les commandes')

      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [ status,clientId,page,size, sort,reload,filterActive,]    )

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

  async function changeOrderStatus(order) {
    const nextStatus = getNextStatus(
      order.statut
    )

    if (!nextStatus) {
      return
    }

    const orderIsEmpty = !order.lignes || order.lignes.length === 0

    if ( order.statut === 'EN_ATTENTE' && orderIsEmpty) {

      setError('Ajoutez au moins un produit avant d’expédier la commande')

      return
    }

    try {
      setUpdatingOrderId(order.id)
      setError('')

      await api.put(  `/api/orders/${order.id}/status`,
        {
          statut: nextStatus,
        }
      )

      setReload(reload + 1)
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message

      setError( backendMessage || 'Impossible de changer le statut')
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

  async function deleteOrder() {
    if (!orderToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete( `/api/orders/${orderToDelete.id}` )

      setOrderToDelete(null)

      if ( !filterActive && orders.length === 1 && page > 0 ) {
        setPage(page - 1)
      } else {
        setReload(reload + 1)
      }

    } catch (requestError) {
      const backendMessage =  requestError.response?.data?.message

      setError( backendMessage || 'Impossible de supprimer la commande' )
    } finally {
      setDeleting(false)
    }
  }

  let deleteMessage = ''

  if (orderToDelete) {
    deleteMessage = `Voulez-vous vraiment supprimer la commande #${orderToDelete.id} ?`

    if (orderToDelete.statut === 'EN_ATTENTE') {
      deleteMessage += ' Les quantités seront remises dans le stock.'
    } else {
      deleteMessage += ' Les quantités ne seront pas remises dans le stock.'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: {   xs: 'column', sm: 'row', },   justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center', },  gap: 2, marginBottom: 3,  }} >
        <Box>
          <Typography  variant="h4"   gutterBottom >
            Gestion des commandes
          </Typography>

          <Typography color="text.secondary">
            Consultez et gérez les commandes.
          </Typography>

        </Box>

        {canManage && (
          <Button  component={Link} to="/orders/new" variant="contained" >
            Nouvelle commande
          </Button>
        )}
      </Box>

      <Paper sx={{ padding: 2, marginBottom: 2,  }} >
        
        <Box sx={{ display: 'grid', gridTemplateColumns: {   xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)', },  gap: 2,  }} >
         
          <TextField select   label="Client" value={clientId}
            onChange={handleClientChange}   size="small" >
            <MenuItem value="">
              Tous les clients
            </MenuItem>

            {clients.map(function showClient( client) {
              return (
                <MenuItem  key={client.id} value={client.id} >
                  {client.nom} — {client.email}
                </MenuItem>
              )
            })}
          </TextField>

          <TextField  select label="Statut"  value={status}
            onChange={handleStatusChange} size="small" >
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

          <TextField select label="Trier par" value={sort}
            onChange={handleSortChange}  size="small" >

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

          <TextField select label="Éléments par page" value={size}
            onChange={handleSizeChange}  size="small" disabled={filterActive} >
            
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          
          </TextField>
        
        </Box>

        {filterActive && (
          <Button onClick={clearFilters}    sx={{ marginTop: 1 }} >
            Effacer les filtres
          </Button>
        )}

      </Paper>

      {error && (
        <Alert   severity="error" onClose={() => setError('')} sx={{ marginBottom: 2 }} >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center',  padding: 5, }} >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Produits</TableCell>

                  <TableCell align="right">
                    Total
                  </TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}  align="center" >
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                )}

                {orders.map(function showOrder(order) {
                  const nextStatus = getNextStatus(order.statut)

                  const updating = updatingOrderId === order.id

                  return (
                    <TableRow  key={order.id} hover >
                      <TableCell>
                        #{order.id}
                      </TableCell>

                      <TableCell>
                        {order.client?.nom || 'Client inconnu'}
                      </TableCell>

                      <TableCell>
                        {order.dateCommande}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel( order.statut )}
                          color={getStatusColor( order.statut  )} size="small"
                        />
                      
                      </TableCell>

                      <TableCell>
                        {order.lignes?.length || 0}
                      </TableCell>

                      <TableCell align="right">
                        {calculateOrderTotal( order ).toFixed(2)}{' '}  DH
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
                          }} >
                          <Button component={Link}  to={`/orders/${order.id}`} size="small" >
                            Voir
                          </Button>

                          {canManage &&
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

                          {nextStatus && (
                            <Button size="small" variant="outlined" disabled={updating}
                              onClick={() => changeOrderStatus( order )} >
                              {updating ? 'Modification...' : getStatusButtonLabel(
                                    order.statut
                                  )}
                            </Button>
                          )}

                          {order.statut ==='LIVREE' && (
                            <Typography variant="body2" color="success.main" >
                              Terminée
                            </Typography>
                          )}

                          {canDelete && (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                openDeleteDialog(
                                  order
                                )
                              }
                            >
                              Supprimer
                            </Button>
                          )}
                        </Box>
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

      <ConfirmDialog
        open={Boolean(orderToDelete)}
        title="Supprimer la commande"
        message={deleteMessage}
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={deleteOrder}
      />
    </Box>
  )
}