# Dockerfile — Node app
FROM node:18-alpine


# Create app directory
WORKDIR /usr/src/app


# Copy package files first (leverage layer cache)
COPY package*.json ./


# Install dependencies (change to `npm ci` if you use package-lock.json and want reproducible installs)
RUN npm install --production


# Copy rest of app
COPY . .


# Set env (optional)
ENV NODE_ENV=production


# App listens on 3000 in server.js
EXPOSE 3000


# Start the app
CMD ["node", "server.js"]