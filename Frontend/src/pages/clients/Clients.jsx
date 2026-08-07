import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
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
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [keyword, setKeyword] = useState('')

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [sort, setSort] = useState('nom,asc')

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] =
    useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const [
    clientToDelete,
    setClientToDelete,
  ] = useState(null)

  const [deleting, setDeleting] =
    useState(false)

  const { hasRole } = useAuth()

  const canManage = hasRole(
    'ADMIN',
    'MANAGER',
  )

  const canDelete = hasRole('ADMIN')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let actif = true

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')

        // Recherche d’un client
        if (keyword.trim()) {
          const response = await api.get(
            '/api/clients/search',
            {
              params: {
                keyword: keyword.trim(),
              },
            },
          )

          const sortedClients = [
            ...response.data,
          ].sort(
            (firstClient, secondClient) => {
              const comparison = (
                firstClient.nom || ''
              ).localeCompare(
                secondClient.nom || '',
                'fr',
                {
                  sensitivity: 'base',
                },
              )

              if (sort === 'nom,desc') {
                return -comparison
              }

              return comparison
            },
          )

          if (actif) {
            setClients(sortedClients)

            setTotalElements(
              sortedClients.length,
            )

            setTotalPages(
              sortedClients.length > 0 ? 1 : 0,
            )
          }

          return
        }

        // Liste paginée et triée
        const response = await api.get(
          '/api/clients/page',
          {
            params: {
              page,
              size,
              sort,
            },
          },
        )

        if (actif) {
          setClients(response.data.content)

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
            'Impossible de charger les clients'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      actif = false
      clearTimeout(timer)
    }
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

  async function handleDelete() {
    if (!clientToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/clients/${clientToDelete.id}`,
      )

      setClientToDelete(null)

      if (
        clients.length === 1 &&
        page > 0
      ) {
        setPage((currentPage) => currentPage - 1)
      } else {
        setReload((value) => value + 1)
      }
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de supprimer le client'

      setError(message)
      setClientToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      {/* Titre et bouton d’ajout */}
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
          <Typography variant="h4" gutterBottom>
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

      {/* Recherche, tri et pagination */}
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
            sx={{
              minWidth: 180,
            }}
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
            sx={{
              minWidth: 180,
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Message d’erreur */}
      {error && (
        <Typography
          color="error"
          sx={{
            marginBottom: 2,
          }}
        >
          {error}
        </Typography>
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
          {/* Tableau des clients */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Ville</TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                    >
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
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
                          {/* Accessible à tous */}
                          <Button
                            component={Link}
                            to={`/clients/${client.id}`}
                            size="small"
                          >
                            Voir
                          </Button>

                          {/* ADMIN et MANAGER */}
                          {canManage && (
                            <Button
                              component={Link}
                              to={`/clients/${client.id}/edit`}
                              size="small"
                            >
                              Modifier
                            </Button>
                          )}

                          {/* ADMIN uniquement */}
                          {canDelete && (
                            <Button
                              color="error"
                              size="small"
                              onClick={() =>
                                setClientToDelete(
                                  client,
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

          {/* Total et pagination */}
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

      {/* Confirmation de suppression */}
      <ConfirmDialog
        open={Boolean(clientToDelete)}
        title="Supprimer le client"
        message={
          clientToDelete
            ? `Voulez-vous vraiment supprimer ${clientToDelete.nom} ?`
            : ''
        }
        loading={deleting}
        onCancel={() =>
          setClientToDelete(null)
        }
        onConfirm={handleDelete}
      />
    </Box>
  )
}