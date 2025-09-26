import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const QRCodeDisplay: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.qrCodeImage) {
      setQrCodeImage(user.qrCodeImage);
      setLoading(false);
    }
  }, [user]);

  const handleDownload = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.download = `${user?.profile.nickname}-qr-code.png`;
      link.href = qrCodeImage;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrCodeImage) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeImage);
        const blob = await response.blob();
        const file = new File([blob], `${user?.profile.nickname}-qr-code.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'My Event QR Code',
          text: `Check out my profile at the event!`,
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`My Event QR Code: ${user?.profile.nickname}`);
      alert('QR code info copied to clipboard!');
    }
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
            My QR Code
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Your Event QR Code
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Show this QR code to other attendees for verification. They can scan it to see your public profile.
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <Box
                  sx={{
                    p: 2,
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                >
                  {qrCodeImage ? (
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      style={{
                        width: '200px',
                        height: '200px',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '200px',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <QrCodeIcon sx={{ fontSize: 60, color: '#ccc' }} />
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {user?.profile.nickname}
              </Typography>
              
              {user?.profile.falseIdentity && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.profile.falseIdentity}
                </Typography>
              )}

              {user?.profile.interests && user.profile.interests.length > 0 && (
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5} mt={2}>
                  {user.profile.interests.slice(0, 5).map((interest, index) => (
                    <Chip key={index} label={interest} size="small" />
                  ))}
                  {user.profile.interests.length > 5 && (
                    <Chip label={`+${user.profile.interests.length - 5} more`} size="small" />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            This QR code contains your unique identifier. Other attendees can scan it to verify your identity and see your public profile information.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default QRCodeDisplay;