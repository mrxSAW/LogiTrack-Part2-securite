import {useEffect, useState,} from 'react'

import { Link } from 'react-router-dom'

import { Alert,Box,Button, CircularProgress,MenuItem,Pagination,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography,} from '@mui/material'

import api from '../../api/axiosInstance'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import useAuth from '../../context/useAuth'

function sortClientList(clients, sort) {
  const sortedClients = [...clients]

  sortedClients.sort(function compareClients( firstClient, secondClient) {
    const result = firstClient.nom.localeCompare(
      secondClient.nom,
      'fr'
    )

    if (sort === 'nom,desc') {
      return -result
    }

    return result
  })

  return sortedClients
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [keyword, setKeyword] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [sort, setSort] = useState('nom,asc')

  const [totalPages, setTotalPages] =
    useState(0)

  const [totalElements, setTotalElements] =
    useState(0)

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const [clientToDelete, setClientToDelete] =
    useState(null)

  const auth = useAuth()

  const canManage = auth.hasRole(
    'ADMIN',
    'MANAGER'
  )

  const canDelete = auth.hasRole('ADMIN')

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true)
        setError('')

        if (keyword.trim()) {
          const response = await api.get(
            '/api/clients/search',
            {
              params: {
                keyword: keyword.trim(),
              },
            }
          )

          const sortedClients = sortClientList(
            response.data,
            sort
          )

          setClients(sortedClients)
          setTotalElements(sortedClients.length)

          if (sortedClients.length === 0) {
            setTotalPages(0)
          } else {
            setTotalPages(1)
          }

          return
        }

        const response = await api.get(
          '/api/clients/page',
          {
            params: {
              page,
              size,
              sort,
            },
          }
        )

        setClients(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(
          response.data.totalElements
        )
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger les clients'
        )
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [
    keyword,
    page,
    size,
    sort,
    reload,
  ])

  function handleSearch(event) {
    setKeyword(event.target.value)
    setPage(0)
  }

  function handlePageChange(event, newPage) {
    void event
    setPage(newPage - 1)
  }

  function handleSizeChange(event) {
    setSize(Number(event.target.value))
    setPage(0)
  }

  function handleSortChange(event) {
    setSort(event.target.value)
    setPage(0)
  }

  function openDeleteDialog(client) {
    setClientToDelete(client)
  }

  function closeDeleteDialog() {
    setClientToDelete(null)
  }

  async function deleteClient() {
    if (!clientToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/clients/${clientToDelete.id}`
      )

      closeDeleteDialog()

      if (clients.length === 1 && page > 0) {
        setPage(page - 1)
      } else {
        setReload(reload + 1)
      }
    } catch (requestError) {
      const backendMessage = requestError.response?.data?.message

      setError(
        backendMessage ||
        'Impossible de supprimer le client'
      )

      closeDeleteDialog()
    } finally {
      setDeleting(false)
    }
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
            xs: 'stretch',
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
            Gestion des clients
          </Typography>

          <Typography color="text.secondary">
            Consultez et gérez les clients.
          </Typography>
        </Box>

        {canManage && (
          <Button
            component={Link}
            to="/clients/new"
            variant="contained"
          >
            Ajouter un client
          </Button>
        )}
      </Box>

      <Paper
        sx={{
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            flexDirection: {
              xs: 'column',
              md: 'row',
            },

            gap: 2,
          }}
        >
          <TextField
            label="Rechercher un client"
            placeholder="Nom, email ou ville"
            value={keyword}
            onChange={handleSearch}
            fullWidth
            size="small"
          />

          <TextField
            select
            label="Trier par"
            value={sort}
            onChange={handleSortChange}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="nom,asc">
              Nom : A vers Z
            </MenuItem>

            <MenuItem value="nom,desc">
              Nom : Z vers A
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Éléments par page"
            value={size}
            onChange={handleSizeChange}
            size="small"
            disabled={Boolean(keyword.trim())}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ marginBottom: 2 }}
        >
          {error}
        </Alert>
      )}

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Ville</TableCell>

                  <TableCell align="right"> Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" >
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                )}

                {clients.map(function showClient(
                  client
                ) {
                  return (
                    <TableRow
                      key={client.id}
                      hover
                    >
                      <TableCell>
                        {client.nom}
                      </TableCell>

                      <TableCell>
                        {client.email}
                      </TableCell>

                      <TableCell>
                        {client.telephone}
                      </TableCell>

                      <TableCell>
                        {client.ville}
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent:
                              'flex-end',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          <Button component={Link}  to={`/clients/${client.id}`} size="small" >
                            Voir
                          </Button>

                          {canManage && (
                            <Button component={Link} to={`/clients/${client.id}/edit`} size="small">
                              Modifier
                            </Button>
                          )}

                          {canDelete && ( <Button color="error" size="small"
                                          onClick={() => openDeleteDialog(client) } >
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
              Total : {totalElements} client(s)
            </Typography>

            {!keyword.trim() &&
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
        open={Boolean(clientToDelete)}
        title="Supprimer le client"
        message={
          clientToDelete
            ? `Voulez-vous vraiment supprimer ${clientToDelete.nom} ?`
            : ''
        }
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={deleteClient}
      />
    </Box>
  )
}