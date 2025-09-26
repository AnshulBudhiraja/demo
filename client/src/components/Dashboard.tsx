import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  QrCodeScanner as QrScannerIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalMessages: 0,
    checkedIn: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [groupsResponse, attendanceResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/groups/my-groups`),
        axios.get(`${API_BASE_URL}/attendance/status`),
      ]);

      setStats({
        totalGroups: groupsResponse.data.length,
        totalMessages: groupsResponse.data.reduce((total: number, group: any) => 
          total + (group.messages?.length || 0), 0),
        checkedIn: attendanceResponse.data.checkedIn,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Event Networking Platform
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.profile.nickname.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.profile.nickname}!
        </Typography>

        {!stats.checkedIn && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You haven't checked in yet. Use the QR Scanner to check in at the event.
          </Alert>
        )}

        {stats.checkedIn && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center">
              <CheckCircleIcon sx={{ mr: 1 }} />
              You're checked in! Ready to network.
            </Box>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={() => navigate('/qr-code')}
                    fullWidth
                  >
                    Show My QR Code
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<QrScannerIcon />}
                    onClick={() => navigate('/qr-scanner')}
                    fullWidth
                  >
                    Scan QR Code
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GroupsIcon />}
                    onClick={() => navigate('/groups')}
                    fullWidth
                  >
                    Browse Groups
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/profile')}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Profile
                </Typography>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Nickname: {user?.profile.nickname}
                  </Typography>
                  {user?.profile.falseIdentity && (
                    <Typography variant="body2" color="text.secondary">
                      Identity: {user?.profile.falseIdentity}
                    </Typography>
                  )}
                </Box>
                
                {user?.profile.interests && user.profile.interests.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" gutterBottom>
                      Interests:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {user.profile.interests.slice(0, 3).map((interest, index) => (
                        <Chip key={index} label={interest} size="small" />
                      ))}
                      {user.profile.interests.length > 3 && (
                        <Chip label={`+${user.profile.interests.length - 3} more`} size="small" />
                      )}
                    </Box>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  {stats.checkedIn ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        Checked In
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ScheduleIcon color="warning" />
                      <Typography variant="body2" color="warning.main">
                        Not Checked In
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Activity
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Groups Joined:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.totalGroups}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Messages Sent:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.totalMessages}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Get Started
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Welcome to the event networking platform! Here's what you can do:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="body2" gutterBottom>
                    Check in using the QR scanner
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Show your QR code to others for verification
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Join groups based on common interests
                  </Typography>
                  <Typography component="li" variant="body2" gutterBottom>
                    Chat with like-minded attendees
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;