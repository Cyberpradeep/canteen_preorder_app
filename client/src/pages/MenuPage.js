import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

function MenuPage() {
  const [menu, setMenu] = useState([]);
  const { token } = useContext(AuthContext);
  const { cart, addToCart, setCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/menu');
        setMenu(response.data);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const placeOrder = async () => {
    if (!cart.length) return alert("Cart is empty!");
  
    const totalAmount = cart.reduce((acc, cur) => acc + cur.item.price * cur.quantity, 0);
  
    try {
      const res = await axios.post('/api/payment/create-order', { amount: totalAmount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const options = {
        key: "RAZORPAY_KEY_ID", // Replace this with your actual Razorpay key (from .env)
        amount: res.data.amount,
        currency: res.data.currency,
        name: "Canteen Preorder",
        description: "Food Order Payment",
        order_id: res.data.id,
        handler: async function (response) {
          // ✅ After payment success, place the order
          const items = cart.map(i => ({ item: i.item._id, quantity: i.quantity }));
          await axios.post('/api/orders', { items }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert("Payment successful! Order placed.");
          setCart([]);
        },
        theme: {
          color: "#3399cc"
        }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed: " + err.message);
    }
  };
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {menu.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image || 'https://via.placeholder.com/300x200'}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ₹{item.price}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  {item.available ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <Button fullWidth variant="outlined" disabled>
                      Not Available
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}


    </Container>
  );
}

export default MenuPage;
