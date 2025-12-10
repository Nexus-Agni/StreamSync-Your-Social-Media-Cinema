# API Endpoints Documentation

Complete API reference for StreamSync backend. All endpoints return JSON responses.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [User Management](#user-management)
3. [Video Management](#video-management)
4. [Tweet Management](#tweet-management)
5. [Subscription Management](#subscription-management)
6. [Playlist Management](#playlist-management)
7. [Like Management](#like-management)
8. [Comment Management](#comment-management)
9. [Dashboard](#dashboard)

---

## Health Check

### Check API Health
```http
GET /api/v1/healthcheck
```

**Auth Required:** No

**Response:**
```json
{
  "statusCode": 200,
  "data": { "status": "OK" },
  "message": "Health check passed",
  "success": true
}
```

---

## User Management

### 1. Register User
```http
POST /api/v1/users/register
```

**Auth Required:** No

**Content-Type:** `multipart/form-data`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | Unique username |
| `email` | string | Yes | Valid email address |
| `fullname` | string | Yes | Full name |
| `password` | string | Yes | Password (min 6 chars) |
| `avatar` | file | Yes | Avatar image |
| `coverImage` | file | No | Cover image |

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://...",
    "coverImage": "https://..."
  },
  "message": "User registered successfully",
  "success": true
}
```

---

### 2. Login User
```http
POST /api/v1/users/login
```

**Auth Required:** No

**Content-Type:** `application/json`

**Body Parameters:**
```json
{
  "username": "johndoe",  // or "email": "john@example.com"
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "fullname": "John Doe",
      "avatar": "https://...",
      "coverImage": "https://..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Successfully logged In",
  "success": true
}
```

**Cookies Set:**
- `accessToken` (httpOnly, secure)
- `refreshToken` (httpOnly, secure)

---

### 3. Logout User
```http
POST /api/v1/users/logout
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User Logged out Successfully",
  "success": true
}
```

---

### 4. Refresh Access Token
```http
POST /api/v1/users/refresh-access-token
```

**Auth Required:** No (but requires refresh token in cookies)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  },
  "message": "Access token refreshed successfully",
  "success": true
}
```

---

### 5. Change Password
```http
POST /api/v1/users/change-password
```

**Auth Required:** Yes

**Body Parameters:**
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password changed successfully",
  "success": true
}
```

---

### 6. Get Current User
```http
GET /api/v1/users/get-current-user
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "avatar": "https://...",
    "coverImage": "https://..."
  },
  "message": "Current user fetched successfully",
  "success": true
}
```

---

### 7. Get User Channel Profile
```http
GET /api/v1/users/c/:username
```

**Auth Required:** Yes

**URL Parameters:**
- `username` - Channel username

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "fullname": "John Doe",
    "avatar": "https://...",
    "coverImage": "https://...",
    "subscribersCount": 150,
    "channelsSubscribedToCount": 25,
    "isSubscribed": true
  },
  "message": "User channel fetched successfully",
  "success": true
}
```

---

### 8. Get Watch History
```http
GET /api/v1/users/history
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "title": "Video Title",
      "thumbnail": "https://...",
      "duration": 1200,
      "views": 5000,
      "owner": {
        "username": "creator",
        "fullname": "Creator Name",
        "avatar": "https://..."
      }
    }
  ],
  "message": "Watch history fetched successfully",
  "success": true
}
```

---

### 9. Update Account Details
```http
PATCH /api/v1/users/update-accountdetails
```

**Auth Required:** Yes

**Body Parameters:**
```json
{
  "fullname": "New Full Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "email": "newemail@example.com",
    "fullname": "New Full Name"
  },
  "message": "Account details updated successfully",
  "success": true
}
```

---

### 10. Update Avatar
```http
PATCH /api/v1/users/update-avatar
```

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Body Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `avatar` | file | Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "avatar": "https://new-avatar-url..."
  },
  "message": "Avatar updated successfully",
  "success": true
}
```

---

### 11. Update Cover Image
```http
PATCH /api/v1/users/update-coverImage
```

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Body Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `coverImage` | file | Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "coverImage": "https://new-cover-url..."
  },
  "message": "Cover image updated successfully",
  "success": true
}
```

---

## Video Management

### 1. Get All Videos
```http
GET /api/v1/videos
```

**Auth Required:** Yes

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `query` | string | - | Search query |
| `sortBy` | string | createdAt | Sort field |
| `sortType` | string | desc | Sort order (asc/desc) |
| `userId` | string | - | Filter by user ID |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "videos": [
      {
        "_id": "...",
        "title": "Video Title",
        "description": "Description",
        "videoFile": "https://...",
        "thumbnail": "https://...",
        "duration": 1200,
        "views": 5000,
        "isPublished": true,
        "owner": {
          "username": "johndoe",
          "fullname": "John Doe",
          "avatar": "https://..."
        }
      }
    ],
    "totalVideos": 50,
    "currentPage": 1,
    "totalPages": 5
  },
  "message": "Videos fetched successfully",
  "success": true
}
```

---

### 2. Publish a Video
```http
POST /api/v1/videos
```

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Video title |
| `description` | string | Yes | Video description |
| `videoFile` | file | Yes | Video file |
| `thumbnail` | file | Yes | Thumbnail image |

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "title": "My Video",
    "description": "Description",
    "videoFile": "https://...",
    "thumbnail": "https://...",
    "duration": 1200,
    "views": 0,
    "isPublished": true,
    "owner": "..."
  },
  "message": "Video published successfully",
  "success": true
}
```

---

### 3. Get Video by ID
```http
GET /api/v1/videos/:videoId
```

**Auth Required:** Yes

**URL Parameters:**
- `videoId` - Video ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "title": "Video Title",
    "description": "Description",
    "videoFile": "https://...",
    "thumbnail": "https://...",
    "duration": 1200,
    "views": 5000,
    "isPublished": true,
    "owner": {
      "_id": "...",
      "username": "johndoe",
      "fullname": "John Doe",
      "avatar": "https://..."
    }
  },
  "message": "Video fetched successfully",
  "success": true
}
```

---

### 4. Update Video
```http
PATCH /api/v1/videos/:videoId
```

**Auth Required:** Yes (must be video owner)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `videoId` - Video ID

**Body Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `title` | string | No |
| `description` | string | No |
| `thumbnail` | file | No |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "title": "Updated Title",
    "description": "Updated Description",
    "thumbnail": "https://..."
  },
  "message": "Video updated successfully",
  "success": true
}
```

---

### 5. Delete Video
```http
DELETE /api/v1/videos/:videoId
```

**Auth Required:** Yes (must be video owner)

**URL Parameters:**
- `videoId` - Video ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Video deleted successfully",
  "success": true
}
```

---

### 6. Toggle Publish Status
```http
PATCH /api/v1/videos/toggle/publish/:videoId
```

**Auth Required:** Yes (must be video owner)

**URL Parameters:**
- `videoId` - Video ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "isPublished": false
  },
  "message": "Video publish status toggled successfully",
  "success": true
}
```

---

## Tweet Management

### 1. Create Tweet
```http
POST /api/v1/tweets
```

**Auth Required:** Yes

**Body Parameters:**
```json
{
  "content": "Tweet content here..."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "content": "Tweet content here...",
    "owner": "...",
    "createdAt": "2025-12-10T..."
  },
  "message": "Tweet created successfully",
  "success": true
}
```

---

### 2. Get User Tweets
```http
GET /api/v1/tweets/user/:userId
```

**Auth Required:** Yes

**URL Parameters:**
- `userId` - User ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "username": "johndoe",
    "fullname": "John Doe",
    "avatar": "https://...",
    "userTweets": [
      {
        "_id": "...",
        "content": "Tweet content",
        "owner": "...",
        "createdAt": "..."
      }
    ]
  },
  "message": "User tweets fetched successfully",
  "success": true
}
```

---

### 3. Update Tweet
```http
PATCH /api/v1/tweets/:tweetId
```

**Auth Required:** Yes (must be tweet owner)

**URL Parameters:**
- `tweetId` - Tweet ID

**Body Parameters:**
```json
{
  "updatedContent": "Updated tweet content..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "content": "Updated tweet content...",
    "owner": "..."
  },
  "message": "Tweet Updated Successfully",
  "success": true
}
```

---

### 4. Delete Tweet
```http
DELETE /api/v1/tweets/:tweetId
```

**Auth Required:** Yes (must be tweet owner)

**URL Parameters:**
- `tweetId` - Tweet ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Tweet deleted successfully",
  "success": true
}
```

---

## Subscription Management

### 1. Toggle Subscription
```http
POST /api/v1/subscriptions/c/:channelId
```

**Auth Required:** Yes

**URL Parameters:**
- `channelId` - Channel (User) ID to subscribe/unsubscribe

**Response (Subscribe):**
```json
{
  "statusCode": 201,
  "data": {
    "subscribed": true,
    "subscription": {
      "_id": "...",
      "channel": "...",
      "subscriber": "..."
    }
  },
  "message": "Subscribed successfully",
  "success": true
}
```

**Response (Unsubscribe):**
```json
{
  "statusCode": 200,
  "data": {
    "subscribed": false,
    "channelId": "..."
  },
  "message": "Unsubscribed successfully",
  "success": true
}
```

---

### 2. Get Channel Subscribers
```http
GET /api/v1/subscriptions/c/:channelId
```

**Auth Required:** Yes

**URL Parameters:**
- `channelId` - Channel (User) ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "channelId": "...",
    "subscriberCount": 150,
    "subscribers": [
      {
        "_id": "...",
        "username": "subscriber1",
        "fullname": "Subscriber One",
        "avatar": "https://..."
      }
    ]
  },
  "message": "Subscriber list fetched successfully",
  "success": true
}
```

---

### 3. Get Subscribed Channels
```http
GET /api/v1/subscriptions/u/:subscriberId
```

**Auth Required:** Yes

**URL Parameters:**
- `subscriberId` - Subscriber (User) ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "subscriberId": "...",
    "channelsSubscribedToCount": 25,
    "subscribedChannels": [
      {
        "_id": "...",
        "username": "channel1",
        "fullname": "Channel One",
        "avatar": "https://...",
        "subscribersCount": 1000
      }
    ]
  },
  "message": "Subscribed channels fetched successfully",
  "success": true
}
```

---

## Playlist Management

### 1. Create Playlist
```http
POST /api/v1/playlists
```

**Auth Required:** Yes

**Body Parameters:**
```json
{
  "name": "My Playlist",
  "description": "Playlist description"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "name": "My Playlist",
    "description": "Playlist description",
    "videos": [],
    "owner": "..."
  },
  "message": "Playlist created successfully",
  "success": true
}
```

---

### 2. Get User Playlists
```http
GET /api/v1/playlists/user/:userId
```

**Auth Required:** Yes

**URL Parameters:**
- `userId` - User ID

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "name": "Playlist Name",
      "description": "Description",
      "videos": ["videoId1", "videoId2"],
      "owner": "..."
    }
  ],
  "message": "User playlists fetched successfully",
  "success": true
}
```

---

### 3. Get Playlist by ID
```http
GET /api/v1/playlists/:playlistId
```

**Auth Required:** Yes

**URL Parameters:**
- `playlistId` - Playlist ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "name": "Playlist Name",
    "description": "Description",
    "videos": [
      {
        "_id": "...",
        "title": "Video Title",
        "thumbnail": "https://...",
        "duration": 1200
      }
    ],
    "owner": "..."
  },
  "message": "Playlist fetched successfully",
  "success": true
}
```

---

### 4. Update Playlist
```http
PATCH /api/v1/playlists/:playlistId
```

**Auth Required:** Yes (must be playlist owner)

**URL Parameters:**
- `playlistId` - Playlist ID

**Body Parameters:**
```json
{
  "name": "Updated Name",
  "description": "Updated Description"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "name": "Updated Name",
    "description": "Updated Description"
  },
  "message": "Playlist updated successfully",
  "success": true
}
```

---

### 5. Delete Playlist
```http
DELETE /api/v1/playlists/:playlistId
```

**Auth Required:** Yes (must be playlist owner)

**URL Parameters:**
- `playlistId` - Playlist ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Playlist deleted successfully",
  "success": true
}
```

---

### 6. Add Video to Playlist
```http
PATCH /api/v1/playlists/add/:videoId/:playlistId
```

**Auth Required:** Yes (must be playlist owner)

**URL Parameters:**
- `videoId` - Video ID to add
- `playlistId` - Playlist ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "name": "Playlist Name",
    "videos": ["videoId1", "videoId2", "newVideoId"]
  },
  "message": "Video added to playlist successfully",
  "success": true
}
```

---

### 7. Remove Video from Playlist
```http
PATCH /api/v1/playlists/remove/:videoId/:playlistId
```

**Auth Required:** Yes (must be playlist owner)

**URL Parameters:**
- `videoId` - Video ID to remove
- `playlistId` - Playlist ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "name": "Playlist Name",
    "videos": ["videoId1", "videoId2"]
  },
  "message": "Video removed from playlist successfully",
  "success": true
}
```

---

## Like Management

### 1. Toggle Video Like
```http
POST /api/v1/likes/toggle/v/:videoId
```

**Auth Required:** Yes

**URL Parameters:**
- `videoId` - Video ID

**Response (Liked):**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": true,
    "likeCreated": {
      "_id": "...",
      "video": "...",
      "likedBy": "..."
    }
  },
  "message": "Video liked successfully",
  "success": true
}
```

**Response (Unliked):**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": false,
    "deletedLike": {
      "_id": "...",
      "video": "...",
      "likedBy": "..."
    }
  },
  "message": "Video unliked successfully",
  "success": true
}
```

---

### 2. Toggle Comment Like
```http
POST /api/v1/likes/toggle/c/:commentId
```

**Auth Required:** Yes

**URL Parameters:**
- `commentId` - Comment ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": true,
    "likeCreated": {
      "_id": "...",
      "comment": "...",
      "likedBy": "..."
    }
  },
  "message": "Comment liked successfully",
  "success": true
}
```

---

### 3. Toggle Tweet Like
```http
POST /api/v1/likes/toggle/t/:tweetId
```

**Auth Required:** Yes

**URL Parameters:**
- `tweetId` - Tweet ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "isLiked": true,
    "likeCreated": {
      "_id": "...",
      "tweet": "...",
      "likedBy": "..."
    }
  },
  "message": "Tweet liked successfully",
  "success": true
}
```

---

### 4. Get Liked Videos
```http
GET /api/v1/likes/videos
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "title": "Liked Video Title",
      "thumbnail": "https://...",
      "duration": 1200,
      "views": 5000,
      "isPublished": true
    }
  ],
  "message": "Liked videos fetched successfully",
  "success": true
}
```

---

## Comment Management

### 1. Get Video Comments
```http
GET /api/v1/comments/:videoId
```

**Auth Required:** Yes

**URL Parameters:**
- `videoId` - Video ID

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Comments per page |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "comments": [
      {
        "_id": "...",
        "content": "Comment text",
        "video": "...",
        "owner": {
          "_id": "...",
          "username": "commenter",
          "fullname": "Commenter Name",
          "avatar": "https://..."
        },
        "createdAt": "..."
      }
    ],
    "totalComments": 50,
    "currentPage": 1,
    "totalPages": 5
  },
  "message": "Comments fetched successfully",
  "success": true
}
```

---

### 2. Add Comment
```http
POST /api/v1/comments/:videoId
```

**Auth Required:** Yes

**URL Parameters:**
- `videoId` - Video ID

**Body Parameters:**
```json
{
  "content": "Comment text here..."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "content": "Comment text here...",
    "video": "...",
    "owner": "...",
    "createdAt": "..."
  },
  "message": "Comment added successfully",
  "success": true
}
```

---

### 3. Update Comment
```http
PATCH /api/v1/comments/c/:commentId
```

**Auth Required:** Yes (must be comment owner)

**URL Parameters:**
- `commentId` - Comment ID

**Body Parameters:**
```json
{
  "content": "Updated comment text..."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "content": "Updated comment text...",
    "video": "...",
    "owner": "..."
  },
  "message": "Comment updated successfully",
  "success": true
}
```

---

### 4. Delete Comment
```http
DELETE /api/v1/comments/c/:commentId
```

**Auth Required:** Yes (must be comment owner)

**URL Parameters:**
- `commentId` - Comment ID

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Comment deleted successfully",
  "success": true
}
```

---

## Dashboard

### 1. Get Channel Stats
```http
GET /api/v1/dashboard/stats
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalVideos": 25,
    "totalViews": 50000,
    "totalSubscribers": 150,
    "totalLikes": 1200
  },
  "message": "Channel stats fetched successfully",
  "success": true
}
```

---

### 2. Get Channel Videos
```http
GET /api/v1/dashboard/videos
```

**Auth Required:** Yes

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "title": "Video Title",
      "thumbnail": "https://...",
      "duration": 1200,
      "views": 5000,
      "isPublished": true,
      "createdAt": "...",
      "likes": 150,
      "comments": 25
    }
  ],
  "message": "Channel videos fetched successfully",
  "success": true
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Common Error Responses

### Invalid Token
```json
{
  "statusCode": 401,
  "message": "Invalid access token",
  "success": false
}
```

### Resource Not Found
```json
{
  "statusCode": 404,
  "message": "Video not found",
  "success": false
}
```

### Validation Error
```json
{
  "statusCode": 400,
  "message": "Title is required",
  "success": false
}
```

### Authorization Error
```json
{
  "statusCode": 403,
  "message": "Forbidden: You can only update your own videos",
  "success": false
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider implementing rate limiting for production use.

---

## Notes for Frontend Developers

1. **Authentication Flow:**
   - Register/Login to get tokens
   - Store accessToken securely (localStorage/sessionStorage)
   - Include token in Authorization header for all protected routes
   - Implement token refresh logic when accessToken expires

2. **File Uploads:**
   - Use `multipart/form-data` for file uploads
   - Supported formats: Images (JPEG, PNG), Videos (MP4, WebM, etc.)
   - Consider file size limits (configured in Cloudinary)

3. **Pagination:**
   - Most list endpoints support pagination via `page` and `limit` query parameters
   - Default page size is typically 10 items

4. **Error Handling:**
   - Always check `success` field in response
   - Display `message` field to users for errors
   - Handle 401 errors by redirecting to login

5. **Real-time Updates:**
   - Consider implementing WebSocket or polling for real-time features like notifications
   - Current API doesn't include real-time endpoints

6. **CORS:**
   - Backend allows all origins (`*`) in development
   - Configure specific origins for production

---

**Last Updated:** December 10, 2025  
**Version:** 1.0.0  
**Author:** Agnibha Chakraborty (Nexus-Agni)