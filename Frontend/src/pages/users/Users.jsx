import {
  useEffect,
  useState,
} from 'react'

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
import ConfirmDialog from '../../components/common/ConfirmDialog'
import useAuth from '../../context/useAuth'

function getRoleLabel(role) {
  if (role === 'ADMIN') {
    return 'Administrateur'
  }

  if (role === 'MANAGER') {
    return 'Manager'
  }

  if (role === 'AGENT') {
    return 'Agent'
  }

  return role
}

function getRoleColor(role) {
  if (role === 'ADMIN') {
    return 'error'
  }

  if (role === 'MANAGER') {
    return 'primary'
  }

  if (role === 'AGENT') {
    return 'success'
  }

  return 'default'
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [keyword, setKeyword] = useState('')

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [updatingUserId, setUpdatingUserId] =
    useState(null)

  const [userToDelete, setUserToDelete] =
    useState(null)

  const auth = useAuth()

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/api/users'
        )

        setUsers(response.data)
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger les utilisateurs'
        )
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  function isCurrentUser(account) {
    return (
      Number(account.id) ===
      Number(auth.user?.id)
    )
  }

  function handleSearch(event) {
    setKeyword(event.target.value)
  }

  const filteredUsers = users.filter(
    function filterUser(account) {
      const search = keyword
        .trim()
        .toLowerCase()

      if (!search) {
        return true
      }

      const fullName =
        `${account.nom} ${account.prenom}`
          .toLowerCase()

      const email =
        account.email?.toLowerCase() || ''

      return (
        fullName.includes(search) ||
        email.includes(search)
      )
    }
  )

  async function changeRole(account, newRole) {
    if (isCurrentUser(account)) {
      setError(
        'Vous ne pouvez pas modifier votre propre rôle'
      )

      return
    }

    try {
      setUpdatingUserId(account.id)
      setError('')
      setSuccess('')

      const response = await api.put(
        `/api/users/${account.id}/role`,
        {
          role: newRole,
        }
      )

      setUsers(function updateUsers(currentUsers) {
        return currentUsers.map(
          function updateAccount(currentAccount) {
            if (
              currentAccount.id === account.id
            ) {
              return response.data
            }

            return currentAccount
          }
        )
      })

      setSuccess(
        `Le rôle de ${account.nom} a été modifié`
      )
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message

      setError(
        backendMessage ||
        'Impossible de modifier le rôle'
      )
    } finally {
      setUpdatingUserId(null)
    }
  }

  function openDeleteDialog(account) {
    if (isCurrentUser(account)) {
      setError(
        'Vous ne pouvez pas supprimer votre propre compte'
      )

      return
    }

    setError('')
    setSuccess('')
    setUserToDelete(account)
  }

  function closeDeleteDialog() {
    if (!deleting) {
      setUserToDelete(null)
    }
  }

  async function deleteUser() {
    if (!userToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/users/${userToDelete.id}`
      )

      const deletedUserId = userToDelete.id
      const deletedUserName =
        `${userToDelete.nom} ${userToDelete.prenom}`

      setUsers(function removeUser(currentUsers) {
        return currentUsers.filter(
          function keepUser(account) {
            return account.id !== deletedUserId
          }
        )
      })

      setUserToDelete(null)

      setSuccess(
        `L’utilisateur ${deletedUserName} a été supprimé`
      )
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message

      setError(
        backendMessage ||
        'Impossible de supprimer l’utilisateur'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Gestion des utilisateurs
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Consultez les utilisateurs et gérez leurs
        rôles.
      </Typography>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ marginBottom: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess('')}
          sx={{ marginBottom: 2 }}
        >
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          padding: 2,
          marginBottom: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Rechercher un utilisateur"
          placeholder="Nom, prénom ou email"
          value={keyword}
          onChange={handleSearch}
        />
      </Paper>

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
                  <TableCell>Prénom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle actuel</TableCell>
                  <TableCell>
                    Modifier le rôle
                  </TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}

                {filteredUsers.map(
                  function showUser(account) {
                    const currentAccount =
                      isCurrentUser(account)

                    const updating =
                      updatingUserId === account.id

                    return (
                      <TableRow
                        key={account.id}
                        hover
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {account.nom}

                            {currentAccount && (
                              <Chip
                                label="Vous"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          {account.prenom}
                        </TableCell>

                        <TableCell>
                          {account.email}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={getRoleLabel(
                              account.role
                            )}
                            color={getRoleColor(
                              account.role
                            )}
                            size="small"
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={account.role}
                            disabled={
                              currentAccount ||
                              updating
                            }
                            onChange={(event) =>
                              changeRole(
                                account,
                                event.target.value
                              )
                            }
                            sx={{ minWidth: 160 }}
                          >
                            <MenuItem value="ADMIN">
                              Administrateur
                            </MenuItem>

                            <MenuItem value="MANAGER">
                              Manager
                            </MenuItem>

                            <MenuItem value="AGENT">
                              Agent
                            </MenuItem>
                          </TextField>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            color="error"
                            size="small"
                            disabled={currentAccount}
                            onClick={() =>
                              openDeleteDialog(
                                account
                              )
                            }
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            color="text.secondary"
            sx={{ marginTop: 2 }}
          >
            Total : {filteredUsers.length}{' '}
            utilisateur(s)
          </Typography>
        </>
      )}

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Supprimer l’utilisateur"
        message={
          userToDelete
            ? `Voulez-vous vraiment supprimer ${userToDelete.nom} ${userToDelete.prenom} ?`
            : ''
        }
        loading={deleting}
        onCancel={closeDeleteDialog}
        onConfirm={deleteUser}
      />
    </Box>
  )
}