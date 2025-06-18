FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend-next/package*.json ./
RUN npm ci --only=production

# Copy all files
COPY frontend-next .

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]