# DataDash - Public Dataset Analysis Dashboard

A full-stack web application for analyzing and visualizing public datasets with user authentication and interactive statistical tools.

## Features

- **User Authentication**: Secure registration/login with bcrypt password hashing and token-based authentication
- **Data Import**: Support for CSV files, JSON APIs, and sample datasets
- **Data Visualization**: Interactive charts (Bar, Line, Pie, Scatter) using Chart.js
- **Statistical Analysis**: Descriptive statistics, correlation analysis, distribution metrics, and outlier detection
- **User Management**: Profile management and account settings


## Technologies

**Backend**: Node.js, Express.js, bcrypt, Mongoose  
**Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js  
**DevOps**: Docker, Docker Compose

## Prerequisites

- Docker & Docker Compose (recommended) OR Node.js v18+

## Quick Start

**With Docker (Recommended):**
```bash
docker-compose up -d
# Access at http://localhost:3000
docker-compose down  # To stop
```

**Without Docker:**
```bash
cd backend && npm install && npm start
```

## API Endpoints

### Authentication
- `POST /users` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- `POST /login` - Login and receive token
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- `POST /logout` - Logout (invalidate token)

### User Management (Requires Authentication)
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user details
- `DELETE /users/:id` - Delete user account

### Health Check
- `GET /api` - API health check

## Usage

1. Open `http://localhost:3000` and create an account
2. Login with your credentials
3. Import data (CSV/JSON file, API URL, or sample dataset)
4. Generate visualizations by selecting chart type and columns
5. Navigate to Statistics page for detailed analysis

## Data Format Examples

### CSV Format
```csv
Name,Age,Salary,Department
John,25,50000,Engineering
Jane,30,65000,Marketing
Bob,35,70000,Engineering
```

### JSON Format
```json
[
  {"name": "John", "age": 25, "salary": 50000, "department": "Engineering"},
  {"name": "Jane", "age": 30, "salary": 65000, "department": "Marketing"}
]
```

## Development

**File Changes**: Frontend changes reflect immediately; backend requires restart  
**Add Dependencies**: `docker exec -it datadash-app bash` then `npm install <package>`  
**View Logs**: `docker logs -f datadash-app`

## Configuration

Create `.env` file: `PORT=3000`, `NODE_ENV=development`, `SALT_ROUNDS=10`

**Browser Support**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## Security Notes

⚠️ **Demo application** - For production: implement HTTPS, JWT verification, proper database, rate limiting, CSRF protection, input validation, and monitoring.

## Troubleshooting

- **Port in use**: `lsof -i :3000` or change port in `docker-compose.yml`
- **Container won't start**: `docker-compose down -v && docker-compose up --build`
- **Auth issues**: Clear browser cookies/localStorage

## License

This project is open source and available under the MIT License.
