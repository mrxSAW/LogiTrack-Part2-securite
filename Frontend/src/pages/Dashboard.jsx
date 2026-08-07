import {
  useEffect,
  useState,
} from 'react'
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import api from '../api/axiosInstance'
import useAuth from '../context/useAuth'
import DashboardCard from '../components/common/DashboardCard'

function getStatusColor(statut) {
  if (statut === 'EN_ATTENTE') {
    return 'warning'
  }

  if (statut === 'EXPEDIEE') {
    return 'info'
  }

  if (statut === 'LIVREE') {
    return 'success'
  }

  return 'default'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { user, hasRole } = useAuth()

  const canViewStats = hasRole(
    'ADMIN',
    'MANAGER',
  )

  useEffect(() => {
    let actif = true

    async function chargerStatistiques() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/statistiques/dashboard',
        )

        if (actif) {
          setStats(response.data)
        }
      } catch (requestError) {
        if (actif) {
          const message =
            requestError.response?.data?.message ||
            'Impossible de charger les statistiques'

          setError(message)
        }
      } finally {
        if (actif) {
          setLoading(false)
        }
      }
    }

    if (canViewStats) {
      chargerStatistiques()
    } else {
      setLoading(false)
    }

    return () => {
      actif = false
    }
  }, [canViewStats])

  // Dashboard simple pour AGENT
  if (!canViewStats) {
    return (
      <Box>
        <Typography
          variant="h4"
          gutterBottom
        >
          Tableau de bord
        </Typography>

        <Paper
          sx={{
            padding: 3,
          }}
        >
          <Typography variant="h6">
            Bienvenue {user?.prenom} {user?.nom}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              marginTop: 1,
            }}
          >
            Vous êtes connecté avec le rôle AGENT.
            Vous pouvez consulter les clients, les
            produits et les commandes.
          </Typography>
        </Paper>
      </Box>
    )
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
      <Typography color="error">
        {error}
      </Typography>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Tableau de bord
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          marginBottom: 3,
        }}
      >
        Bienvenue {user?.prenom} {user?.nom}
      </Typography>

      {/* Cartes principales */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2,
          marginBottom: 3,
        }}
      >
        <DashboardCard
          title="Clients"
          value={stats.nombreClients}
        />

        <DashboardCard
          title="Produits"
          value={stats.nombreProduits}
          color="secondary.main"
        />

        <DashboardCard
          title="Commandes"
          value={stats.nombreCommandes}
          color="info.main"
        />

        <DashboardCard
          title="En attente"
          value={stats.commandesEnAttente}
          color="warning.main"
        />

        <DashboardCard
          title="Expédiées"
          value={stats.commandesExpediees}
          color="info.main"
        />

        <DashboardCard
          title="Livrées"
          value={stats.commandesLivrees}
          color="success.main"
        />
      </Box>

      {/* Produit le plus commandé */}
      <Paper
        sx={{
          padding: 3,
          marginBottom: 3,
        }}
      >
        <Typography variant="h6">
          Produit le plus commandé
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            marginTop: 1,
          }}
        >
          {stats.produitLePlusCommande ||
            'Aucune commande disponible'}
        </Typography>
      </Paper>

      {/* Produits avec un stock faible */}
      <Typography
        variant="h5"
        sx={{
          marginBottom: 2,
        }}
      >
        Produits avec un stock faible
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          marginBottom: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Stock</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stats.produitsStockFaible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  Aucun produit avec un stock faible
                </TableCell>
              </TableRow>
            ) : (
              stats.produitsStockFaible.map(
                (produit) => (
                  <TableRow key={produit.id}>
                    <TableCell>
                      {produit.nom}
                    </TableCell>

                    <TableCell>
                      {produit.categorie}
                    </TableCell>

                    <TableCell>
                      {produit.quantiteStock}
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Commandes récentes */}
      <Typography
        variant="h5"
        sx={{
          marginBottom: 2,
        }}
      >
        Commandes récentes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stats.commandesRecentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  Aucune commande récente
                </TableCell>
              </TableRow>
            ) : (
              stats.commandesRecentes.map(
                (commande) => (
                  <TableRow key={commande.id}>
                    <TableCell>
                      #{commande.id}
                    </TableCell>

                    <TableCell>
                      {commande.client?.nom}
                    </TableCell>

                    <TableCell>
                      {commande.dateCommande}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={commande.statut}
                        color={getStatusColor(
                          commande.statut,
                        )}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}