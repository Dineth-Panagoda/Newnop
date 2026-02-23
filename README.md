# Issue Tracker Application

A full-stack issue tracking application built with React, Express, and MySQL. This application allows users to create, read, update, and delete issues with features like search, filtering, pagination, and export capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT-based authentication
- **Issue Management**:
  - Create new issues with title, description, priority, severity, and status
  - View all issues in a paginated list
  - Edit existing issues
  - Delete issues with confirmation
  - Mark issues as Resolved or Closed
- **Search & Filter**: Search by title/description and filter by status, priority, and severity
- **Statistics Dashboard**: View counts of issues by status (Open, In Progress, Resolved, Closed)
- **Data Export**: Export issue list to CSV or JSON format
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Tech Stack

#### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Axios** - HTTP client

#### Backend
- **Express.js** - Web framework
- **Prisma** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd issue-tracker
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `server/.env` with your database credentials:

```env
# Database configuration
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME"

# Example:
# DATABASE_URL="mysql://root:password@localhost:3306/issue_tracker"

# JWT Secret (use a strong, random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server configuration
PORT=5000
NODE_ENV=development
```

### 4. Set up the Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Optional: Open Prisma Studio to view your database
npm run prisma:studio
```

### 5. Frontend Setup

```bash
# Navigate to client directory (from root)
cd ../client

# Install dependencies
npm install
```

## 🚀 Running the Application

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
issue-tracker/
├── client/                   # Frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/     # Common components (Button, Input, etc.)
│   │   │   └── issues/     # Issue-specific components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux store and slices
│   │   │   ├── store.js    # Redux store configuration
│   │   │   └── slices/     # Redux slices (auth, issues)
│   │   ├── styles/         # Global styles
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Backend application
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── routes/             # API routes
│   │   ├── auth.js        # Authentication routes
│   │   └── issues.js      # Issue CRUD routes
│   ├── middleware/         # Express middleware
│   │   └── auth.js        # JWT authentication middleware
│   ├── server.js          # Express server
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Issues (All require authentication)
- `GET /api/issues` - Get all issues (with pagination, search, filters)
- `GET /api/issues/stats` - Get issue statistics by status
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Query Parameters for GET /api/issues
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for title/description
- `status` - Filter by status (Open, InProgress, Resolved, Closed)
- `priority` - Filter by priority (Low, Medium, High, Critical)
- `severity` - Filter by severity (Low, Medium, High, Critical)

## 🎨 Key Features Explained

### Authentication
- Uses JWT tokens for stateless authentication
- Passwords are hashed using bcrypt before storage
- Token is stored in localStorage and sent with each API request
- Protected routes redirect to login if user is not authenticated

### Redux State Management
- **Auth Slice**: Manages user authentication state
- **Issues Slice**: Manages issues, filters, pagination, and statistics
- Uses Redux Toolkit for simplified Redux logic
- Async operations handled with createAsyncThunk

### Search & Filter
- Search input is debounced (500ms delay) to optimize API calls
- Multiple filters can be applied simultaneously
- Filters persist in Redux state

### Pagination
- Server-side pagination for better performance
- Shows current page, total pages, and total count
- Next/Previous navigation

### Export Functionality
- Export current issue list to CSV or JSON
- Downloads file directly to user's computer
- Includes all issue fields

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection
- **CORS Configuration**: Configured for specific origins

## 🧪 Testing the Application

### Manual Testing Steps

1. **Register a new user**
   - Go to `/register`
   - Create an account with email and password

2. **Login**
   - Login with your credentials
   - You should be redirected to the dashboard

3. **Create an issue**
   - Click "Create Issue" button
   - Fill in the form and submit

4. **View issues**
   - See the issue in the dashboard
   - Check status counts update correctly

5. **Search and filter**
   - Use search bar to find issues
   - Apply status/priority/severity filters

6. **Edit an issue**
   - Click on an issue to view details
   - Click "Edit" and modify fields
   - Save changes

7. **Change status**
   - Mark issue as Resolved or Closed
   - Confirm the action in modal

8. **Delete an issue**
   - Click "Delete Issue"
   - Confirm deletion in modal

9. **Export data**
   - Click "Export CSV" or "Export JSON"
   - File should download automatically

## 🚢 Deployment

### Backend Deployment (Railway)

1. Create account on [Railway](https://railway.app)
2. Create a new project
3. Add MySQL database service
4. Add environment variables:
   - `DATABASE_URL` (from Railway MySQL service)
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV=production`
5. Deploy from GitHub repository

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `client`
4. Add environment variable:
   - `VITE_API_URL` (backend URL from Railway)
5. Deploy

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-secret-key"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (if needed)
```env
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Database connection issues
- Verify MySQL is running
- Check DATABASE_URL format
- Ensure database exists
- Run migrations: `npm run prisma:migrate`

### Frontend not connecting to backend
- Check backend is running on correct port
- Verify CORS settings in server.js
- Check API proxy in vite.config.js

### Authentication issues
- Clear localStorage and try logging in again
- Verify JWT_SECRET is set correctly
- Check token expiration (default: 7 days)

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)

## 👤 Author

Your Name - Assignment for NewNop

## 📄 License

This project is created as part of a job application assignment.
