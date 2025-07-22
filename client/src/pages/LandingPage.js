import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Grid, Card, CardMedia, CardContent, Fade } from '@mui/material';

const foodImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'https://images.unsplash.com/photo-1516685018646-5499d0a7d42f',
  'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
];

function LandingPage() {
  const navigate = useNavigate();
  return (
    <Fade in timeout={1000}>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" fontWeight={700} color="primary.main" gutterBottom>
            Welcome to Canteen Preorder
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={4}>
            Order your favorite meals in advance. Skip the queue. Enjoy fresh food, always on time!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mr: 2, px: 4, py: 1.5, fontWeight: 600, fontSize: '1.2rem', borderRadius: 8, boxShadow: 3 }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: '1.2rem', borderRadius: 8, boxShadow: 3 }}
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {foodImages.map((img, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card sx={{ borderRadius: 4, boxShadow: 6, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.04)' } }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={img}
                  alt="Delicious food"
                />
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    Fresh & Tasty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preorder from a wide variety of delicious meals and snacks. Fast, easy, and convenient!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fade>
  );
}

export default LandingPage; 