import React, { useContext, useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import socket from '../socket';

function MyOrdersPage() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const res = await axios.get('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      setLoading(false);
    };
    fetchOrders();
    // Real-time updates
    socket.on('order-status-updated', (data) => {
      setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, status: data.status, estimatedReadyTime: data.estimatedReadyTime } : o));
    });
    return () => {
      socket.off('order-status-updated');
    };
  }, [token]);

  const filteredOrders = orders.filter(order => {
    if (tab === 0) return ['pending', 'preparing', 'ready'].includes(order.status);
    if (tab === 1) return order.status === 'completed';
    if (tab === 2) return order.status === 'cancelled';
    return true;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Orders</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Active" />
        <Tab label="Completed" />
        <Tab label="Cancelled" />
      </Tabs>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {filteredOrders.map((order, idx) => (
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MyOrdersPage;
