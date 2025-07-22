import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import socket from '../socket';

function AdminOrdersPage() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newReadyTime, setNewReadyTime] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
  const fetchOrders = async () => {
    setLoading(true);
      const res = await axios.get('/api/orders/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      setLoading(false);
  };
    fetchOrders();
    // Real-time updates
    socket.on('order-updated', (data) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, status: data.status, estimatedReadyTime: data.estimatedReadyTime } : o));
    });
    return () => {
      socket.off('order-updated');
    };
  }, [token]);

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewReadyTime(order.estimatedReadyTime ? dayjs(order.estimatedReadyTime) : dayjs());
  };

  const handleUpdateReadyTime = async () => {
    setUpdating(true);
    try {
      await axios.put(`/api/orders/${selectedOrder._id}/status`, {
        status: selectedOrder.status,
        estimatedReadyTime: newReadyTime.toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(null);
    } catch {
      alert('Failed to update ready time');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Orders</Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {orders.map((order, idx) => (
            <Grid item xs={12} key={idx}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Order #{order._id.slice(-6)}</Typography>
                    <Chip label={order.status.toUpperCase()} color={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'info'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Placed: {dayjs(order.createdAt).format('MMM D, YYYY h:mm A')}
        </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Ready: {order.estimatedReadyTime ? dayjs(order.estimatedReadyTime).format('MMM D, YYYY h:mm A') : 'N/A'}
                      </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Items:</Typography>
                    <ul>
                      {order.items.map((i, id) => (
                        <li key={id}>{i.item.name} x {i.quantity}</li>
                    ))}
                    </ul>
                  </Box>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleOpenDialog(order)}>
                    Adjust Ready Time
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        <DialogTitle>Adjust Ready Time</DialogTitle>
        <DialogContent>
          <TimePicker
            label="Estimated Ready Time"
            value={newReadyTime}
            onChange={setNewReadyTime}
            minTime={dayjs()}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Cancel</Button>
          <Button onClick={handleUpdateReadyTime} variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminOrdersPage;
