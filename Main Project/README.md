# StreamSync - Your Social Media Cinema

A full-featured video streaming platform backend built with Node.js, Express, and MongoDB. This application provides a complete social media experience for video content creators and viewers, featuring video uploads, user authentication, subscriptions, likes, comments, playlists, and more.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - Refresh token mechanism
  - Session management with cookies

- **Video Management**
  - Upload videos with thumbnails
  - Update video details and thumbnails
  - Delete videos
  - Toggle publish status
  - View count tracking
  - Watch history

- **Social Features**
  - Subscribe/Unsubscribe to channels
  - Like videos, comments, and tweets
  - Comment on videos
  - Create and share tweets
  - User channel profiles

- **Playlist Management**
  - Create custom playlists
  - Add/Remove videos from playlists
  - Update playlist details
  - View user playlists

- **Dashboard Analytics**
  - Channel statistics
  - Video performance metrics
  - Subscriber count

- **Cloud Storage**
  - Cloudinary integration for media uploads
  - Automatic image and video optimization

## 🛠️ Technologies Used

- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Password Hashing**: bcrypt
- **Environment Variables**: dotenv
- **CORS**: Cross-Origin Resource Sharing enabled

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- npm or yarn package manager

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nexus-Agni/StreamSync-Your-Social-Media-Cinema.git
cd StreamSync-Your-Social-Media-Cinema
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file in the root directory**
```env
# Server Configuration
PORT=8000
CORS_ORIGIN=*

# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=streamsync

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:8000`

## 📁 Project Structure

```
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── tweet.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   ├── like.controller.js
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   └── healthcheck.controller.js
│   ├── models/             # Database schemas
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── tweet.model.js
│   │   ├── subscription.model.js
│   │   ├── playlist.model.js
│   │   ├── like.model.js
│   │   └── comments.model.js
│   ├── routers/            # API routes
│   │   ├── user.route.js
│   │   ├── video.route.js
│   │   ├── tweet.route.js
│   │   ├── subscription.routes.js
│   │   ├── playlist.routes.js
│   │   ├── like.routes.js
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   └── healthcheck.routes.js
│   ├── middlewares/        # Custom middlewares
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── utils/              # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   └── cloudinary.js
│   ├── db/                 # Database configuration
│   │   └── index_DB.js
│   ├── constants.js        # Application constants
│   ├── app.js              # Express app setup
│   └── index.js            # Entry point
├── public/
│   └── temp/               # Temporary file storage
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication.

### How to authenticate:

1. Register or login to get access token
2. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Token Refresh:

Access tokens expire after 1 day. Use the refresh token endpoint to get a new access token without re-logging in.

## 📚 API Documentation

For detailed API endpoints documentation, see [API_ENDPOINTS.md](API_ENDPOINTS.md)

### Base URL
```
http://localhost:8000/api/v1
```

### Quick Overview

| Feature | Endpoint | Auth Required |
|---------|----------|---------------|
| Health Check | `/healthcheck` | No |
| User Registration | `/users/register` | No |
| User Login | `/users/login` | No |
| Videos | `/videos` | Yes |
| Tweets | `/tweets` | Yes |
| Subscriptions | `/subscriptions` | Yes |
| Playlists | `/playlists` | Yes |
| Likes | `/likes` | Yes |
| Comments | `/comments` | Yes |
| Dashboard | `/dashboard` | Yes |

## 🧪 Testing

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Register a new user
4. Login to get access token
5. Test protected endpoints with the token

### Sample Test Flow

```bash
# 1. Health Check
GET http://localhost:8000/api/v1/healthcheck

# 2. Register User
POST http://localhost:8000/api/v1/users/register
Content-Type: multipart/form-data

# 3. Login
POST http://localhost:8000/api/v1/users/login
Content-Type: application/json

# 4. Get Current User (with token)
GET http://localhost:8000/api/v1/users/get-current-user
Authorization: Bearer YOUR_TOKEN
```

## 📊 Database Seeding

To populate the database with sample data for testing:

```bash
node seedData.js
```

This will create:
- 5 sample users
- 4 sample videos
- Multiple subscriptions
- Sample watch history

**Test Credentials (all users):**
- Password: `Test@123`
- Usernames: `johndoe`, `janedoe`, `techguru`, `codingmaster`, `designpro`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Yes |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry time | Yes |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Yes |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry time | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | Yes |

## 🚨 Error Handling

The API uses a centralized error handling mechanism with custom error classes:

- `ApiError`: Custom error class for API errors
- `ApiResponse`: Standardized response format

### Response Format

**Success Response:**
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- HTTP-only cookies for refresh tokens
- CORS configuration
- Input validation
- Authorization checks for resource ownership

## 📝 Code Quality

- ES6+ JavaScript
- Modular architecture
- Async/await for asynchronous operations
- Error handling with try-catch and custom error classes
- MongoDB aggregation pipelines for complex queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Agnibha Chakraborty (Nexus-Agni)**

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the robust database
- Cloudinary for media management
- All contributors and testers

## 📧 Contact & Support

For issues, questions, or contributions:
- GitHub: [@Nexus-Agni](https://github.com/Nexus-Agni)
- Repository: [StreamSync-Your-Social-Media-Cinema](https://github.com/Nexus-Agni/StreamSync-Your-Social-Media-Cinema)

---

**Happy Streaming! 🎬✨**