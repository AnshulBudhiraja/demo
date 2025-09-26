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
  TextField,
  Chip,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const commonInterests = [
  'Technology', 'Business', 'Networking', 'Marketing', 'Design',
  'Photography', 'Music', 'Sports', 'Travel', 'Food',
  'Art', 'Fashion', 'Health', 'Fitness', 'Education',
  'Finance', 'Real Estate', 'Startups', 'Innovation', 'Sustainability'
];

const commonLookingFor = [
  'Business Partners', 'Mentors', 'Friends', 'Collaborators',
  'Investors', 'Clients', 'Job Opportunities', 'Learning',
  'Networking', 'Fun Activities', 'Professional Growth'
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: '',
    falseIdentity: '',
    bio: '',
    interests: [] as string[],
    lookingFor: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nickname: user.profile.nickname,
        falseIdentity: user.profile.falseIdentity || '',
        bio: user.profile.bio || '',
        interests: user.profile.interests || [],
        lookingFor: user.profile.lookingFor || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`${API_BASE_URL}/profiles/me`, profileData);
      updateUser(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        nickname: user.profile.nickname,
        falseIdentity: user.profile.falseIdentity || '',
        bio: user.profile.bio || '',
        interests: user.profile.interests || [],
        lookingFor: user.profile.lookingFor || [],
      });
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/profiles/verify`);
      updateUser(response.data.user);
      setSuccess('Profile verified successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to verify profile');
    }
  };

  if (!user) {
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
            My Profile
          </Typography>
          {!editing && (
            <Button
              color="inherit"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">
                      Profile Status
                    </Typography>
                    {user.profile.isVerified ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2" color="success.main">
                          Verified
                        </Typography>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon color="warning" />
                        <Typography variant="body2" color="warning.main">
                          Not Verified
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {!user.profile.isVerified && (
                    <Button
                      variant="outlined"
                      onClick={handleVerify}
                    >
                      Verify Profile
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Profile Information
              </Typography>

              <TextField
                margin="normal"
                fullWidth
                label="Nickname (Visible to others)"
                value={profileData.nickname}
                onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                disabled={!editing}
                required
              />

              <TextField
                margin="normal"
                fullWidth
                label="False Identity (Optional)"
                placeholder="e.g., 'Tech Enthusiast', 'Creative Mind'"
                value={profileData.falseIdentity}
                onChange={(e) => setProfileData({ ...profileData, falseIdentity: e.target.value })}
                disabled={!editing}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Bio"
                multiline
                rows={4}
                placeholder="Tell others about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                disabled={!editing}
              />

              <Autocomplete
                multiple
                options={commonInterests}
                value={profileData.interests}
                onChange={(event, newValue) => {
                  setProfileData({ ...profileData, interests: newValue });
                }}
                disabled={!editing}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    label="Your Interests"
                    placeholder="Select your interests"
                  />
                )}
              />

              <Autocomplete
                multiple
                options={commonLookingFor}
                value={profileData.lookingFor}
                onChange={(event, newValue) => {
                  setProfileData({ ...profileData, lookingFor: newValue });
                }}
                disabled={!editing}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    label="What are you looking for?"
                    placeholder="Select what you're looking for"
                  />
                )}
              />

              {editing && (
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* QR Code and Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Your QR Code
              </Typography>
              
              <Box
                sx={{
                  p: 2,
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  mb: 2,
                }}
              >
                {user.qrCodeImage ? (
                  <img
                    src={user.qrCodeImage}
                    alt="QR Code"
                    style={{
                      width: '150px',
                      height: '150px',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '150px',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      margin: '0 auto',
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: 60, color: '#ccc' }} />
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<QrCodeIcon />}
                onClick={() => navigate('/qr-code')}
                sx={{ mb: 2 }}
              >
                View Full QR Code
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" paragraph>
                Show this QR code to other attendees for verification. They can scan it to see your public profile.
              </Typography>
            </Paper>

            {/* Attendance Status */}
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Attendance Status
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {user.attendance.checkedIn ? (
                  <>
                    <CheckCircleIcon color="success" />
                    <Typography variant="body2" color="success.main">
                      Checked In
                    </Typography>
                  </>
                ) : (
                  <>
                    <WarningIcon color="warning" />
                    <Typography variant="body2" color="warning.main">
                      Not Checked In
                    </Typography>
                  </>
                )}
              </Box>

              {user.attendance.checkInTime && (
                <Typography variant="body2" color="text.secondary">
                  Check-in time: {new Date(user.attendance.checkInTime).toLocaleString()}
                </Typography>
              )}

              {!user.attendance.checkedIn && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/qr-scanner')}
                  sx={{ mt: 2 }}
                >
                  Check In Now
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;