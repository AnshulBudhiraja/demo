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
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Groups as GroupsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Group {
  _id: string;
  name: string;
  description: string;
  interests: string[];
  members: Array<{
    user: {
      _id: string;
      profile: {
        nickname: string;
        falseIdentity?: string;
      };
    };
    role: string;
    joinedAt: string;
  }>;
  messages: Array<{
    user: string;
    nickname: string;
    message: string;
    timestamp: string;
  }>;
  createdAt: string;
}

const commonInterests = [
  'Technology', 'Business', 'Networking', 'Marketing', 'Design',
  'Photography', 'Music', 'Sports', 'Travel', 'Food',
  'Art', 'Fashion', 'Health', 'Fitness', 'Education',
  'Finance', 'Real Estate', 'Startups', 'Innovation', 'Sustainability'
];

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openAutoCreateDialog, setOpenAutoCreateDialog] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    interests: [] as string[],
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/create`, newGroup);
      setGroups([response.data, ...groups]);
      setOpenCreateDialog(false);
      setNewGroup({ name: '', description: '', interests: [] });
      setSuccess('Group created successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/groups/${groupId}/join`);
      fetchGroups();
      setSuccess('Joined group successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/groups/${groupId}/leave`);
      fetchGroups();
      setSuccess('Left group successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleAutoCreateGroups = async () => {
    setAutoCreating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/groups/auto-create`);
      if (response.data.groups.length > 0) {
        setGroups([...response.data.groups, ...groups]);
        setSuccess(`Created ${response.data.groups.length} groups based on your interests!`);
      } else {
        setSuccess('No new groups could be created. You might already be in groups with similar interests.');
      }
      setOpenAutoCreateDialog(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to auto-create groups');
    } finally {
      setAutoCreating(false);
    }
  };

  const isMember = (groupId: string) => {
    return groups.find(group => group._id === groupId)?.members.some(
      member => member.user._id === user?.id
    );
  };

  const isAdmin = (groupId: string) => {
    return groups.find(group => group._id === groupId)?.members.some(
      member => member.user._id === user?.id && member.role === 'admin'
    );
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
            Groups
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Interest Groups
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setOpenAutoCreateDialog(true)}
            >
              Auto-Create Groups
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Group
            </Button>
          </Box>
        </Box>

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
          {groups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={group._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {group.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {group.description}
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="body2" gutterBottom>
                      Interests:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {group.interests.map((interest, index) => (
                        <Chip key={index} label={interest} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PeopleIcon fontSize="small" />
                    <Typography variant="body2">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <ChatIcon fontSize="small" />
                    <Typography variant="body2">
                      {group.messages.length} message{group.messages.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  {isMember(group._id) ? (
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ChatIcon />}
                        onClick={() => navigate(`/groups/${group._id}/chat`)}
                      >
                        Chat
                      </Button>
                      {!isAdmin(group._id) && (
                        <Button
                          variant="outlined"
                          onClick={() => handleLeaveGroup(group._id)}
                        >
                          Leave
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleJoinGroup(group._id)}
                    >
                      Join Group
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {groups.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <GroupsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No groups available
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a new group or use auto-create to find groups based on your interests.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Your First Group
            </Button>
          </Paper>
        )}
      </Container>

      {/* Create Group Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={commonInterests}
            value={newGroup.interests}
            onChange={(event, newValue) => {
              setNewGroup({ ...newGroup, interests: newValue });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Group Interests"
                placeholder="Select interests for this group"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-Create Groups Dialog */}
      <Dialog open={openAutoCreateDialog} onClose={() => setOpenAutoCreateDialog(false)}>
        <DialogTitle>Auto-Create Groups</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            This will automatically create groups based on your interests and find other attendees with similar interests.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your current interests: {user?.profile.interests.join(', ') || 'None'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAutoCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAutoCreateGroups} 
            variant="contained"
            disabled={autoCreating}
            startIcon={autoCreating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          >
            {autoCreating ? 'Creating...' : 'Auto-Create Groups'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Groups;