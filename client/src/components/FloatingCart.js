import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Badge,
  Fab,
  Divider,
  ButtonGroup
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FloatingCart = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getItemCount
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/payment', { state: { cart } });
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="cart"
        onClick={() => setIsCartOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Badge badgeContent={getItemCount()} color="error">
          <CartIcon />
        </Badge>
      </Fab>

      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Shopping Cart ({getItemCount()} items)
            </Typography>
            <IconButton onClick={() => setIsCartOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {cart.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              Your cart is empty
            </Typography>
          ) : (
            <List>
              {cart.map((item) => (
                <ListItem key={item.item._id} sx={{ py: 2 }}>
                  <ListItemText
                    primary={item.item.name}
                    secondary={`₹${item.item.price} each`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ButtonGroup size="small" sx={{ mr: 2 }}>
                        <Button
                          onClick={() => updateQuantity(item.item._id, item.quantity - 1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button disabled sx={{ px: 2 }}>
                          {item.quantity}
                        </Button>
                        <Button
                          onClick={() => updateQuantity(item.item._id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>
                      <IconButton
                        edge="end"
                        onClick={() => removeFromCart(item.item._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total: ₹{getCartTotal()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={cart.length === 0}
              onClick={handleCheckout}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default FloatingCart;