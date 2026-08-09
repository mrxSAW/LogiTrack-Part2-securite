import { useState } from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'

import useAuth from '../../context/useAuth'

const drawerWidth = 230

const menuItems = [
  {
    label: 'Tableau de bord',
    path: '/dashboard',
    roles: ['ADMIN', 'MANAGER', 'AGENT'],
  },
  {
    label: 'Utilisateurs',
    path: '/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Clients',
    path: '/clients',
    roles: ['ADMIN', 'MANAGER', 'AGENT'],
  },
  {
    label: 'Produits',
    path: '/products',
    roles: ['ADMIN', 'MANAGER', 'AGENT'],
  },
  {
    label: 'Commandes',
    path: '/orders',
    roles: ['ADMIN', 'MANAGER', 'AGENT'],
  },
  {
    label: 'Profil',
    path: '/profile',
    roles: ['ADMIN', 'MANAGER', 'AGENT'],
  },
]

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const auth = useAuth()
  const navigate = useNavigate()

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  function handleLogout() {
    auth.logout()

    navigate('/login', {
      replace: true,
    })
  }

  const visibleMenuItems = menuItems.filter(
    function checkRole(item) {
      return item.roles.includes(auth.user?.role)
    }
  )

  const menuContent = (
    <Box>
      <Toolbar>
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
        >
          LogiTrack
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        {visibleMenuItems.map(function showItem(item) {
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={closeMobileMenu}
              sx={{
                margin: 1,
                borderRadius: 2,

                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              <ListItemText
                primary={item.label}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },

          marginLeft: {
            md: `${drawerWidth}px`,
          },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleMobileMenu}
            sx={{
              display: {
                md: 'none',
              },

              marginRight: 2,
            }}
          >
            ☰
          </IconButton>

          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            Gestion logistique
          </Typography>

          <Typography
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              marginRight: 2,
            }}
          >
            {auth.user?.prenom} — {auth.user?.role}
          </Typography>

          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },

          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: 'block',
              md: 'none',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {menuContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {menuContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            md: `calc(100% - ${drawerWidth}px)`,
          },

          padding: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  )
}