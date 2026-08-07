import { useState } from 'react'
import { NavLink,Outlet,useNavigate, } from 'react-router-dom'
import { AppBar,Box,Button,Divider,Drawer,IconButton,List,ListItemButton,ListItemText,Toolbar,Typography,} from '@mui/material'
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
  },{
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
}
]

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function toggleMenu() { setMobileOpen(!mobileOpen) }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true, })
  }

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role),)

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" color="primary" fontWeight="bold">
          LogiTrack
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        {visibleItems.map((item) => (
          
          <ListItemButton  key={item.path} component={NavLink}   to={item.path}
                                onClick={() => setMobileOpen(false)}
            
            sx={{ margin: 1, borderRadius: 2,

              '&.active': { backgroundColor: 'primary.main', color: 'primary.contrastText',
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box  sx={{ display: 'flex', minHeight: '100vh', }}>
      <AppBar
        position="fixed"
        sx={{
             width: { md: `calc(100% - ${drawerWidth}px)`, },
             marginLeft: {md: `${drawerWidth}px`,},
           }} >

    <Toolbar>
          <IconButton
            color="inherit"
            onClick={toggleMenu}
            sx={{
              display: { md: 'none', },
              marginRight: 2,
            }}>
            ☰
          </IconButton>

          <Typography variant="h6"  sx={{  flexGrow: 1, }} >
            Gestion logistique
          </Typography>

          <Typography
            sx={{
              display: {  xs: 'none', sm: 'block', }, marginRight: 2, }} >
            {user?.prenom} — {user?.role}
          </Typography>

          <Button  color="inherit"   onClick={handleLogout}>
            Déconnexion
          </Button>

        </Toolbar>
      </AppBar>

      <Box  component="nav" sx={{  width: { md: drawerWidth, }, flexShrink: { md: 0,}, }} >

        <Drawer variant="temporary"  open={mobileOpen} onClose={toggleMenu}
                 ModalProps={{keepMounted: true }}
        sx={{ display: { xs: 'block',md: 'none',},'& .MuiDrawer-paper': { width: drawerWidth,},}} >
          {drawerContent}
        </Drawer>

        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', md: 'block',},
                '& .MuiDrawer-paper': { width: drawerWidth,}, }}  open >
          {drawerContent}
        </Drawer>

      </Box>

       <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)`,  },
          padding: { xs: 2, md: 3, }, }} >
     <Toolbar />

        <Outlet />
      </Box>
    </Box>
  )
}