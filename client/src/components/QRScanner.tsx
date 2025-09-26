import React, { useState, useRef, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  QrCodeScanner as QrScannerIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scanner-tabpanel-${index}`}
      aria-labelledby={`scanner-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [scannedData, setScannedData] = useState<string>('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleScan = async (data: string) => {
    if (data && data !== scannedData) {
      setScannedData(data);
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        if (tabValue === 0) {
          // Verify attendee
          const response = await axios.post(`${API_BASE_URL}/attendance/verify-attendee`, {
            qrCode: data
          });
          setScanResult(response.data);
          setOpenDialog(true);
        } else {
          // Check in
          const response = await axios.post(`${API_BASE_URL}/attendance/checkin`, {
            qrCode: data
          });
          setSuccess('Check-in successful!');
          setScanResult(response.data.user);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Error processing QR code');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setScannedData('');
    setScanResult(null);
    setError('');
    setSuccess('');
    stopCamera();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setScanResult(null);
  };

  // Simple QR code detection simulation (in a real app, you'd use a proper QR library)
  const simulateQRDetection = () => {
    const mockQRData = user?.profile.qrCode || 'mock-qr-data';
    handleScan(mockQRData);
  };

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
            QR Scanner
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Verify Attendee" />
            <Tab label="Check In" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom align="center">
              Verify Attendee
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" paragraph>
              Scan another attendee's QR code to verify their identity and see their profile.
            </Typography>

            <Box display="flex" justifyContent="center" mb={3}>
              <Box
                sx={{
                  width: '300px',
                  height: '300px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  position: 'relative',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #1976d2',
                    borderRadius: 1,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Button
                variant="contained"
                startIcon={<QrScannerIcon />}
                onClick={startCamera}
              >
                Start Camera
              </Button>
              <Button
                variant="outlined"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
              <Button
                variant="outlined"
                onClick={simulateQRDetection}
                color="secondary"
              >
                Simulate Scan
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom align="center">
              Check In
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" paragraph>
              Scan your own QR code to check in at the event.
            </Typography>

            <Box display="flex" justifyContent="center" mb={3}>
              <Box
                sx={{
                  width: '300px',
                  height: '300px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  position: 'relative',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #1976d2',
                    borderRadius: 1,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Button
                variant="contained"
                startIcon={<QrScannerIcon />}
                onClick={startCamera}
              >
                Start Camera
              </Button>
              <Button
                variant="outlined"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
              <Button
                variant="outlined"
                onClick={simulateQRDetection}
                color="secondary"
              >
                Simulate Check-in
              </Button>
            </Box>
          </TabPanel>

          {loading && (
            <Box display="flex" justifyContent="center" mb={2}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
        </Paper>
      </Container>

      {/* Verification Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            Attendee Verification
          </Box>
        </DialogTitle>
        <DialogContent>
          {scanResult && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {scanResult.nickname}
                </Typography>
                
                {scanResult.falseIdentity && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {scanResult.falseIdentity}
                  </Typography>
                )}

                {scanResult.bio && (
                  <Typography variant="body2" paragraph>
                    {scanResult.bio}
                  </Typography>
                )}

                {scanResult.interests && scanResult.interests.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="body2" gutterBottom>
                      Interests:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {scanResult.interests.map((interest: string, index: number) => (
                        <Chip key={index} label={interest} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  {scanResult.isVerified ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        Verified Attendee
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="warning.main">
                      Unverified Profile
                    </Typography>
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {scanResult.checkedIn ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        Checked In
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="warning.main">
                      Not Checked In
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;