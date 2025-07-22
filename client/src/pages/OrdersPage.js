import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  LocalDining as DiningIcon,
  LocalShipping as DeliveryIcon,
  Done as DoneIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

function OrdersPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderSteps = ['Pending', 'Preparing', 'Ready', 'Completed'];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/orders/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up Socket.IO for real-time updates
    const socket = window.socket;
    if (socket) {
      socket.on('orderStatusUpdate', (updatedOrder) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('orderStatusUpdate');
      }
    };
  }, [token]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getActiveStep = (status) => {
    return orderSteps.indexOf(status.charAt(0).toUpperCase() + status.slice(1));
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {orders.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<DiningIcon />}
            onClick={() => navigate('/menu')}
          >
            Order Now
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div">
                      Order #{order._id.slice(-6)}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                      icon={
                        order.status === 'cancelled' ? <CancelIcon /> :
                        order.status === 'completed' ? <DoneIcon /> :
                        <ReceiptIcon />
                      }
                    />
                  </Box>

                  <Typography color="text.secondary" gutterBottom>
                    {formatDate(order.createdAt)}
                  </Typography>

                  <List>
                    {order.items.map((item, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={item.name}
                            secondary={`Quantity: ${item.quantity}`}
                          />
                          <Typography variant="body2">₹{item.price * item.quantity}</Typography>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>

                  <Box sx={{ mt: 3 }}>
                    <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
                      {orderSteps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="h6" color="primary">
                      Total: ₹{order.total}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  {order.status === 'pending' && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<ReceiptIcon />}
                    onClick={() => handleReorder(order)}
                  >
                    Reorder
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default OrdersPage;