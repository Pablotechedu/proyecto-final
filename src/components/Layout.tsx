import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  CircularProgress
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  EventNote,
  Payment,
  Hub,
  Notifications,
  AccountCircle,
  Logout,
  ManageAccounts
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

const drawerWidth = 240

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
    handleClose()
  }

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  const getMenuItems = () => {
    const items = []
    
    // Dashboard - Solo Admin y Editor
    if (user.permissions?.isAdmin || user.permissions?.isEditor) {
      items.push({ text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' })
    }
    
    // Mi Hub - Solo Director y Terapeuta
    if (user.permissions?.isDirector || user.permissions?.isTherapist) {
      items.push({ text: 'Mi Hub', icon: <Hub />, path: '/therapist-hub' })
    }
    
    // Pacientes - Todos pueden ver
    items.push({ text: 'Pacientes', icon: <People />, path: '/patients' })
    
    // Sesiones - Todos pueden ver
    items.push({ text: 'Sesiones', icon: <EventNote />, path: '/sessions' })
    
    // Pagos - Solo Admin y Editor
    if (user.permissions?.isAdmin || user.permissions?.isEditor) {
      items.push({ text: 'Pagos', icon: <Payment />, path: '/payments' })
    }
    
    // Usuarios - Solo Admin
    if (user.permissions?.isAdmin) {
      items.push({ text: 'Usuarios', icon: <ManageAccounts />, path: '/users' })
    }
    
    return items
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Therapy HUB
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getMenuItems().find(item => item.path === location.pathname)?.text || 'Therapy HUB'}
          </Typography>
          
          {/* Notifications */}
          <IconButton 
            size="large" 
            color="inherit"
            aria-label="Notificaciones"
            aria-describedby="notifications-badge"
          >
            <Badge badgeContent={4} color="error" id="notifications-badge">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <div>
            <IconButton
              size="large"
              aria-label={`Menú de usuario - ${user.name}`}
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="body2">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.permissions?.isAdmin && 'Admin'}
                    {user.permissions?.isEditor && !user.permissions?.isAdmin && 'Editor'}
                    {user.permissions?.isTherapist && !user.permissions?.isAdmin && !user.permissions?.isEditor && 'Terapeuta'}
                    {user.permissions?.isDirector && ' + Director'}
                  </Typography>
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
