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
