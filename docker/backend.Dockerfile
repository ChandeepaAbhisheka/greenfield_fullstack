FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY backend/ .

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "server.js"]