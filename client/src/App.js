import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import store from './store';
import { theme } from './theme';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import MenuPage from './pages/MenuPage';
import MyOrdersPage from './pages/MyOrderPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrderPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import PaymentPage from './pages/PaymentPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import socket from './socket';
import Navbar from './components/Navbar';
import FloatingCart from './components/FloatingCart';

function AppRoutes() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      socket.emit('register-user', user._id);
      socket.on('order-status-updated', (data) => {
        alert(`Order #${data.orderId} is now: ${data.status}`);
      });
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="/admin/menu" element={<AdminMenuPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <AppRoutes />
              </Box>
              <FloatingCart />
            </Box>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
