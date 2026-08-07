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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState(null)

  const [
    userToDelete,
    setUserToDelete,
  ] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { user: currentUser } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let actif = true

    async function loadUsers() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/api/users',
        )

        if (actif) {
          setUsers(response.data)
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger les utilisateurs'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      actif = false
    }
  }, [refreshKey])

  const filteredUsers = users.filter(
    (account) => {
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
    },
  )

  function isCurrentUser(account) {
    return (
      Number(account.id) ===
      Number(currentUser?.id)
    )
  }

  async function handleRoleChange(
    account,
    newRole,
  ) {
    if (isCurrentUser(account)) {
      setError(
        'Vous ne pouvez pas modifier votre propre rôle',
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
        },
      )

      setUsers((currentUsers) =>
        currentUsers.map((currentAccount) =>
          currentAccount.id === account.id
            ? response.data
            : currentAccount,
        ),
      )

      setSuccess(
        `Le rôle de ${account.nom} a été modifié`,
      )
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de modifier le rôle'

      setError(message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  function openDeleteDialog(account) {
    if (isCurrentUser(account)) {
      setError(
        'Vous ne pouvez pas supprimer votre propre compte',
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

  async function handleDeleteUser() {
    if (!userToDelete) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/users/${userToDelete.id}`,
      )

      const deletedName =
        `${userToDelete.nom} ${userToDelete.prenom}`

      setUserToDelete(null)

      setSuccess(
        `L’utilisateur ${deletedName} a été supprimé`,
      )

      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de supprimer l’utilisateur'

      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestion des utilisateurs
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          marginBottom: 3,
        }}
      >
        Consultez les utilisateurs et gérez leurs rôles.
      </Typography>

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

      {success && (
        <Alert
          severity="success"
          sx={{
            marginBottom: 2,
          }}
          onClose={() => setSuccess('')}
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
          onChange={(event) =>
            setKeyword(event.target.value)
          }
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((account) => (
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

                          {isCurrentUser(account) && (
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
                            account.role,
                          )}
                          color={getRoleColor(
                            account.role,
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
                            isCurrentUser(account) ||
                            updatingUserId ===
                              account.id
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              account,
                              event.target.value,
                            )
                          }
                          sx={{
                            minWidth: 160,
                          }}
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
                          disabled={
                            isCurrentUser(account)
                          }
                          onClick={() =>
                            openDeleteDialog(
                              account,
                            )
                          }
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            color="text.secondary"
            sx={{
              marginTop: 2,
            }}
          >
            Total : {filteredUsers.length}{' '}
            utilisateur(s)
          </Typography>
        </>
      )}

      <Dialog
        open={Boolean(userToDelete)}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          Supprimer l’utilisateur
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer{' '}
            <strong>
              {userToDelete?.nom}{' '}
              {userToDelete?.prenom}
            </strong>
            {' '}?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
          >
            Annuler
          </Button>

          <Button
            onClick={handleDeleteUser}
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