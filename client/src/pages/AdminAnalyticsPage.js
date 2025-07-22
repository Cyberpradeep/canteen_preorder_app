import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  Line, Bar, Pie
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
);

function AdminAnalyticsPage() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState({ dailyOrders: [], dailyRevenue: [], topItems: [] });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/analytics/dashboard?timeRange=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, timeRange]);

  const orderChartData = {
    labels: data.dailyOrders.map(d => d._id),
    datasets: [{
      label: 'Orders per Day',
      data: data.dailyOrders.map(d => d.count),
      borderColor: 'blue',
      backgroundColor: 'lightblue',
      tension: 0.4
    }]
  };

  const revenueChartData = {
    labels: data.dailyRevenue.map(d => d._id),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: data.dailyRevenue.map(d => d.total),
      backgroundColor: 'green'
    }]
  };

  const topItemsData = {
    labels: data.topItems.map(i => i.name),
    datasets: [{
      label: 'Most Ordered Items',
      data: data.topItems.map(i => i.totalQty),
      backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1']
    }]
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Orders Over Time</Typography>
            <Box sx={{ height: 300 }}>
              <Line options={chartOptions} data={orderChartData} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Daily Revenue</Typography>
            <Box sx={{ height: 300 }}>
              <Bar options={chartOptions} data={revenueChartData} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Items</Typography>
            <Box sx={{ height: 300 }}>
              <Pie options={chartOptions} data={topItemsData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminAnalyticsPage;
