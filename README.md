# Mini Drive - Secure File Management System

A production-grade MERN stack application for secure file storage, management, and sharing. Built with scalability and performance in mind.

## Features

- **Authentication**: JWT-based secure login/register with Role-Based Access Control (User/Admin).
- **File Management**:
    - Drag & drop uploads with progress bar.
    - Automatic image optimization (WebP) via Cloudinary.
    - Soft delete and permanent delete options.
    - Pagination and search/filter capabilities.
- **Admin Panel**: Global oversight of users and files, moderation capabilities.
- **Performance**: Lazy loading, skeleton loaders, and efficient database indexing.
- **Security**: Rate limiting, Helmet headers, CORS, and sanitization.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express, MongoDB.
- **Services**: Cloudinary (Storage), JWT (Auth), Bcrypt (Security).

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas URI
- Cloudinary Account

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` with:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Start the app:
```bash
npm run dev
```

## Deployment Guide

### Backend (Render)
1. Link your repo to Render.
2. Root Directory: `backend`.
3. Build Command: `npm install`.
4. Start Command: `node server.js`.
5. Add Environment Variables from `.env`.

### Frontend (Vercel)
1. Link your repo to Vercel.
2. Root Directory: `frontend`.
3. Build Command: `vite build`.
4. Output Directory: `dist`.
5. Add Env Var: `VITE_API_URL` (your Render backend URL).

## API Documentation

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Files
- `POST /api/files/upload` - Upload file (Multipart)
- `GET /api/files?page=1` - List user files
- `DELETE /api/files/:id` - Soft delete file

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/files` - List all files
- `DELETE /api/admin/files/:id` - Moderate/Delete file
