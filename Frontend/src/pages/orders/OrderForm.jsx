import {useEffect, useState,} from 'react'
import { useNavigate } from 'react-router-dom'
import {Box,  Button,CircularProgress,MenuItem,Paper,TextField,Typography,} from '@mui/material'
import api from '../../api/axiosInstance'

export default function OrderForm() {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [loadingClients, setLoadingClients] =useState(true)
  const [submitting, setSubmitting] =useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let actif = true

    async function loadClients() {
      try {
        setLoadingClients(true)
        setError('')

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
      } finally {
        if (actif) {
          setLoadingClients(false)
        }
      }
    }

    loadClients()

    return () => {
      actif = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!clientId) {
      setError('Veuillez sélectionner un client')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await api.post('/api/orders',null,
  {params: { clientId,},},
)

navigate(  `/orders/${response.data.id}/products`,)
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'Impossible de créer la commande'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nouvelle commande
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          marginBottom: 3,
        }}
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
          <Typography
            color="error"
            sx={{
              marginBottom: 2,
            }}
          >
            {error}
          </Typography>
        )}

        {loadingClients ? (
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
              onChange={(event) =>
                setClientId(event.target.value)
              }
              disabled={
                submitting ||
                clients.length === 0
              }
            >
              {clients.map((client) => (
                <MenuItem
                  key={client.id}
                  value={client.id}
                >
                  {client.nom} — {client.email}
                </MenuItem>
              ))}
            </TextField>

            {clients.length === 0 && (
              <Typography
                color="text.secondary"
                sx={{
                  marginTop: 2,
                }}
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
                onClick={() =>
                  navigate('/orders')
                }
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