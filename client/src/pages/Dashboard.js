import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import {
  History as HistoryIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const response = await axios.get('/api/orders/my');
        setRecentOrders(response.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecentOrders();
  }, [user]);

  if (!user) return null;

  const quickActions = [
    { title: 'View Menu', icon: <RestaurantIcon />, path: '/menu', color: 'primary' },
    { title: 'My Orders', icon: <ShoppingCartIcon />, path: '/orders', color: 'info' },
    ...(user.role === 'admin' ? [
      { title: 'Manage Menu', icon: <RestaurantIcon />, path: '/admin/menu', color: 'success' },
      { title: 'Analytics', icon: <HistoryIcon />, path: '/admin/analytics', color: 'warning' }
    ] : [])
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  mb: 2
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip
                label={user.role.toUpperCase()}
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="contained"
                    color={action.color}
                    fullWidth
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{ py: 2 }}
                  >
                    {action.title}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length > 0 ? (
              <List>
                {recentOrders.map((order, index) => (
                  <React.Fragment key={order._id}>
                    <ListItem>
                      <ListItemIcon>
                        <ShoppingCartIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order._id.slice(-6)}`}
                        secondary={`Status: ${order.status} - Total: ₹${order.total}`}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View Details
                      </Button>
                    </ListItem>
                    {index < recentOrders.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No recent orders found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
