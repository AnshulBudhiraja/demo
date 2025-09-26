import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Message {
  _id?: string;
  user: string;
  nickname: string;
  message: string;
  timestamp: string;
}

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
  messages: Message[];
  createdAt: string;
}

const Chat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`);
      setGroup(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Failed to load group chat');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-group', groupId);
    });

    newSocket.on('receive-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });

    setSocket(newSocket);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      const messageData = {
        groupId,
        message: newMessage.trim(),
      };

      // Send via socket for real-time
      socket.emit('send-message', messageData);

      // Also send via API to persist
      await axios.post(`${API_BASE_URL}/groups/${groupId}/message`, {
        message: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMember = () => {
    return group?.members.some(member => member.user._id === user?.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/groups')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Group Not Found
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">
            The requested group could not be found.
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!isMember()) {
    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/groups')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Access Denied
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="warning">
            You are not a member of this group. Please join the group first to access the chat.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/groups')}
            sx={{ mt: 2 }}
          >
            Back to Groups
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/groups')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {group.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <PeopleIcon />
            <Typography variant="body2">
              {group.members.length}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Group Info */}
        <Paper elevation={1} sx={{ p: 2, m: 2, mb: 0 }}>
          <Typography variant="h6" gutterBottom>
            {group.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {group.description}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {group.interests.map((interest, index) => (
              <Chip key={index} label={interest} size="small" />
            ))}
          </Box>
        </Paper>

        {/* Messages */}
        <Paper 
          elevation={1} 
          sx={{ 
            flexGrow: 1, 
            m: 2, 
            mt: 1, 
            mb: 0, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                color="text.secondary"
              >
                <ChatIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No messages yet
                </Typography>
                <Typography variant="body2">
                  Start the conversation by sending a message!
                </Typography>
              </Box>
            ) : (
              <List>
                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          {message.nickname.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2">
                              {message.nickname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(message.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {message.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </List>
            )}
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!socket}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !socket}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat;