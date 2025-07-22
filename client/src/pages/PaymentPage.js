import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Payment as PaymentIcon,

  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

function PaymentPage() {
  const navigate = useNavigate();

  const { token, user } = useContext(AuthContext);
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/menu');
    }
  }, [cart, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/payments/create', {
        amount: getCartTotal(),
        items: cart.map(item => ({
          itemId: item.item._id,
          quantity: item.quantity
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: response.data.amount,
        currency: 'INR',
        name: 'Canteen Pre-order',
        description: 'Food Order Payment',
        order_id: response.data.id,
        handler: async (response) => {
          try {
            await axios.post('/api/payments/verify', {
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              items: cart.map(item => ({
                itemId: item.item._id,
                quantity: item.quantity
              }))
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({
              open: true,
              message: 'Payment successful! Redirecting to orders...',
              severity: 'success'
            });
            clearCart();
            setTimeout(() => navigate('/orders'), 2000);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#1976d2'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <List>
              {cart.map((item, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemText
                    primary={item.item.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography variant="body1">₹{item.item.price * item.quantity}</Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6">₹{getCartTotal()}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Secure payment powered by Razorpay
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PaymentIcon />}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Pay Now'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

export default PaymentPage;