# Use Node.js LTS version
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application
COPY backend/src ./src

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/server.js"]
