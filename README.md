# CivicPulse

A civic issue reporting platform where citizens can report local problems (potholes, broken streetlights, garbage, graffiti, etc.) and track their resolution, while admins manage and update issue statuses in one place.

## Live Demo
https://civic-pulse-lac.vercel.app/

## Demo Credentials
This app uses simplified role-based demo login (not full account creation) for demo purposes:

| Role    | Password     |
|---------|--------------|
| Citizen | `citizen123` |
| Admin   | `admin123`   |

> ⚠️ Note: These are intentionally simple, hardcoded demo credentials for showcasing functionality. A production version would use per-user email/password authentication with proper validation.

## Features

**Citizen**
- Log in and view the Community Dashboard
- Report new issues with category, title, description, and location
- Browse and filter issues by status and type
- Sort by top-voted or newest

**Admin**
- Log in to a dedicated Admin Panel
- View real-time counts of Reported / In Progress / Resolved issues
- Update the status of any reported issue instantly

## Tech Stack
- **Frontend:** React (Vite), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT-based session handling
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Getting Started Locally

```bash
# Clone the repo
git clone https://github.com/ChristinaPhoebe/CivicPulse.git
cd CivicPulse

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Set up environment variables
# Create a .env file in /server with:
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_jwt_secret
# CLIENT_URL=http://localhost:5173

# Run both server and client concurrently (from root)
cd ..
npm run dev
```

Server runs on `http://localhost:5000`, client on `http://localhost:5173`.
