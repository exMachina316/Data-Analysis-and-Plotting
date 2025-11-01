# DataDash - Public Dataset Analysis Dashboard

A full-stack web application for analyzing and visualizing public datasets with user authentication.

## Project Structure

```
InternetWebP/
├── backend/                 # Backend Node.js/Express server
│   ├── src/
│   │   ├── server.js       # Main Express server with API routes
│   │   └── users.json      # User data storage (JSON file)
│   ├── package.json        # Backend dependencies
│   └── config/             # Configuration files
│
├── frontend/               # Frontend static files
│   ├── html/              # HTML pages
│   │   ├── index.html     # Landing page
│   │   ├── dashboard.html # Main dashboard
│   │   ├── login.html     # Login page
│   │   ├── signup.html    # Registration page
│   │   └── statistics.html# Statistics page
│   ├── css/               # Stylesheets
│   │   ├── landing.css    # Landing page styles
│   │   └── styles.css     # Main application styles
│   └── js/                # JavaScript files
│       ├── script.js      # Dashboard functionality
│       ├── statistics.js  # Statistics page logic
│       └── auth.js        # Authentication logic
│
├── scripts/               # Utility scripts
│   ├── start.sh          # Production startup script
│   ├── start-dev.sh      # Development startup script
│   └── stop.sh           # Stop script
│
├── Dockerfile            # Docker container configuration
├── docker-compose.yml    # Docker Compose configuration
├── .dockerignore         # Docker ignore patterns
└── README.md            # This file
```

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **Dataset Import**: Load CSV or JSON data for analysis
- **Data Visualization**: Interactive charts using Chart.js
- **Statistical Analysis**: Built-in statistical calculations
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Docker and Docker Compose
- OR Node.js v18+ (if running without Docker)

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t datadash:latest .

# Run the container
docker run -d \
    --name datadash-app \
    -p 3000:3000 \
    -v $(pwd)/backend:/app \
    -v /app/node_modules \
    -v $(pwd)/frontend:/app/public \
    datadash:latest

# Stop and remove
docker stop datadash-app && docker rm datadash-app
```

## Running Without Docker

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Server will run on http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /users` - Register a new user
- `POST /login` - Login and receive token
- `POST /logout` - Logout (invalidate token)

### User Management (Requires Authentication)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user details
- `DELETE /users/:id` - Delete user

### Health Check
- `GET /api` - API health check

## Usage

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - You'll see the landing page with information about DataDash

2. **Create an Account**
   - Click "Sign Up" and create a new account
   - Fill in username, email, and password

3. **Login**
   - Use your credentials to log in
   - You'll receive an authentication token

4. **Use the Dashboard**
   - Import CSV or JSON datasets
   - Select variables for visualization
   - View interactive charts and statistics

## Development

### File Watching
The development setup uses volume mounts, so changes to files are reflected immediately:
- Frontend files: Edit in `frontend/` directory
- Backend files: Edit in `backend/src/` directory (requires server restart)

### Adding Dependencies

```bash
# Enter the running container
docker exec -it datadash-app bash

# Install new package
npm install <package-name>

# Or from host machine
cd backend && npm install <package-name>
```

### Debugging

```bash
# View application logs
docker logs -f datadash-app

# Enter container shell
docker exec -it datadash-app bash

# Check if server is running
curl http://localhost:3000/api
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
SALT_ROUNDS=10
```

### Port Configuration
To change the port, modify:
1. `docker-compose.yml` - ports section
2. `Dockerfile` - EXPOSE directive
3. Scripts in `scripts/` directory

## Security Notes

⚠️ **This is a demonstration application**

For production use, implement:
- HTTPS/TLS encryption
- Proper JWT token verification
- Database instead of JSON file storage
- Rate limiting
- CSRF protection
- Input validation and sanitization
- Secure session management
- Environment variable configuration
- Logging and monitoring

## Technologies Used

### Backend
- Node.js
- Express.js
- bcrypt (password hashing)
- crypto (token generation)

### Frontend
- Vanilla JavaScript
- Chart.js (data visualization)
- HTML5/CSS3

### DevOps
- Docker
- Docker Compose

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Or
sudo netstat -nlp | grep :3000

# Kill the process or change the port in configuration
```

### Permission Issues with Docker
```bash
# Run with sudo or add user to docker group
sudo usermod -aG docker $USER
# Then logout and login again
```

### Container Won't Start
```bash
# Check logs
docker logs datadash-app

# Remove old containers and rebuild
docker rm -f datadash-app
docker-compose down -v
docker-compose up --build
```

### Cannot Access from Browser
- Check if container is running: `docker ps`
- Verify port mapping: `docker port datadash-app`
- Check firewall settings
- Try accessing `http://localhost:3000` or `http://127.0.0.1:3000`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Author

Your Name

## Acknowledgments

- Chart.js for visualization library
- Express.js community
- Node.js team
