import { useNavigate } from 'react-router-dom'

import {Avatar,Box, Button,Chip,Divider,Paper,Typography,} from '@mui/material'

import useAuth from '../context/useAuth'

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

export default function Profile() {
  const navigate = useNavigate()
  const auth = useAuth()

  const user = auth.user

  const firstNameInitial =
    user?.prenom?.charAt(0) || ''

  const lastNameInitial =
    user?.nom?.charAt(0) || ''

  const initials =
    `${firstNameInitial}${lastNameInitial}`
      .toUpperCase()

  function goToDashboard() {
    navigate('/dashboard')
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
      >
        Mon profil
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ marginBottom: 3 }}
      >
        Consultez les informations de votre compte.
      </Typography>

      <Paper
        sx={{
          padding: 3,
          maxWidth: 800,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },

            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              fontSize: 32,
              backgroundColor: 'primary.main',
            }}
          >
            {initials || '?'}
          </Avatar>

          <Box>
            <Typography variant="h5">
              {user?.prenom} {user?.nom}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                marginTop: 0.5,
                marginBottom: 1,
              }}
            >
              {user?.email}
            </Typography>

            <Chip
              label={getRoleLabel(user?.role)}
              color={getRoleColor(user?.role)}
            />
          </Box>
        </Box>

        <Divider sx={{ marginY: 3 }} />

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },

            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Identifiant
            </Typography>

            <Typography>
              #{user?.id}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Rôle
            </Typography>

            <Typography>
              {getRoleLabel(user?.role)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Nom
            </Typography>

            <Typography>
              {user?.nom || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Prénom
            </Typography>

            <Typography>
              {user?.prenom || '-'}
            </Typography>
          </Box>

          <Box
            sx={{
              gridColumn: {
                xs: 'auto',
                sm: '1 / -1',
              },
            }}
          >
            <Typography color="text.secondary">
              Adresse email
            </Typography>

            <Typography>
              {user?.email || '-'}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 3,
          }}
        >
          <Button
            variant="outlined"
            onClick={goToDashboard}
          >
            Retour au tableau de bord
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}