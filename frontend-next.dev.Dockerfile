FROM node:20-alpine

WORKDIR /app

# Install dependencies only when needed
COPY frontend-next/package*.json ./
RUN npm install

# Copy all files
COPY frontend-next .

# Create .next directory with proper permissions
RUN mkdir -p .next && chmod -R 777 .next

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
ENV NEXT_TELEMETRY_DISABLED 1

# Set polling environment variables for hot reload
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

# Development command with docker-specific script
CMD ["npm", "run", "dev:docker"]