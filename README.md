# Event Networking Platform

A comprehensive platform designed to connect people at events through QR code verification, interest-based grouping, and real-time chat functionality.

## Features

### 🎯 Core Functionality
- **Anonymous Profile System**: Users create profiles with nicknames and false identities while keeping real credentials private
- **QR Code Generation**: Each attendee gets a unique QR code for verification and check-in
- **QR Code Scanner**: Built-in scanner for verifying other attendees and checking in at events
- **Interest-Based Grouping**: Automatic group creation based on common interests
- **Real-time Chat**: Live messaging within interest groups
- **Attendance Tracking**: Check-in system with attendance statistics

### 🔐 Security & Privacy
- JWT-based authentication
- Anonymous profile system
- QR code verification for attendee legitimacy
- Secure API endpoints with rate limiting

### 🎨 Modern UI/UX
- Material-UI design system
- Responsive design for mobile and desktop
- Real-time updates with Socket.io
- Intuitive navigation and user experience

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **QRCode** library for QR code generation
- **bcryptjs** for password hashing

### Frontend
- **React 19** with TypeScript
- **Material-UI** for components and styling
- **React Router** for navigation
- **Axios** for API communication
- **Socket.io-client** for real-time features

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-networking
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

### Full Stack Setup

To install all dependencies and start both servers:

```bash
npm run install-all
npm run dev
```

## Usage Guide

### For Attendees

1. **Registration**: Create an account with email and password
2. **Profile Setup**: Add nickname, false identity, bio, interests, and what you're looking for
3. **QR Code**: Get your unique QR code for verification
4. **Check-in**: Use the QR scanner to check in at the event
5. **Networking**: 
   - Scan other attendees' QR codes to verify their identity
   - Join or create interest-based groups
   - Chat with group members in real-time
   - View attendance statistics

### For Event Organizers

1. **Monitor Attendance**: View real-time check-in statistics
2. **Group Management**: Oversee interest-based groups
3. **Attendee Verification**: Ensure all attendees are legitimate through QR verification

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Profiles
- `GET /api/profiles/me` - Get user's own profile
- `PUT /api/profiles/me` - Update profile
- `GET /api/profiles/discover` - Discover other profiles
- `POST /api/profiles/verify-qr` - Verify QR code
- `POST /api/profiles/verify` - Mark profile as verified

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/my-groups` - Get user's groups
- `POST /api/groups/create` - Create new group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/message` - Send message to group
- `POST /api/groups/auto-create` - Auto-create groups based on interests

### Attendance
- `POST /api/attendance/checkin` - Check in using QR code
- `GET /api/attendance/status` - Get attendance status
- `GET /api/attendance/attendees` - Get all checked-in attendees
- `POST /api/attendance/verify-attendee` - Verify attendee by QR code

## Real-time Features

The platform uses Socket.io for real-time communication:

- **Group Chat**: Live messaging within interest groups
- **Group Management**: Real-time updates when users join/leave groups
- **Attendance Updates**: Live attendance statistics

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper CORS setup for security

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables for production
3. Deploy to platforms like Heroku, AWS, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for better event networking experiences**