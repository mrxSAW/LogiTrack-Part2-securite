import {useEffect,useState,} from 'react'

import {Alert,Box,Chip,CircularProgress,Paper,Table, TableBody,TableCell, TableContainer,TableHead, TableRow,Typography,} from '@mui/material'

import api from '../api/axiosInstance'
import DashboardCard from '../components/common/DashboardCard'
import useAuth from '../context/useAuth'

function getStatusColor(status) {
  if (status === 'EN_ATTENTE') {
    return 'warning'
  }

  if (status === 'EXPEDIEE') {
    return 'info'
  }

  if (status === 'LIVREE') {
    return 'success'
  }

  return 'default'
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const auth = useAuth()

  const canViewStats = auth.hasRole(
    'ADMIN',
    'MANAGER'
  )

  useEffect(() => {
    if (!canViewStats) {
      setLoading(false)
      return
    }

    async function loadStats() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          '/statistiques/dashboard'
        )

        setStats(response.data)
      } catch (requestError) {
        const backendMessage =
          requestError.response?.data?.message

        setError(
          backendMessage ||
          'Impossible de charger les statistiques'
        )
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [canViewStats])

  if (!canViewStats) {
    return (
      <Box>
        <Typography
          variant="h4"
          gutterBottom
        >
          Tableau de bord
        </Typography>

        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6">
            Bienvenue {auth.user?.prenom}{' '}
            {auth.user?.nom}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ marginTop: 1 }}
          >
            Vous êtes connecté avec le rôle AGENT.
            Vous pouvez consulter les clients,
            les produits et les commandes.
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
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  if (!stats) {
    return null
  }

  const lowStockProducts =
    stats.produitsStockFaible || []

  const recentOrders =
    stats.commandesRecentes || []

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
        sx={{ marginBottom: 3 }}
      >
        Bienvenue {auth.user?.prenom}{' '}
        {auth.user?.nom}
      </Typography>

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
          sx={{ marginTop: 1 }}
        >
          {stats.produitLePlusCommande ||
            'Aucune commande disponible'}
        </Typography>
      </Paper>

      <Typography
        variant="h5"
        sx={{ marginBottom: 2 }}
      >
        Produits avec un stock faible
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ marginBottom: 3 }}
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
            {lowStockProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  Aucun produit avec un stock faible
                </TableCell>
              </TableRow>
            )}

            {lowStockProducts.map(function showProduct(
              product
            ) {
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.nom}
                  </TableCell>

                  <TableCell>
                    {product.categorie}
                  </TableCell>

                  <TableCell>
                    {product.quantiteStock}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography
        variant="h5"
        sx={{ marginBottom: 2 }}
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
            {recentOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  Aucune commande récente
                </TableCell>
              </TableRow>
            )}

            {recentOrders.map(function showOrder(
              order
            ) {
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    #{order.id}
                  </TableCell>

                  <TableCell>
                    {order.client?.nom}
                  </TableCell>

                  <TableCell>
                    {order.dateCommande}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={order.statut}
                      color={getStatusColor(
                        order.statut
                      )}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}