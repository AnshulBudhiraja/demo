import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

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

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    falseIdentity: '',
    bio: '',
    interests: [] as string[],
    lookingFor: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Event Networking Platform
          </Typography>
          <Typography component="h2" variant="h5" align="center" gutterBottom>
            Create Your Profile
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange('email')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange('password')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="nickname"
              label="Nickname (Visible to others)"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange('nickname')}
            />
            <TextField
              margin="normal"
              fullWidth
              id="falseIdentity"
              label="False Identity (Optional)"
              name="falseIdentity"
              placeholder="e.g., 'Tech Enthusiast', 'Creative Mind'"
              value={formData.falseIdentity}
              onChange={handleChange('falseIdentity')}
            />
            <TextField
              margin="normal"
              fullWidth
              id="bio"
              label="Bio"
              name="bio"
              multiline
              rows={3}
              placeholder="Tell others about yourself..."
              value={formData.bio}
              onChange={handleChange('bio')}
            />
            
            <Autocomplete
              multiple
              options={commonInterests}
              value={formData.interests}
              onChange={(event, newValue) => {
                setFormData({ ...formData, interests: newValue });
              }}
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
              value={formData.lookingFor}
              onChange={(event, newValue) => {
                setFormData({ ...formData, lookingFor: newValue });
              }}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Profile'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;