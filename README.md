# IIIT Bhagalpur Campus Intranet - Project Guide

## Overview
An **offline-first campus networking platform** for IIIT Bhagalpur, enabling students and faculty to share notes, discuss topics, message each other, and read announcements over a local network (LAN/Wi-Fi) without requiring internet connectivity.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure if needed
npm run dev  # Starts with nodemon
```

Server runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure if needed
npm run dev  # Starts Vite dev server
```

Frontend accessible at `http://localhost:5173`

## 📋 Features

### Authentication
- Email or roll number login
- JWT tokens + HTTP-only cookies
- Role-based access (student, faculty, admin)
- Auto-logout on token expiration

### Notes & Files
- Upload notes organized by branch, semester, subject
- Search and filter notes
- Download uploaded files
- Pagination support

### Discussion Forum
- Create discussion threads with tags
- Add comments to threads
- Upvote/downvote threads
- Full-text search

### Messaging
- Department-channel messaging (LAN-based)
- Direct P2P messaging
- Real-time updates via Socket.IO
- Message history

### Announcements
- Faculty/admin only posting
- Urgent flag for critical announcements
- Real-time notifications
- Live ticker display

## 🛠 Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Security**: Helmet, bcryptjs, JWT, rate limiting
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: CSS with dark theme

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & role checks
│   └── uploads/         # Uploaded files
├── server.js            # Main server file
└── package.json

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route pages
│   ├── state/           # Auth context
│   ├── utils/           # API client, socket
│   ├── assets/          # Images/logos
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── styles.css       # Global styles
├── vite.config.js
└── package.json
```

## 🔒 Security Features

- **Helmet.js**: HTTP security headers
- **Rate Limiting**: 100 req/15min (general), 5 req/15min (auth)
- **CORS**: Configurable origin
- **Password Hashing**: bcryptjs (10 rounds)
- **JWT**: 7-day expiration
- **Input Validation**: express-validator on all routes
- **File Upload**: Type restrictions, 50MB limit
- **Cookie Security**: HttpOnly, SameSite=Lax

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - List notes (supports filters, pagination)
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Upload new note (multipart/form-data)

### Forum
- `GET /api/forum/threads` - List threads
- `GET /api/forum/threads/:id` - Get thread with comments
- `POST /api/forum/threads` - Create new thread
- `POST /api/forum/threads/:id/comments` - Add comment
- `POST /api/forum/threads/:id/vote` - Vote on thread

### Messages
- `GET /api/messages/direct/:userId` - Get direct messages
- `GET /api/messages/department/:dept` - Get department messages

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement (faculty/admin only)

### Search
- `GET /api/search?q=query` - Search across all content

## 🔌 Socket.IO Events

### Emit (Client → Server)
- `joinDepartment(dept)` - Join department channel
- `joinDirect(userId)` - Join direct message room
- `sendDirectMessage({from, to, text})` - Send direct message
- `sendDepartmentMessage({from, department, text})` - Send department message
- `sendAnnouncement({title, body, createdBy, isUrgent})` - Broadcast announcement

### Listen (Server → Client)
- `newDirectMessage(msg)` - New direct message received
- `newDepartmentMessage(msg)` - New department message received
- `newAnnouncement(ann)` - New announcement broadcast

## 🎯 User Roles

### Student
- View/download notes
- Create threads & comments
- Send & receive messages
- View announcements

### Faculty
- View/download notes
- Create threads & comments
- Send & receive messages
- Create announcements
- Browse all content

### Admin
- Full access to all features
- Create announcements
- System administration

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development          # development or production
PORT=5000                      # Server port
MONGODB_URI=mongodb://...     # MongoDB connection
JWT_SECRET=your-secret-key    # JWT signing secret
CORS_ORIGIN=http://localhost  # Allowed origin
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Improvements Made

### Backend Security
- Added Helmet.js for security headers
- Implemented rate limiting on all routes
- Stricter auth endpoint rate limits
- Improved input validation and sanitization
- Better error handling with consistent responses
- Comprehensive logging system

### Frontend UX
- Added Error Boundary component for error handling
- Created Skeleton Loading components
- Implemented pagination for large datasets
- Better error messages and user feedback
- Loading states on all async operations
- Improved form validation
- Better responsive design

### Code Quality
- Consistent API response format with success/error handling
- Better error messages instead of generic "Server error"
- Proper cleanup on component unmount
- Input trimming and normalization
- File type validation for uploads
- Timeout configuration for requests

## 📱 Responsive Design

The application is optimized for:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (< 768px) - Grid collapses to single column

## 🧪 Testing the App

### Test Credentials
```
Admin:
  Email: admin@iiitbh.intranet
  Password: admin123

Faculty:
  Email: faculty@iiitbh.intranet
  Password: faculty123

Student:
  Email: student@iiitbh.intranet
  Password: student123
```

## 📈 Performance Optimizations

- Pagination for large datasets (notes, threads, announcements)
- MongoDB text indexes for fast search
- Lazy loading of thread details
- Debounced filter inputs
- Optimized socket.io rooms for department/direct messaging
- Image/file size validation

## 🐛 Common Issues & Solutions

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in .env
- Default: `mongodb://127.0.0.1:27017/campus_intranet`

### CORS Errors
- Frontend and backend must be on same network
- Check `CORS_ORIGIN` environment variable
- For development: `http://localhost:5173`

### Socket.IO Connection Issues
- Ensure backend port is configured correctly
- Check `VITE_SOCKET_URL` in frontend .env
- Verify WebSocket support in network

### File Upload Fails
- Check file size (max 50MB)
- Verify file type (pdf, doc, ppt, xls, txt, zip)
- Ensure `/uploads/notes/` directory exists

## 🔄 Development Workflow

1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev`
3. Start frontend (new terminal): `cd frontend && npm run dev`
4. Access at `http://localhost:5173`
5. Make changes - hot reload enabled

## 📝 License
MIT

## 👤 Author
Pradeep Kumar

---

For more information or issues, please check the project repository.
