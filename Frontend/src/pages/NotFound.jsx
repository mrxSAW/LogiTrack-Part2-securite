import { Link } from 'react-router-dom'

import {
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material'

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 10,
          padding: 4,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
        >
          Page introuvable
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ marginBottom: 3 }}
        >
          La page demandée n’existe pas.
        </Typography>

        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
        >
          Retour au tableau de bord
        </Button>
      </Paper>
    </Container>
  )
}