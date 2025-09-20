# 64
<p align="center">
  <img src="https://socialify.git.ci/AnmolTutejaGithub/64/image?font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Floating+Cogs&pulls=1&stargazers=1&theme=Dark" alt="64" />
</p>
<p align="center">
  <a href="https://hits.sh/github.com/AnmolTutejaGitHub/64/">
    <img src="https://hits.sh/github.com/AnmolTutejaGitHub/64.svg?style=plastic&color=0077bf" alt="Hits"/>
  </a>
</p>

### Introduction 
**64** is a real-time multiplayer chess platform where players can compete in various modes (Bullet, Blitz, and Rapid). 
The app allows user to play chess game with other players and with world's best chess engine (stockfish)

### Setup and Installation 
#### Pre-Requisities     
- Node.js
- Redis
- MongoDB (local or cloud-based,like MongoDB Atlas)
- npm or yarn for package management

#### Installation
1. Clone the repository:   
```bash
git clone https://github.com/AnmolTutejaGitHub/64
cd 64
```
2. Install dependencies for both the client and server:
```bash
# Navigate to server and install
cd server
npm install

# Navigate to client and install
cd ../client
npm install
```

3. Set up Environment Variables: See `env.example` for required variables and setup.    

4. Run The Application:   
```bash
# In the client folder
npm run dev

# In the server folder
npm run start:main
npm run start:ws
npm run start:stockfish
npm run start:microservice:dbupdates
```

### Environment Variables
The project relies on several environment variables. Create a .env file in both the server and client directories with the following variables:         
##### For Server: 
```bash
NODEMAIL_APP_PASSWORD=YOUR_NODEMAIL_APP_PASSWORD
NODEMAILER_MAIL=YOUR_NODEMAIL_EMAIL
MONGODB_URL="mongodb://localhost:27017"
JWT_TOKEN_SECRET=YOUR_JWT_SECRET_1
JWT_TOKEN_SIGNUP_MAIL_SECRET=YOUR_JWT_SECRET_2
JWT_RESET_PASSWORD_SECRET=YOUR_JWT_SECRET_3
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://localhost:6379"
STOCKFISH_EMAIL=STOCKFISH_ACCOUNT_EMAIL_ID # stockfish is treated as a user 
STOCKFISH_PASSWORD=STOCKFISH_ACCOUNT_PASSWORD
```

##### For Client:
```bash
VITE_API_URL="http://localhost:8080"
VITE_GAME_SERVER_API_URL="http://localhost:9090"
VITE_STOCKFISH_SERVER_API_URL="http://localhost:8081"
```

### Tech Stack

#### Frontend
- **React**: For building a responsive and dynamic user interface.
- **React Router**: For handling routing in the single-page application.
- **Zustand**: Lightweight state management to handle user and session data.
- **Tailwind CSS**: For styling the application with a focus on customization and a responsive layout.
- **React Hot Toast**: For displaying user-friendly notifications.
- **React Chessboard**: For displaying chessboard.

#### Backend
- **Node.js**: JavaScript runtime used to build the server-side of the application.
- **Express.js**: Web framework for building RESTful APIs and handling middleware.
- **MongoDB**: NoSQL database for storing user and transaction data.
- **Mongoose**: ODM for MongoDB, providing schema and data validation.
- **JWT (JSON Web Tokens)**: For secure user authentication and session management.
- **Nodemailer**: For sending email notifications and handling email verification.
- **Redis** : For cache and storing game state temporarily.
- **Axios**: For handling HTTP requests in API calls.
- **chess.js** : For chess move validation
- **Stockfish** : To get best move in a chess position.

#### Security and Authorization
- **bcrypt**: For hashing user passwords to enhance security.
- **JWT Authentication**: For secure, token-based user authentication.
- **Environment Variables**: Sensitive information is stored in environment variables using .env files for security.

#### Authentication and Authorization
- **Signup & Login**: Users must sign up and log in to access most features.
- **JWT**: JSON Web Token (JWT) is used for user sessions.
- **Protected Routes**: API endpoints require a valid token in the Authorization header.
- **Email Verification**: After signup, users must verify their email before accessing their dashboard.

#### Backend Architecture
- **Main Server**: Handles account creation , sending mails , initializing games
- **Microservices** : 
    - **Game Server** : game play logic
    - **Stockfish Server** : Server creating a stockfish instance and finding best move in a position
    - **Batch update microservice** : updates the database in batch (updating game state to db)

#### Frontend Architecture
The frontend of Payzoid is built with React and React Router for navigation. Key components include:

- **State Management**: Using Zustand for user state.
- **Page Components**: Organized under src/pages/ for each route.
- **ProtectedRoute**: Custom wrappers to secure specific routes.
- **Toasts**: Notifications for actions using react-hot-toast.

### Changelog
Refer to [CHANGELOG](CHANGELOG.md) for version history and updates.

### Version 2 Updates : 
Ref to [CHALLENGES](Challenges.md) to see what's coming up in V2.

### Contributing
We appreciate your interest in contributing to 64! Your contributions help us improve and grow. Please feel free to submit pull requests, report issues, or suggest new features. Your feedback and participation are highly valued as we continue to develop and enhance the platform.

### License
64 is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
