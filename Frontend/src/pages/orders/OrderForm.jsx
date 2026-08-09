import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import api from '../../api/axiosInstance'

export default function OrderForm() {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] =
    useState(false)

  const [error, setError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/api/clients'
        )

        setClients(response.data)
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
  }, [])

  function handleClientChange(event) {
    setClientId(event.target.value)
  }

  function cancelForm() {
    navigate('/orders')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!clientId) {
      setError(
        'Veuillez sélectionner un client'
      )

      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await api.post(
        '/api/orders',
        null,
        {
          params: {
            clientId,
          },
        }
      )

      navigate(
        `/orders/${response.data.id}/products`
      )
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message

      setError(
        backendMessage ||
        'Impossible de créer la commande'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Nouvelle commande
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Sélectionnez le client de la commande.
      </Typography>

      <Paper
        sx={{
          padding: 3,
          maxWidth: 600,
        }}
      >
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
              padding: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <TextField
              select
              fullWidth
              label="Client"
              value={clientId}
              onChange={handleClientChange}
              disabled={
                submitting ||
                clients.length === 0
              }
            >
              {clients.map(function showClient(
                client
              ) {
                return (
                  <MenuItem
                    key={client.id}
                    value={client.id}
                  >
                    {client.nom} — {client.email}
                  </MenuItem>
                )
              })}
            </TextField>

            {clients.length === 0 && (
              <Typography
                color="text.secondary"
                sx={{ marginTop: 2 }}
              >
                Aucun client disponible. Créez
                d’abord un client.
              </Typography>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                marginTop: 3,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                disabled={submitting}
                onClick={cancelForm}
              >
                Annuler
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={
                  submitting ||
                  clients.length === 0
                }
              >
                {submitting
                  ? 'Création...'
                  : 'Créer la commande'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}