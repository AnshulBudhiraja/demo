import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  QrCodeScanner as QrScannerIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Attendee {
  _id: string;
  profile: {
    nickname: string;
    falseIdentity?: string;
  };
  attendance: {
    checkedIn: boolean;
    checkInTime?: string;
  };
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({
    totalCheckedIn: 0,
    totalAttendees: 0,
  });

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/attendees`);
      setAttendees(response.data);
      setAttendanceStats({
        totalCheckedIn: response.data.length,
        totalAttendees: response.data.length, // This would be total registered users in a real app
      });
    } catch (error) {
      console.error('Error fetching attendees:', error);
      setError('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const formatCheckInTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Attendance
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* My Attendance Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Attendance Status
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {user?.attendance.checkedIn ? (
                <>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="success.main">
                      Checked In
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You're ready to network!
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="warning.main">
                      Not Checked In
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use the QR scanner to check in
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {user?.attendance.checkInTime && (
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Check-in time: {formatCheckInTime(user.attendance.checkInTime)}
                </Typography>
              </Box>
            )}

            {!user?.attendance.checkedIn && (
              <Button
                variant="contained"
                startIcon={<QrScannerIcon />}
                onClick={() => navigate('/qr-scanner')}
                sx={{ mt: 2 }}
              >
                Check In Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {attendanceStats.totalCheckedIn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Checked In
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {attendanceStats.totalAttendees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Attendees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {attendanceStats.totalAttendees - attendanceStats.totalCheckedIn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Not Checked In
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {attendanceStats.totalAttendees > 0 
                    ? Math.round((attendanceStats.totalCheckedIn / attendanceStats.totalAttendees) * 100)
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check-in Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Checked-in Attendees List */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Checked-in Attendees
          </Typography>
          
          {attendees.length === 0 ? (
            <Box textAlign="center" py={4}>
              <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No attendees checked in yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Attendees will appear here once they check in using their QR codes.
              </Typography>
            </Box>
          ) : (
            <List>
              {attendees.map((attendee, index) => (
                <React.Fragment key={attendee._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {attendee.profile.nickname.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {attendee.profile.nickname}
                          </Typography>
                          {attendee.profile.falseIdentity && (
                            <Chip 
                              label={attendee.profile.falseIdentity} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2" color="success.main">
                            Checked in
                          </Typography>
                          {attendee.attendance.checkInTime && (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatCheckInTime(attendee.attendance.checkInTime)}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < attendees.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Quick Actions */}
        <Box display="flex" gap={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<QrScannerIcon />}
            onClick={() => navigate('/qr-scanner')}
          >
            QR Scanner
          </Button>
          <Button
            variant="outlined"
            startIcon={<QrCodeIcon />}
            onClick={() => navigate('/qr-code')}
          >
            My QR Code
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Attendance;